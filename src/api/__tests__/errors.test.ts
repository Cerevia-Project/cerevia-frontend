import { describe, expect, it } from "vitest";
import {
  ApiError,
  errorMessage,
  errorRequestId,
  fieldErrorMap,
  toApiError,
} from "@/api/errors";

function responseOf(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("toApiError", () => {
  it("carries problem details through verbatim", async () => {
    const error = await toApiError(
      responseOf(403, {
        type: "https://cerevia.dev/errors/forbidden",
        title: "Forbidden",
        status: 403,
        code: "FORBIDDEN",
        detail: "Missing permission: actions:approve",
        requestId: "req_123",
      }),
    );

    expect(error.code).toBe("FORBIDDEN");
    expect(error.detail).toBe("Missing permission: actions:approve");
    expect(error.requestId).toBe("req_123");
    expect(error.isForbidden).toBe(true);
  });

  it("falls back to status-derived copy when the body is not problem details", async () => {
    const error = await toApiError(responseOf(404, { message: "nope" }));

    expect(error.code).toBe("NOT_FOUND");
    expect(error.isNotFound).toBe(true);
    expect(error.detail).toMatch(/does not exist/i);
  });

  it("survives a body that is not JSON at all", async () => {
    const error = await toApiError(new Response("<html>502</html>", { status: 502 }));

    expect(error.status).toBe(502);
    expect(error.code).toBe("SERVER_ERROR");
    expect(error.isRetryable).toBe(true);
  });

  it("treats 401 as unauthenticated whatever the code says", async () => {
    const error = await toApiError(responseOf(401, { code: "SESSION_GONE", status: 401 }));

    expect(error.isUnauthenticated).toBe(true);
  });

  it("marks 4xx other than 429 as not retryable", async () => {
    const forbidden = await toApiError(responseOf(403));
    const rateLimited = await toApiError(responseOf(429));

    expect(forbidden.isRetryable).toBe(false);
    expect(rateLimited.isRetryable).toBe(true);
  });

  it("maps 415 to the unsupported-file-type code", async () => {
    const error = await toApiError(responseOf(415));

    expect(error.code).toBe("UNSUPPORTED_FILE_TYPE");
  });
});

describe("error helpers", () => {
  it("exposes field errors as a map for form binding", () => {
    const error = new ApiError({
      status: 400,
      code: "VALIDATION_FAILED",
      detail: "Invalid",
      fieldErrors: [
        { field: "email", message: "Must be an email address" },
        { field: "password", message: "Required" },
      ],
    });

    expect(fieldErrorMap(error)).toEqual({
      email: "Must be an email address",
      password: "Required",
    });
  });

  it("returns an empty map for anything that is not an ApiError", () => {
    expect(fieldErrorMap(new Error("boom"))).toEqual({});
    expect(errorRequestId(new Error("boom"))).toBeUndefined();
  });

  it("reads a message off any thrown value", () => {
    expect(errorMessage(new Error("boom"))).toBe("boom");
    expect(errorMessage("not an error")).toMatch(/unexpected/i);
  });
});

describe("ApiError classification", () => {
  it("separates a CSRF rejection from a permission denial, both 403", () => {
    const csrf = new ApiError({
      status: 403,
      code: "FORBIDDEN",
      detail: "Invalid or missing CSRF token",
    });
    const permission = new ApiError({
      status: 403,
      code: "FORBIDDEN",
      detail: "Missing permission: actions:approve",
    });

    expect(csrf.isForbidden).toBe(true);
    expect(permission.isForbidden).toBe(true);
    // The client distinguishes them by the detail, so only one is retried.
    expect(/csrf/i.test(csrf.detail)).toBe(true);
    expect(/csrf/i.test(permission.detail)).toBe(false);
  });

  it("defaults the title to the code when the server sent none", () => {
    const error = new ApiError({ status: 500, code: "SERVER_ERROR", detail: "boom" });

    expect(error.title).toBe("SERVER_ERROR");
  });
});
