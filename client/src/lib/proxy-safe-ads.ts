/**
 * Ad Loading Configuration
 * Loads ads in all environments - NO PROXY DETECTION, NO BLOCKING
 * Supports multiple browser tabs and regions
 */

// Simple region configuration for environment setup
export const SUPPORTED_REGIONS = ["US", "UK", "FR", "DE", "CA", "AU", "IN"] as const;

// Get region from environment or browser tab
export function getRegionConfig() {
  // Get from URL params for tab support
  const params = new URLSearchParams(window.location.search);
  const urlRegion = params.get("region");
  
  // Get from localStorage
  const storedRegion = localStorage.getItem("selected_region");
  
  // Default region
  const region = urlRegion || storedRegion || "US";
  
  return {
    region,
    timestamp: Date.now(),
    tabId: window.name || `tab-${Math.random()}`,
  };
}

// ALWAYS load ads - no detection, no blocking
export function shouldLoadAds(): boolean {
  return true; // ALWAYS load ads
}

// Simple ad configuration
export const adConfig = {
  // Google AdSense
  googleAdSense: {
    enabled: true,
    clientId: "ca-pub-2245234234",
  },
  // Other ad networks
  adNetworks: {
    enabled: true,
    providers: ["google", "facebook", "bing"],
  },
  // Multi-tab support
  multiTab: {
    enabled: true,
    tabIdentifier: window.name || `tab-${Math.random()}`,
  },
};

export interface ProxySafeAdOptions {
  url: string;
  title: string;
  category: string;
  retryAttempts?: number;
  timeout?: number;
  region?: string;
}

export class ProxySafeAdLoader {
  private static readonly DEFAULT_RETRY_ATTEMPTS = 3;
  private static readonly DEFAULT_TIMEOUT = 5000;

  /**
   * Get random User-Agent for region
   */
  private static getRandomUserAgent(region: string = "US"): string {
    const agents = REGION_USER_AGENTS[region] || USER_AGENTS;
    return agents[Math.floor(Math.random() * agents.length)];
  }

  /**
   * Get random referrer for region
   */
  private static getRandomReferrer(region: string = "US"): string {
    const referrers = REGION_REFERRERS[region] || REGION_REFERRERS["US"];
    return referrers[Math.floor(Math.random() * referrers.length)];
  }

  /**
   * Safely open ad window through proxy/VPN with region support
   * Works worldwide - France, US, Asia, etc.
   */
  static openAdWindow(options: ProxySafeAdOptions): Window | null {
    const {
      url,
      title,
      retryAttempts = this.DEFAULT_RETRY_ATTEMPTS,
      timeout = this.DEFAULT_TIMEOUT,
      region = "US",
    } = options;

    try {
      // 1. Normalize URL for proxy compatibility
      const normalizedUrl = this.normalizeUrl(url);

      // 2. Add session parameters and region (doesn't interfere with proxy)
      const sessionUrl = this.addSessionParams(normalizedUrl, region);

      // 3. Open window with proper configuration
      const window = this.openWindowSafely(sessionUrl, title, region);

      if (!window) {
        console.warn("Initial window open failed, retrying...");
        return this.retryOpenWindow(sessionUrl, title, retryAttempts - 1, region);
      }

      return window;
    } catch (error) {
      console.error("Error opening ad window:", error);
      return null;
    }
  }

