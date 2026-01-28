
export const DEVICE_TYPES = [
  { type: 'Mobile', width: 375, height: 667, label: 'iPhone SE' },
  { type: 'Mobile', width: 390, height: 844, label: 'iPhone 12' },
  { type: 'Tablet', width: 768, height: 1024, label: 'iPad Mini' },
  { type: 'Tablet', width: 820, height: 1180, label: 'iPad Air' },
  { type: 'Laptop', width: 1280, height: 800, label: 'MacBook Air' },
  { type: 'Desktop', width: 1920, height: 1080, label: 'Desktop 1080p' },
] as const;

export const LOCATIONS = [
  // USA
  { city: "New York", state: "NY", country: "USA", tz: "America/New_York" },
  { city: "Los Angeles", state: "CA", country: "USA", tz: "America/Los_Angeles" },
  { city: "Chicago", state: "IL", country: "USA", tz: "America/Chicago" },
  { city: "Houston", state: "TX", country: "USA", tz: "America/Chicago" },
  { city: "Miami", state: "FL", country: "USA", tz: "America/New_York" },
  { city: "San Francisco", state: "CA", country: "USA", tz: "America/Los_Angeles" },
  { city: "Seattle", state: "WA", country: "USA", tz: "America/Los_Angeles" },
  // Europe
  { city: "London", state: "UK", country: "UK", tz: "Europe/London" },
  { city: "Paris", state: "FR", country: "France", tz: "Europe/Paris" },
  { city: "Berlin", state: "DE", country: "Germany", tz: "Europe/Berlin" },
  { city: "Madrid", state: "ES", country: "Spain", tz: "Europe/Madrid" },
  { city: "Rome", state: "IT", country: "Italy", tz: "Europe/Rome" },
  { city: "Amsterdam", state: "NL", country: "Netherlands", tz: "Europe/Amsterdam" },
  { city: "Stockholm", state: "SE", country: "Sweden", tz: "Europe/Stockholm" },
] as const;

export interface Screen {
  id: number;
  deviceType: string;
  city: string;
  state: string;
  width: number;
  height: number;
  userAgent: string;
  url: string | null;
  isMuted: boolean | null;
}
