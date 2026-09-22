export const PLATFORMS = ["meesho", "flipkart", "amazon", "other"] as const;

export type StorePlatform = (typeof PLATFORMS)[number];
