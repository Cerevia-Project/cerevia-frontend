/**
 * Feature flags for Cerevia frontend architecture
 */

export const FEATURE_FLAGS = {
  cytoscapeStreaming: true,
  falkorDbDirectConnection: false, // UI consumes mock or REST client
  realtimeChatSse: true,
  advancedRiskDetection: true,
  multiTenantAdmin: true,
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return FEATURE_FLAGS[flag] ?? false;
}