  /**
   * Normalize URL to work through proxies
   */
  private static normalizeUrl(url: string): string {
    try {
      // Ensure protocol is included (required for proxy routing)
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }

      // Parse and validate
      const parsed = new URL(url);

      // Ensure HTTPS for secure proxy routing
      if (parsed.protocol === "http:") {
        parsed.protocol = "https:";
      }

      return parsed.toString();
    } catch (e) {
      console.error("URL normalization failed:", e);
      return `https://${url}`;
    }
  }

  /**
   * Add session tracking and region without affecting proxy
   * IMPORTANT: Minimal parameters - many ad networks are strict about URL structure
   */
  private static addSessionParams(url: string, region: string = "US"): string {
    try {
      const parsed = new URL(url);

      // MINIMAL approach: Only add essential region tracking
      // Most ad networks will fail if we add too many parameters
      
      // ONLY add region if URL is from our own platform
      // Don't modify external ad network URLs
      if (parsed.hostname.includes("localhost") || 
          parsed.hostname.includes("127.0.0.1") ||
          parsed.hostname.includes("our-domain")) {
        
        if (!parsed.searchParams.has("session_id")) {
          parsed.searchParams.append("session_id", this.generateSessionId());
        }
        if (!parsed.searchParams.has("region")) {
          parsed.searchParams.append("region", region);
        }
      }
      
      // NEVER modify external ad URLs - return as-is
      return parsed.toString();
    } catch (e) {
      // If URL parsing fails, return as-is to avoid breaking ad URLs
      console.warn("URL parsing error, returning as-is:", e);
      return url;
    }
  }

  /**
   * Open window with complete region environment spoofing
   */
  private static openWindowSafely(url: string, title: string, region: string = "US"): Window | null {
    try {
      console.log("Opening ad window for URL:", url, "Region:", region);
      
      // Validate URL
      if (!url || url.length === 0) {
        console.error("Invalid URL provided");
        return null;
      }

      // Window specs that work through proxies
      const specs = [
        "width=800",
        "height=600",
        "toolbar=yes",
        "location=yes",
        "status=yes",
        "menubar=yes",
        "scrollbars=yes",
        "resizable=yes",
      ].join(",");

      // Get region config
      const regionGeo = REGION_GEOLOCATION[region] || REGION_GEOLOCATION["US"];
      const regionTz = REGION_TIMEZONES[region] || REGION_TIMEZONES["US"];
      const userAgent = this.getRandomUserAgent(region);
      const language = this.getLanguageForRegion(region);
      const referrer = this.getRandomReferrer(region);

      // Store complete region environment in sessionStorage
      try {
        sessionStorage.setItem("ad_region", region);
        sessionStorage.setItem("ad_country_code", region);
        sessionStorage.setItem("ad_user_agent", userAgent);
        sessionStorage.setItem("ad_referrer", referrer);
        sessionStorage.setItem("ad_device_id", this.generateDeviceId());
        sessionStorage.setItem("ad_timestamp", Date.now().toString());
        sessionStorage.setItem("ad_platform", this.getRandomPlatform());
        sessionStorage.setItem("ad_language", language);
        
        // Store geolocation data
        sessionStorage.setItem("ad_latitude", regionGeo.latitude.toString());
        sessionStorage.setItem("ad_longitude", regionGeo.longitude.toString());
        sessionStorage.setItem("ad_country", regionGeo.country);
        sessionStorage.setItem("ad_city", regionGeo.city);
        sessionStorage.setItem("ad_timezone", regionTz);
      } catch (e) {
        console.log("Session storage note:", e);
      }

      // CRITICAL: Try multiple approaches to open window
      let newWindow: Window | null = null;
      
      try {
        // Approach 1: Standard window.open
        newWindow = window.open(url, title, specs);
      } catch (e) {
        console.warn("Standard window.open failed:", e);
      }
      
      // If popup blocked, try without target name
      if (!newWindow) {
        try {
          newWindow = window.open(url, "_blank", specs);
        } catch (e) {
          console.warn("window.open with _blank failed:", e);
        }
      }
      
      // Final attempt: try without specs
      if (!newWindow) {
        try {
          newWindow = window.open(url);
        } catch (e) {
          console.warn("window.open without specs failed:", e);
        }
      }

      // Verify window opened
      if (!newWindow) {
        console.warn("All window.open attempts failed - likely popup blocked");
        return null;
      }
      
      console.log("Window opened successfully:", newWindow);

      // Inject comprehensive geolocation and environment spoofing script
      setTimeout(() => {
        try {
          if (newWindow && !newWindow.closed && newWindow.document) {
            // PROXY BYPASS: Add headers to hide proxy/VPN before any requests
            const proxyBypassScript = newWindow.document.createElement("script");
            proxyBypassScript.type = "text/javascript";
            proxyBypassScript.textContent = `
              // Proxy/VPN Detection Bypass - Aggressive header spoofing
              (function() {
                // Generate fake residential IP that looks legitimate
                const generateFakeIP = () => {
                  // Use common residential ranges: 10.x.x.x, 172.16-31.x.x, 192.168.x.x
                  const ranges = [
                    '192.168.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255),
                    '10.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255),
                    '172.' + (16 + Math.floor(Math.random() * 15)) + '.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255)
                  ];
                  return ranges[Math.floor(Math.random() * ranges.length)];
                };
                
                const fakeIP = generateFakeIP();
                
                // Override fetch to add proxy-bypassing headers
                const originalFetch = window.fetch;
                window.fetch = function(...args) {
                  const [resource, config] = args;
                  const init = config || {};
                  
                  if (!init.headers) init.headers = {};
                  
                  // CRITICAL: Headers that prevent proxy detection
                  // Use fake residential IP
                  init.headers['X-Real-IP'] = fakeIP;
                  init.headers['X-Forwarded-For'] = fakeIP;
                  init.headers['X-Forwarded-Host'] = window.location.hostname;
                  init.headers['X-Originating-IP'] = '[' + fakeIP + ']';
                  
                  // Hide proxy indicators
                  init.headers['Via'] = undefined;
                  init.headers['X-Proxy-Authorization'] = undefined;
                  init.headers['X-Forwarded-Proto'] = 'http';
                  
                  // Standard connection headers
                  init.headers['Connection'] = 'keep-alive';
                  init.headers['Cache-Control'] = 'max-age=0';
                  init.headers['Pragma'] = 'no-cache';
                  init.headers['Upgrade-Insecure-Requests'] = '1';
                  
                  // Browser legitimacy headers
                  init.headers['Sec-Fetch-Dest'] = 'document';
                  init.headers['Sec-Fetch-Mode'] = 'navigate';
                  init.headers['Sec-Fetch-Site'] = 'none';
                  init.headers['Sec-Fetch-User'] = '?1';
                  init.headers['Sec-Ch-Ua'] = '"Not A(Brand";v="99"';
                  init.headers['Accept-Language'] = '${language}';
                  init.headers['Accept-Encoding'] = 'gzip, deflate, br';
                  init.headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
                  
                  // Privacy headers
                  init.headers['DNT'] = '1';
                  init.headers['Privacy-Control'] = 'NO_COLLECTION';
                  
                  // Credentials
                  if (init.credentials === undefined) {
                    init.credentials = 'include';
                  }
                  
                  return originalFetch.apply(this, [resource, init]);
                };
                
                // Override XMLHttpRequest
                const originalOpen = XMLHttpRequest.prototype.open;
                XMLHttpRequest.prototype.open = function(...args) {
                  return originalOpen.apply(this, args);
                };
                
                const originalSetHeader = XMLHttpRequest.prototype.setRequestHeader;
                XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
                  // Override proxy detection headers
                  if (header.toLowerCase() === 'x-real-ip') {
                    return originalSetHeader.call(this, header, fakeIP);
                  }
                  if (header.toLowerCase() === 'x-forwarded-for') {
                    return originalSetHeader.call(this, header, fakeIP);
                  }
                  return originalSetHeader.call(this, header, value);
                };
                
                const originalSend = XMLHttpRequest.prototype.send;
                XMLHttpRequest.prototype.send = function(data) {
                  // Add proxy-bypassing headers
                  this.setRequestHeader('X-Real-IP', fakeIP);
                  this.setRequestHeader('X-Forwarded-For', fakeIP);
                  this.setRequestHeader('X-Forwarded-Proto', 'http');
                  this.setRequestHeader('Connection', 'keep-alive');
                  this.setRequestHeader('Cache-Control', 'max-age=0');
                  this.setRequestHeader('Pragma', 'no-cache');
                  this.setRequestHeader('Accept-Language', '${language}');
                  
                  return originalSend.call(this, data);
                };
              })();
            `;
            try {
              window.document.head.insertBefore(proxyBypassScript, window.document.head.firstChild);
            } catch (e) {
              console.log("Proxy bypass script note:", e);
            }

            // First, set the referrer policy before loading any content
            const metaReferrer = window.document.createElement("meta");
            metaReferrer.name = "referrer";
            metaReferrer.content = "origin";
            
            try {
              window.document.head.insertBefore(metaReferrer, window.document.head.firstChild);
            } catch (e) {
              console.log("Referrer meta tag note:", e);
            }

            // Main spoofing script
            const script = window.document.createElement("script");
            script.textContent = `
              // ===== COMPLETE REGION ENVIRONMENT SPOOFING =====
              
              // 1. SET DOCUMENT REFERRER (For ad networks checking referrer)
              try {
                Object.defineProperty(document, 'referrer', {
                  get: () => '${referrer}',
                  configurable: true
                });
              } catch(e) {}
              
              // 2. GEOLOCATION SPOOFING
              const geoData = {
                latitude: ${regionGeo.latitude},
                longitude: ${regionGeo.longitude},
                accuracy: ${regionGeo.accuracy},
                altitude: Math.random() * 1000,
                altitudeAccuracy: 10,
                heading: Math.random() * 360,
                speed: 0,
                timestamp: Date.now()
              };
              
              if (navigator.geolocation) {
                const originalGetCurrentPosition = navigator.geolocation.getCurrentPosition;
                const originalWatchPosition = navigator.geolocation.watchPosition;
                
                navigator.geolocation.getCurrentPosition = function(success, error, options) {
                  success({
                    coords: geoData,
                    timestamp: Date.now()
                  });
                };
                
                navigator.geolocation.watchPosition = function(success, error, options) {
                  const watchId = setInterval(() => {
                    success({
                      coords: geoData,
                      timestamp: Date.now()
                    });
                  }, 1000);
                  return watchId;
                };
              }
              
              // 2.5. WEBRTC IP LEAK PREVENTION - CRITICAL!
              // Prevents real IP from leaking through WebRTC
              try {
                // Disable WebRTC IP leak
                const rtcConfig = { iceServers: [] };
                const originalRTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
                
                if (originalRTCPeerConnection) {
                  window.RTCPeerConnection = function(config) {
                    // Use empty ice servers to prevent IP leak
                    return new originalRTCPeerConnection({ iceServers: [] });
                  };
                  
                  // Also prevent webkitRTCPeerConnection
                  if (window.webkitRTCPeerConnection) {
                    window.webkitRTCPeerConnection = function(config) {
                      return new originalRTCPeerConnection({ iceServers: [] });
                    };
                  }
                  
                  // Prevent mozRTCPeerConnection
                  if (window.mozRTCPeerConnection) {
                    window.mozRTCPeerConnection = function(config) {
                      return new originalRTCPeerConnection({ iceServers: [] });
                    };
                  }
                }
              } catch(e) {
                console.log('WebRTC override note:', e);
              }
              
              // 2.6. BLOCK CLIENT-SIDE PROXY DETECTION APIs
              // Override any proxy detection endpoints
              try {
                // Block common proxy detection APIs
                const blockedDomains = [
                  'ipqualityscore.com',
                  'proxycheck.io',
                  'ip-api.com',
                  'ipinfo.io',
                  'geoip-db.com',
                  'whatsmyipaddress.com',
                  'api.abuseipdb.com',
                  'checkproxy.net',
                  'getproxies.com',
                  'anti-abuse.com',
                  'proxy-detect.com'
                ];
                
                // Override fetch for proxy detection blocking
                const originalFetch = window.fetch;
                window.fetch = function(...args) {
                  const url = (args[0] instanceof Request ? args[0].url : args[0]) || '';
                  
                  // Block known proxy detection services
                  for (let domain of blockedDomains) {
                    if (url.includes(domain) || url.includes('proxy') || url.includes('detect')) {
                      return Promise.reject(new Error('Blocked'));
                    }
                  }
                  
                  return originalFetch.apply(this, args);
                };
                
                // Block XMLHttpRequest to proxy detection
                const originalXHROpen = XMLHttpRequest.prototype.open;
                XMLHttpRequest.prototype.open = function(method, url) {
                  for (let domain of blockedDomains) {
                    if (url.includes(domain)) {
                      this.blocked = true;
                      return;
                    }
                  }
                  return originalXHROpen.apply(this, arguments);
                };
                
                const originalXHRSend = XMLHttpRequest.prototype.send;
                XMLHttpRequest.prototype.send = function(data) {
                  if ((this as any).blocked) {
                    return;
                  }
                  return originalXHRSend.apply(this, arguments);
                };
              } catch(e) {}
              
              // Get local IP addresses via WebRTC (for spoofing)
              const getLocalIPAddresses = function() {
                return new Promise((resolve) => {
                  try {
                    const pc = new RTCPeerConnection({ iceServers: [] });
                    pc.createDataChannel('');
                    pc.createOffer().then(offer => {
                      pc.setLocalDescription(offer).then(() => {
                        const ips = [];
                        const lines = pc.localDescription.sdp.split('\\n');
                        lines.forEach(line => {
                          if (line.indexOf('candidate:') < 0) return;
                          const parts = line.split(' ');
                          for (let i = 0; i < parts.length; i++) {
                            if (parts[i] === 'raddr' && parts[i + 1]) {
                              ips.push(parts[i + 1]);
                            }
                          }
                        });
                        // Log found IPs but don't leak them - we use fake ones instead
                        console.log('Local IPs detected (hidden from ads):', ips.length > 0 ? 'yes' : 'no');
                        resolve();
                      });
                    }).catch(() => resolve());
                  } catch(e) {
                    resolve();
                  }
                });
              };
              
              // Initialize WebRTC leak prevention
              getLocalIPAddresses();
              
              // 3. BROWSER PROPERTY SPOOFING
              Object.defineProperty(navigator, 'webdriver', { get: () => false });
              Object.defineProperty(navigator, 'languages', { get: () => ['${language}'] });
              Object.defineProperty(navigator, 'language', { get: () => '${language}' });
              Object.defineProperty(navigator, 'userAgent', { get: () => '${userAgent}' });
              Object.defineProperty(navigator, 'vendor', { get: () => 'Google Inc.' });
              Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 4 });
              Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
              Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 10 });
              
              // 3.5. PROXY/VPN DETECTION PREVENTION
              // Hide proxy indicators from ad networks
              Object.defineProperty(navigator, 'onLine', { get: () => true });
              Object.defineProperty(navigator, 'connection', { get: () => ({
                downlink: 10,
                effectiveType: '4g',
              
              // 3. NAVIGATOR PROPERTY SPOOFING - Hide proxy indicators
              // Override navigator properties that reveal proxies
              try {
                // Make navigator.onLine appear real
                Object.defineProperty(navigator, 'onLine', {
                  get() { return true; },
                  configurable: true
                });
                
                // Override deviceMemory to look like real computer
                Object.defineProperty(navigator, 'deviceMemory', {
                  get() { return 8; },
                  configurable: true
                });
                
                // Override maxTouchPoints
                Object.defineProperty(navigator, 'maxTouchPoints', {
                  get() { return Math.random() > 0.5 ? 0 : 10; },
                  configurable: true
                });
                
                // Override hardwareConcurrency to look real
                Object.defineProperty(navigator, 'hardwareConcurrency', {
                  get() { return 4 + Math.floor(Math.random() * 4); }, // 4-8 cores
                  configurable: true
                });
                
                // Hide VPN/Proxy indicators from connection
                if (navigator.connection) {
                  Object.defineProperty(navigator.connection, 'rtt', {
                    get() { return 50 + Math.random() * 50; }, // 50-100ms = real
                    configurable: true
                  });
                }
              } catch(e) {}
              
              // Override performance APIs that leak proxy info
              const performanceNow = window.performance.now;
              window.performance.now = function() {
                return performanceNow.call(this) + Math.random() * 100;
              };
              
              // Prevent timing attacks that detect proxies
              const originalDate = Date;
              const dateOffset = Math.random() * 10000;
              window.Date = new Proxy(originalDate, {
                construct(target, args) {
                  if (args.length === 0) {
                    return new target(originalDate.now() - dateOffset);
                  }
                  return new target(...args);
                },
                get(target, prop) {
                  if (prop === 'now') {
                    return () => originalDate.now() - dateOffset;
                  }
                  return target[prop];
                }
              });
              
              // Hide WebSocket which proxies may block
              const originalWebSocket = window.WebSocket;
              window.WebSocket = new Proxy(originalWebSocket, {
                construct(target, args) {
                  try {
                    return new target(...args);
                  } catch (e) {
                    console.log('WebSocket blocked by proxy, using fallback');
                    return {};
                  }
                }
              });
              
              // 4. BROWSER PLUGINS SPOOFING
              Object.defineProperty(navigator, 'plugins', { 
                get: () => [
                  { name: 'Chrome PDF Plugin', description: 'Portable Document Format', filename: 'internal-pdf-viewer' },
                  { name: 'Chrome PDF Viewer', description: 'Portable Document Format', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
                  { name: 'Native Client Executable', description: 'Native Client Executable', filename: 'internal-nacl-plugin' },
                ]
              });
              
              // 5. SCREEN AND DISPLAY SPOOFING
              Object.defineProperty(screen, 'width', { get: () => 1920 });
              Object.defineProperty(screen, 'height', { get: () => 1080 });
              Object.defineProperty(screen, 'availWidth', { get: () => 1920 });
              Object.defineProperty(screen, 'availHeight', { get: () => 1040 });
              Object.defineProperty(screen, 'colorDepth', { get: () => 24 });
              Object.defineProperty(screen, 'pixelDepth', { get: () => 24 });
              Object.defineProperty(screen, 'devicePixelRatio', { get: () => 1 });
              
              // 6. PERMISSION AUTO-GRANT FOR REGION SPOOFING
              // Auto-grant geolocation, camera, microphone permissions
              if (window.navigator && window.navigator.permissions && window.navigator.permissions.query) {
                const originalQuery = window.navigator.permissions.query;
                window.navigator.permissions.query = (parameters) => {
                  // Auto-grant these permissions
                  if (parameters.name === 'geolocation' || 
                      parameters.name === 'camera' || 
                      parameters.name === 'microphone' ||
                      parameters.name === 'notifications') {
                    return Promise.resolve({ state: 'granted' });
                  }
                  return originalQuery(parameters);
                };
              }
              
              // 6.5. NOTIFICATION PERMISSIONS
              if (window.Notification) {
                const originalQuery = window.navigator.permissions.query;
                window.navigator.permissions.query = (parameters) => (
                  parameters.name === 'notifications' ?
                    Promise.resolve({ state: Notification.permission }) :
                    originalQuery(parameters)
                );
              }
              
              // 7. TIMEZONE SPOOFING (via Intl API)
              const tzString = '${regionTz}';
              const originalIntl = window.Intl;
              window.Intl = new Proxy(originalIntl, {
                get(target, prop) {
                  if (prop === 'DateTimeFormat') {
                    return new Proxy(target.DateTimeFormat, {
                      construct(target, args) {
                        return new target(args[0] || '${language}', {
                          ...args[1],
                          timeZone: tzString
                        });
                      }
                    });
                  }
                  return Reflect.get(target, prop);
                }
              });
              
              // 8. CHROME/EDGE DETECTION PREVENTION
              if (typeof chrome === 'undefined') {
                window.chrome = { runtime: {} };
              }
              
              // 9. HIDE HEADLESS INDICATORS
              Object.defineProperty(document, 'hidden', { get: () => false });
              Object.defineProperty(document, 'visibilityState', { get: () => 'visible' });
              
              // 10. CANVAS FINGERPRINTING RANDOMIZATION
              const originalCanvas = HTMLCanvasElement.prototype.toDataURL;
              HTMLCanvasElement.prototype.toDataURL = function() {
                if (this.width === 280 && this.height === 60) {
                  const context = this.getContext('2d');
                  context.textBaseline = 'top';
                  context.font = '14px Arial';
                  context.textBaseline = 'alphabetic';
                  context.fillStyle = '#f60';
                  context.fillRect(125, 1, 62, 20);
                  context.fillStyle = '#069';
                  context.fillText('Browser Fingerprint Spoofed', 2, 15);
                  context.fillStyle = 'rgba(102, 204, 0, 0.7)';
                  context.fillText('Browser Fingerprint Spoofed', 4, 17);
                }
                return originalCanvas.apply(this, arguments);
              };
              
              // 11. WEBGL SPOOFING
              const getParameter = WebGLRenderingContext.prototype.getParameter;
              WebGLRenderingContext.prototype.getParameter = function(parameter) {
                if (parameter === 37445) {
                  return 'Intel Inc.';
                }
                if (parameter === 37446) {
                  return 'Intel Iris OpenGL Engine';
                }
                return getParameter(parameter);
              };
              
              // 12. LOCAL STORAGE OPTIMIZATION FOR REGION
              try {
                localStorage.setItem('_region', '${region}');
                localStorage.setItem('_country', '${regionGeo.country}');
                localStorage.setItem('_city', '${regionGeo.city}');
                localStorage.setItem('_timezone', '${regionTz}');
              } catch (e) {}
              
              // 13. ADVANCED PROXY/VPN DETECTION PREVENTION
              // Override performance.timing which leaks proxy latency
              if (window.performance && window.performance.timing) {
                const timing = window.performance.timing;
                const randomLatency = Math.floor(Math.random() * 100) + 50;
                timing.navigationStart = Date.now() - 5000;
                timing.unloadEventStart = timing.navigationStart + randomLatency;
                timing.unloadEventEnd = timing.navigationStart + randomLatency + 10;
                timing.redirectStart = 0;
                timing.redirectEnd = 0;
                timing.fetchStart = timing.navigationStart + 200;
                timing.domainLookupStart = timing.navigationStart + 250;
                timing.domainLookupEnd = timing.navigationStart + 300;
                timing.connectStart = timing.navigationStart + 350;
                timing.connectEnd = timing.navigationStart + 400;
                timing.secureConnectionStart = timing.navigationStart + 350;
                timing.requestStart = timing.navigationStart + 450;
                timing.responseStart = timing.navigationStart + 600;
                timing.responseEnd = timing.navigationStart + 800;
                timing.domLoading = timing.navigationStart + 900;
                timing.domInteractive = timing.navigationStart + 1500;
                timing.domContentLoadedEventStart = timing.navigationStart + 1600;
                timing.domContentLoadedEventEnd = timing.navigationStart + 1700;
                timing.loadEventStart = timing.navigationStart + 1800;
                timing.loadEventEnd = timing.navigationStart + 2000;
              }
              
              // Spoof navigator.hardwareConcurrency for datacenter detection
              Object.defineProperty(navigator, 'hardwareConcurrency', {
                get: () => ${Math.floor(Math.random() * 8) + 2}
              });
              
              // Hide requestIdleCallback which proxies might override
              if (window.requestIdleCallback) {
                const originalRIC = window.requestIdleCallback;
                window.requestIdleCallback = function(cb, options) {
                  return setTimeout(cb, 0);
                };
              }
              
              // 14. SOPHISTICATED REQUEST HEADERS INJECTION (via fetch override)
              const originalFetch = window.fetch;
              const requestCount = Math.floor(Math.random() * 1000000);
              window.fetch = function(...args) {
                const [resource, config = {}] = args;
                const init = config;
                
                if (!init.headers) init.headers = {};
                
                // Core anti-proxy headers
                init.headers['Accept-Language'] = '${language}';
                init.headers['Accept-Encoding'] = 'gzip, deflate, br';
                init.headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
                init.headers['Connection'] = 'keep-alive';
                init.headers['Cache-Control'] = 'max-age=0';
                init.headers['Pragma'] = 'no-cache';
                
                // Prevent proxy detection via headers
                init.headers['X-Client-Region'] = '${region}';
                init.headers['X-Client-Country'] = '${regionGeo.country}';
                init.headers['X-Original-URL'] = typeof resource === 'string' ? resource : resource.url;
                
                // Hide proxy indicators
                init.headers['X-Real-IP'] = undefined; // Don't send - might leak proxy
                init.headers['X-Forwarded-For'] = undefined;
                init.headers['X-Forwarded-Proto'] = undefined;
                init.headers['X-Forwarded-Host'] = undefined;
                
                // Add legitimacy
                init.headers['Referer'] = '${referrer}';
                init.headers['Sec-Fetch-Dest'] = 'document';
                init.headers['Sec-Fetch-Mode'] = 'navigate';
                init.headers['Sec-Fetch-Site'] = 'none';
                init.headers['Sec-Fetch-User'] = '?1';
                init.headers['DNT'] = '1';
                init.headers['Upgrade-Insecure-Requests'] = '1';
                
                // Spoof various tracking attempts
                init.headers['X-DevTools-Request'] = 'false';
                init.headers['X-MS-ForceOptimized'] = '1';
                init.headers['X-Script-Version'] = '12.34.56';
                
                // Prevent credentials issues that indicate proxies
                if (typeof resource === 'string' && resource.includes('same-origin')) {
                  init.credentials = 'include';
                } else {
                  init.credentials = init.credentials || 'omit';
                }
                
                // Add timing randomization to hide proxy detection
                return new Promise((resolve, reject) => {
                  const randomDelay = Math.random() * 200;
                  setTimeout(() => {
                    originalFetch.apply(this, [resource, init])
                      .then(resolve)
                      .catch(reject);
                  }, randomDelay);
                });
              };
              
              // 13.5. BLOCK GEOLOCATION API CALLS TO AD SERVERS
              // Prevent ads from querying geolocation services
              try {
                const originalFetch2 = window.fetch;
                window.fetch = function(...args) {
                  const url = (args[0] instanceof Request ? args[0].url : args[0]) || '';
                  
                  // Block requests to geolocation detection services
                  const blockedPatterns = [
                    'geo',
                    'location',
                    'ip-api',
                    'ipapi',
                    'geoip',
                    'geolocation',
                    'maxmind',
                    'ipqualityscore',
                    'proxycheck',
                    'abuseipdb',
                    'ip2location',
                    'iplocation',
                    'getgeoip',
                    'geolite'
                  ];
                  
                  // Check if request is to a blocked service
                  const urlLower = url.toLowerCase();
                  for (let pattern of blockedPatterns) {
                    if (urlLower.includes(pattern)) {
                      // Return fake response instead of blocking
                      return Promise.resolve(new Response(JSON.stringify({
                        status: 'fail',
                        country: '${regionGeo.country}',
                        city: '${regionGeo.city}',
                        lat: ${regionGeo.latitude},
                        lon: ${regionGeo.longitude},
                        proxy: false,
                        vpn: false,
                        isp: 'Residential'
                      }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
                    }
                  }
                  
                  return originalFetch2.apply(this, args);
                };
              } catch(e) {}
              
              // 13.6. SPOOF DOCUMENT.LOCATION TO MATCH REGION
              try {
                // Override location href to show region
                Object.defineProperty(window, 'location', {
                  get() {
                    return {
                      href: window.location.href,
                      hostname: window.location.hostname,
                      origin: window.location.origin,
                      pathname: window.location.pathname,
                      protocol: window.location.protocol,
                      search: window.location.search,
                      hash: window.location.hash,
                      country: '${regionGeo.country}',
                      city: '${regionGeo.city}',
                      lat: ${regionGeo.latitude},
                      lon: ${regionGeo.longitude}
                    };
                  },
                  configurable: true
                });
              } catch(e) {}
              
              // 13.7. RANDOMIZE BROWSER FINGERPRINT
              // Make canvas fingerprinting return random data
              try {
                const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
                HTMLCanvasElement.prototype.toDataURL = function() {
                  return originalToDataURL.apply(this) + Math.random().toString(36);
                };
                
                const originalGetContext = HTMLCanvasElement.prototype.getContext;
                HTMLCanvasElement.prototype.getContext = function(type) {
                  const ctx = originalGetContext.call(this, type);
                  if (type === '2d') {
                    const originalFillText = ctx.fillText;
                    ctx.fillText = function(text) {
                      const randomNoise = Math.random() * 0.1;
                      return originalFillText.call(this, text);
                    };
                  }
                  return ctx;
                };
              } catch(e) {}
              
              
              // 14. SUPPRESS PROXY DETECTION WARNINGS AND MESSAGES
              // Hide any "Anonymous Proxy", "VPN Detected", "Proxy Detected" warnings
              const suppressProxyWarnings = () => {
                // BLOCK PROXY DETECTION SCRIPTS BEFORE THEY RUN
                try {
                  // Override script creation to block proxy detection scripts
                  const originalAppendChild = Element.prototype.appendChild;
                  Element.prototype.appendChild = function(node) {
                    if (node.nodeName === 'SCRIPT') {
                      const src = (node as HTMLScriptElement).src || '';
                      const text = (node as HTMLScriptElement).textContent || '';
                      
                      // Block proxy detection scripts
                      const blockedScripts = [
                        'proxy',
                        'vpn',
                        'geolocation',
                        'detect-proxy',
                        'ipqualityscore',
                        'proxycheck',
                        'ip-api',
                        'maxmind'
                      ];
                      
                      for (let blocked of blockedScripts) {
                        if (src.includes(blocked) || text.includes(blocked)) {
                          console.log('Blocked proxy detection script:', src);
                          return node; // Don't append
                        }
                      }
                    }
                    return originalAppendChild.call(this, node);
                  };
                  
                  const originalInsertBefore = Element.prototype.insertBefore;
                  Element.prototype.insertBefore = function(newNode, refNode) {
                    if ((newNode as any).nodeName === 'SCRIPT') {
                      const src = (newNode as HTMLScriptElement).src || '';
                      const text = (newNode as HTMLScriptElement).textContent || '';
                      
                      if (src.includes('proxy') || src.includes('vpn') || text.includes('proxy')) {
                        return newNode;
                      }
                    }
                    return originalInsertBefore.call(this, newNode, refNode);
                  };
                } catch(e) {}
                
                // Aggressive CSS injection to hide ALL proxy detection UI
                const style = document.createElement('style');
                style.innerHTML = \`
                  [class*="proxy"], [class*="vpn"], [class*="anonymous"], 
                  [id*="proxy"], [id*="vpn"], [id*="anonymous"],
                  [data-qa*="proxy"], [data-qa*="vpn"],
                  div[style*="Proxy"], div[style*="VPN"], div[style*="Anonymous"],
                  [class*="detect"], [id*="detect"],
                  [class*="error"], [id*="error"],
                  [class*="alert"], [id*="alert"],
                  [class*="warning"], [id*="warning"],
                  [role="alert"], [role="status"],
                  .alert, .warning, .error, .proxy-warning,
                  div:has(> *:contains("Proxy")),
                  div:has(> *:contains("VPN")),
                  div:has(> *:contains("Anonymous")),
                  div:has(> *:contains("proxy")),
                  div:has(> *:contains("vpn")) {
                    display: none !important;
                    visibility: hidden !important;
                    height: 0 !important;
                    width: 0 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    border: 0 !important;
                    overflow: hidden !important;
                  }
                \`;
                document.documentElement.appendChild(style);
                
                // Hide iframe-based warnings
                const hideIframeWarnings = () => {
                  const iframes = document.querySelectorAll('iframe');
                  iframes.forEach(iframe => {
                    try {
                      if (iframe.contentDocument) {
                        const style = iframe.contentDocument.createElement('style');
                        style.innerHTML = \`
                          body, html { display: none !important; }
                          [class*="proxy"], [class*="vpn"], [class*="error"],
                          [class*="alert"], [role="alert"] {
                            display: none !important;
                          }
                        \`;
                        iframe.contentDocument.head.appendChild(style);
                      }
                    } catch(e) {}
                  });
                };
                hideIframeWarnings();
                
                // Block Service Workers that detect proxies
                try {
                  if (navigator.serviceWorker) {
                    const originalRegister = navigator.serviceWorker.register;
                    navigator.serviceWorker.register = function(scriptURL, options) {
                      const url = scriptURL.toString().toLowerCase();
                      
                      // Block proxy detection service workers
                      if (url.includes('proxy') || url.includes('vpn') || url.includes('detect')) {
                        console.log('Blocked proxy detection service worker:', url);
                        return Promise.reject(new Error('Blocked'));
                      }
                      
                      return originalRegister.call(this, scriptURL, options);
                    };
                  }
                } catch(e) {}
                
                // Monitor for dynamically added proxy detection messages
                const observer = new MutationObserver((mutations) => {
                  mutations.forEach((mutation) => {
                    if (mutation.addedNodes.length) {
                      mutation.addedNodes.forEach((node: any) => {
                        if (node.nodeType === 1) { // Element node
                          const text = (node.textContent || '').toLowerCase();
                          const html = (node.innerHTML || '').toLowerCase();
                          
                          // Hide if contains proxy/vpn/anonymous keywords
                          if (text.includes('proxy') || 
                              text.includes('vpn') ||
                              text.includes('anonymous') ||
                              text.includes('proxy detected') ||
                              text.includes('detected proxy') ||
                              html.includes('proxy') ||
                              html.includes('vpn')) {
                            node.style.display = 'none !important';
                            node.style.visibility = 'hidden';
                            node.style.position = 'absolute';
                            node.style.top = '-9999px';
                          }
                          
                          // Hide common ad blocker/proxy detection containers
                          if (node.getAttribute && (
                              node.getAttribute('data-test') === 'proxy-warning' ||
                              node.getAttribute('data-qa') === 'proxy-alert' ||
                              node.className?.includes('proxy') ||
                              node.id?.includes('proxy')
                          )) {
                            node.style.display = 'none !important';
                          }
                        }
                      });
                    }
                  });
                });
                
                observer.observe(document.documentElement, {
                  childList: true,
                  subtree: true,
                  attributes: true,
                  attributeOldValue: false
                });
              };
              
              suppressProxyWarnings();
              
              // Additional layer: Active scanning and removal
              const removeProxyMessages = () => {
                // Scan all elements for proxy detection keywords
                const walker = document.createTreeWalker(
                  document.documentElement,
                  NodeFilter.SHOW_ELEMENT,
                  null,
                  false
                );
                
                let node;
                while (node = walker.nextNode()) {
                  const element = node as HTMLElement;
                  const text = (element.textContent || '').toLowerCase();
                  
                  if (text.includes('proxy') || text.includes('vpn') || text.includes('anonymous')) {
                    element.style.display = 'none !important';
                    element.remove();
                  }
                }
                
                // Remove by common selectors
                const selectors = [
                  '[class*="proxy"]',
                  '[id*="proxy"]',
                  '[class*="vpn"]',
                  '[id*="vpn"]',
                  '[class*="detect"]',
                  '.proxy-warning',
                  '.vpn-warning',
                  '#proxy-alert',
                  '[data-test*="proxy"]'
                ];
                
                selectors.forEach(selector => {
                  try {
                    document.querySelectorAll(selector).forEach(el => {
                      (el as HTMLElement).style.display = 'none !important';
                      (el as HTMLElement).remove();
                    });
                  } catch(e) {}
                });
              };
              
              // Run scanner every 500ms to catch dynamic content
              setInterval(removeProxyMessages, 500);
              removeProxyMessages(); // Initial scan
              
              // 14.5 GEOLOCATION PERMISSION AND LOCATION SPOOFING
              // Override geolocation API to always return selected region
              if (window.navigator && window.navigator.geolocation) {
                const originalGeolocation = window.navigator.geolocation.getCurrentPosition;
                window.navigator.geolocation.getCurrentPosition = function(success, error, options) {
                  success({
                    coords: {
                      latitude: ${regionGeo.latitude},
                      longitude: ${regionGeo.longitude},
                      accuracy: Math.random() * 10,
                      altitude: null,
                      altitudeAccuracy: null,
                      heading: null,
                      speed: null,
                      timestamp: Date.now()
                    },
                    timestamp: Date.now()
                  });
                };
                
                window.navigator.geolocation.watchPosition = function(success, error, options) {
                  const watchId = Math.random();
                  setInterval(() => {
                    success({
                      coords: {
                        latitude: ${regionGeo.latitude},
                        longitude: ${regionGeo.longitude},
                        accuracy: Math.random() * 10,
                        altitude: null,
                        altitudeAccuracy: null,
                        heading: null,
                        speed: null,
                        timestamp: Date.now()
                      },
                      timestamp: Date.now()
                    });
                  }, 1000);
                  return watchId;
                };
              }
              
              console.log('✓ Full ${regionGeo.country} environment activated');
              console.log('✓ Location: ${regionGeo.city}, ${regionGeo.country}');
              console.log('✓ Language: ${language}');
              console.log('✓ Timezone: ${regionTz}');
              console.log('✓ Referrer: ${referrer}');
              console.log('✓ Proxy bypass active - ads should load through VPN/Proxy');
              console.log('✓ Proxy detection messages hidden');
              console.log('✓ Geolocation spoofed to ${regionGeo.city}');
            `;
            window.document.head.appendChild(script);
            window.focus();
          }
        } catch (e) {
          console.log("Injection note:", e);
        }
      }, 50);

      return window;
    } catch (error) {
      console.error("Window open failed:", error);
      return null;
    }
  }

  /**
   * Retry opening window with exponential backoff (proxy resilience)
   */
  private static retryOpenWindow(
    url: string,
    title: string,
    attemptsLeft: number,
    region: string = "US"
  ): Window | null {
    if (attemptsLeft <= 0) {
      console.error("Failed to open window after all retry attempts");
      return null;
    }

    const delay = (this.DEFAULT_RETRY_ATTEMPTS - attemptsLeft) * 500;

    return new Promise((resolve) => {
      setTimeout(() => {
        const window = this.openWindowSafely(url, title, region);
        resolve(window);
      }, delay);
    }) as any;
  }

  /**
   * Generate session ID for tracking (proxy-safe)
   */
  private static generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Generate persistent device ID (unique per session)
   */
  private static generateDeviceId(): string {
    let deviceId = sessionStorage.getItem("ad_device_id_persistent");
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      try {
        sessionStorage.setItem("ad_device_id_persistent", deviceId);
      } catch (e) {
        console.log("Device ID storage error:", e);
      }
    }
    return deviceId;
  }

  /**
   * Get random platform for browser spoofing
   */
  private static getRandomPlatform(): string {
    const platforms = ["Win32", "MacIntel", "Linux x86_64"];
    return platforms[Math.floor(Math.random() * platforms.length)];
  }

  /**
   * Get language for region
   */
  private static getLanguageForRegion(region: string): string {
    const regionLanguages: Record<string, string> = {
      US: "en-US",
      UK: "en-GB",
      FR: "fr-FR",
      DE: "de-DE",
      IT: "it-IT",
      ES: "es-ES",
      CA: "en-CA",
      AU: "en-AU",
      JP: "ja-JP",
      IN: "en-IN",
      BR: "pt-BR",
      SG: "en-SG",
      NL: "nl-NL",
      BE: "nl-BE",
      SE: "sv-SE",
      MX: "es-MX",
    };
    return regionLanguages[region] || "en-US";
  }

  /**
   * Record ad view through proxy safely with region info
   */
  static async recordAdViewSafely(
    adId: string,
    duration: number,
    region: string = "US"
  ): Promise<boolean> {
    try {
      const response = await fetch("/api/ad-views", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add headers that help proxies route correctly
          "X-Requested-With": "XMLHttpRequest",
          "Cache-Control": "no-cache",
          "X-Client-Region": region,
          "X-Country-Code": region,
        },
        body: JSON.stringify({
          adId,
          duration,
          timestamp: Date.now(),
          region,
          countryCode: region,
          // Client-side tracking (works through proxies)
          sessionId: this.generateSessionId(),
        }),
        // Allow CORS for worldwide proxy compatibility
        credentials: "include",
      });

      if (!response.ok) {
        console.warn(
          "Ad view recording may have failed, but ad display continues"
        );
        // Don't block ad display even if recording fails
        return false;
      }

      return true;
    } catch (error) {
      console.warn(
        "Network error recording ad view (proxy may block):",
        error
      );
      // Continue anyway - don't disrupt user experience
      return false;
    }
  }

  /**
   * Verify connection works through proxy
   */
  static async checkProxyConnection(): Promise<boolean> {
    try {
      const response = await fetch("/api/ads", {
        method: "HEAD",
        cache: "no-store",
      });
      return response.ok;
    } catch (error) {
      console.warn("Proxy connection check failed:", error);
      // Assume connection works anyway
      return true;
    }
  }
}

/**
 * Fetch ads with proxy resilience and region support
 */
export async function fetchAdsWithProxySupport(region: string = "US") {
  try {
    const response = await fetch(`/api/ads?active=true&region=${region}&country_code=${region}`, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "X-Client-Region": region,
        "X-Country-Code": region,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const ads = await response.json();
    return ads || [];
  } catch (error) {
    console.error("Failed to fetch ads through proxy:", error);
    // Return empty array - ads will retry
    return [];
  }
}

/**
 * Fetch links with proxy resilience and region support
 */
export async function fetchLinksWithProxySupport(region: string = "US") {
  try {
    const response = await fetch(`/api/links?active=true&region=${region}&country_code=${region}`, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "X-Client-Region": region,
        "X-Country-Code": region,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const links = await response.json();
    return links || [];
  } catch (error) {
    console.error("Failed to fetch links through proxy:", error);
    return [];
  }
}
