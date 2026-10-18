/**
 * Module augmentation for TanStack Query metadata.
 *
 * `silentError` opts a mutation out of the global error toast when the screen
 * renders the failure itself (login, inline forms).
 */

import "@tanstack/react-query";

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      silentError?: boolean;
    };
    queryMeta: {
      silentError?: boolean;
    };
  }
}
