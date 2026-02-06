/**
 * Region Environment Configuration
 * Creates complete region environment for browser - geolocation, language, ads, etc.
 */

export type Region = "US" | "FR" | "DE" | "UK" | "CA" | "AU" | "IN" | "JP" | "BR";

interface RegionEnvironment {
  region: Region;
  language: string;
  locale: string;
  timezone: string;
  geolocation: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  userAgent: string;
  referrer: string;
  country: string;
  currency: string;
  adPreferences: {
    language: string;
    region: string;
    currency: string;
  };
}

const REGION_CONFIGS: Record<Region, RegionEnvironment> = {
  US: {
    region: "US",
    language: "en",
    locale: "en-US",
    timezone: "America/New_York",
    geolocation: {
      latitude: 40.7128,
      longitude: -74.006,
      accuracy: 100,
    },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    referrer: "https://google.com",
    country: "United States",
    currency: "USD",
    adPreferences: {
      language: "en",
      region: "US",
      currency: "USD",
    },
  },
  FR: {
    region: "FR",
    language: "fr",
    locale: "fr-FR",
    timezone: "Europe/Paris",
    geolocation: {
      latitude: 48.8566,
      longitude: 2.3522,
      accuracy: 100,
    },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    referrer: "https://google.fr",
    country: "France",
    currency: "EUR",
    adPreferences: {
      language: "fr",
      region: "FR",
      currency: "EUR",
    },
  },
  DE: {
    region: "DE",
    language: "de",
    locale: "de-DE",
    timezone: "Europe/Berlin",
    geolocation: {
      latitude: 52.52,
      longitude: 13.405,
      accuracy: 100,
    },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    referrer: "https://google.de",
    country: "Germany",
    currency: "EUR",
    adPreferences: {
      language: "de",
      region: "DE",
      currency: "EUR",
    },
  },
  UK: {
    region: "UK",
    language: "en",
    locale: "en-GB",
    timezone: "Europe/London",
    geolocation: {
      latitude: 51.5074,
      longitude: -0.1278,
      accuracy: 100,
    },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    referrer: "https://google.co.uk",
    country: "United Kingdom",
    currency: "GBP",
    adPreferences: {
      language: "en",
      region: "UK",
      currency: "GBP",
    },
  },
  CA: {
    region: "CA",
    language: "en",
    locale: "en-CA",
    timezone: "America/Toronto",
    geolocation: {
      latitude: 43.6532,
      longitude: -79.3832,
      accuracy: 100,
    },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    referrer: "https://google.ca",
    country: "Canada",
    currency: "CAD",
    adPreferences: {
      language: "en",
      region: "CA",
      currency: "CAD",
    },
  },
  AU: {
    region: "AU",
    language: "en",
    locale: "en-AU",
    timezone: "Australia/Sydney",
    geolocation: {
      latitude: -33.8688,
      longitude: 151.2093,
      accuracy: 100,
    },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    referrer: "https://google.com.au",
    country: "Australia",
    currency: "AUD",
    adPreferences: {
      language: "en",
      region: "AU",
      currency: "AUD",
    },
  },
  IN: {
    region: "IN",
    language: "en",
    locale: "en-IN",
    timezone: "Asia/Kolkata",
    geolocation: {
      latitude: 28.7041,
      longitude: 77.1025,
      accuracy: 100,
    },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    referrer: "https://google.co.in",
    country: "India",
    currency: "INR",
    adPreferences: {
      language: "en",
      region: "IN",
      currency: "INR",
    },
  },
  JP: {
    region: "JP",
    language: "ja",
    locale: "ja-JP",
    timezone: "Asia/Tokyo",
    geolocation: {
      latitude: 35.6762,
      longitude: 139.6503,
      accuracy: 100,
    },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    referrer: "https://google.co.jp",
    country: "Japan",
    currency: "JPY",
    adPreferences: {
      language: "ja",
      region: "JP",
      currency: "JPY",
    },
  },
  BR: {
    region: "BR",
    language: "pt",
    locale: "pt-BR",
    timezone: "America/Sao_Paulo",
    geolocation: {
      latitude: -23.5505,
      longitude: -46.6333,
      accuracy: 100,
    },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    referrer: "https://google.com.br",
    country: "Brazil",
    currency: "BRL",
    adPreferences: {
      language: "pt",
      region: "BR",
      currency: "BRL",
    },
  },
};

export function getRegionEnvironment(region: Region): RegionEnvironment {
  return REGION_CONFIGS[region];
}

export function setRegionEnvironment(region: Region): void {
  const env = REGION_CONFIGS[region];

  // Save to localStorage
  localStorage.setItem("region_environment", JSON.stringify(env));
  localStorage.setItem("selected_region", region);

  // Set HTML lang attribute
  document.documentElement.lang = env.locale;

  // Update meta tags
  const metaViewport = document.querySelector('meta[name="viewport"]');
  if (!metaViewport) {
    const viewport = document.createElement("meta");
    viewport.name = "viewport";
    viewport.content = "width=device-width, initial-scale=1";
    document.head.appendChild(viewport);
  }

  // Set timezone-related data
  (window as any).__REGION_ENV__ = env;

  // Update document for ads
  document.body.setAttribute("data-region", region);
  document.body.setAttribute("data-language", env.language);
  document.body.setAttribute("data-timezone", env.timezone);
  document.body.setAttribute("data-country", env.country);
  document.body.setAttribute("data-currency", env.currency);

  // Mock geolocation for ads
  if ("geolocation" in navigator) {
    const originalGetCurrentPosition = navigator.geolocation.getCurrentPosition;
    navigator.geolocation.getCurrentPosition = function (success, error, options) {
      success({
        coords: {
          latitude: env.geolocation.latitude,
          longitude: env.geolocation.longitude,
          accuracy: env.geolocation.accuracy,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      } as any);
    };
  }

  // Set headers for API calls
  const headers = {
    "Accept-Language": env.locale,
    "X-Region": region,
    "X-Country": env.country,
    "X-Currency": env.currency,
  };

  // Store headers for fetch interceptor
  (window as any).__REGION_HEADERS__ = headers;

  // Notify subscribers
  window.dispatchEvent(
    new CustomEvent("regionChanged", {
      detail: { region, environment: env },
    })
  );
}

export function getCurrentRegionEnvironment(): RegionEnvironment | null {
  const stored = localStorage.getItem("region_environment");
  return stored ? JSON.parse(stored) : null;
}

export function getCurrentRegion(): Region {
  const stored = localStorage.getItem("selected_region") as Region;
  return stored || "US";
}

// Intercept fetch to add region headers
const originalFetch = window.fetch;
window.fetch = function (...args) {
  const headers = (window as any).__REGION_HEADERS__ || {};
  const init = args[1] || {};

  return originalFetch.call(window, args[0], {
    ...init,
    headers: {
      ...headers,
      ...(init.headers || {}),
    },
  });
};
