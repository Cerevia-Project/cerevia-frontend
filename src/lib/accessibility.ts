/**
 * Accessibility helpers for Cerevia workspace
 */

export function handleKeyboardActivation(
  event: React.KeyboardEvent,
  action: () => void
) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    action();
  }
}
