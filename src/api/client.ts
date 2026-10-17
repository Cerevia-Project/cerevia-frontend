/**
 * Centralized API client for Cerevia
 */

import { mapHttpError, CereviaApiError } from "@/api/errors";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...rest } = options;

  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      searchParams.append(key, String(val));
    });
    url += `?${searchParams.toString()}`;
  }

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...headers,
      },
      ...rest,
    });

    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorJson = await response.json();
        errorMessage = errorJson?.error?.message || errorMessage;
      } catch {
        // Fall back to status text
      }
      throw mapHttpError(response.status, errorMessage);
    }

    return (await response.json()) as T;
  } catch (err) {
    if (err instanceof CereviaApiError) {
      throw err;
    }
    throw new CereviaApiError(
      err instanceof Error ? err.message : "Network failure while communicating with Cerevia API.",
      "NETWORK_FAILURE",
      0
    );
  }
}
