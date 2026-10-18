"use client";

import * as React from "react";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/api/errors";

/**
 * Server state lives here. Query failures are surfaced by the screen that
 * owns them (skeleton → error state), so the global handler only toasts
 * failed *mutations*, which have no place of their own to render.
 */
function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error instanceof ApiError) return error.isRetryable && failureCount < 2;
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
    queryCache: new QueryCache(),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        // A mutation that renders its own error state opts out with this flag.
        if (mutation.meta?.silentError) return;
        const requestId = error instanceof ApiError ? error.requestId : undefined;
        toast.error(error instanceof Error ? error.message : "The request failed.", {
          description: requestId ? `Request ID ${requestId}` : undefined,
        });
      },
    }),
  });
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // One client per browser session; never shared across server requests.
  const [client] = React.useState(createQueryClient);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
