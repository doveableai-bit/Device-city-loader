import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, Play, Square, Zap, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { ProxySafeAdLoader, fetchLinksWithProxySupport } from "@/lib/proxy-safe-ads";

interface MonetizationLink {
  id: string;
  url: string;
  title: string;
  category: string;
  isActive: boolean;
  createdAt: Date;
  viewDuration?: number;
}

interface Region {
  code: string;
  name: string;
  country: string;
  flag: string;
}

const REGIONS: Region[] = [
  { code: "US", name: "United States", country: "USA", flag: "🇺🇸" },
  { code: "UK", name: "United Kingdom", country: "UK", flag: "🇬🇧" },
  { code: "CA", name: "Canada", country: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", country: "Australia", flag: "🇦🇺" },
  { code: "FR", name: "France", country: "France", flag: "🇫🇷" },
  { code: "IT", name: "Italy", country: "Italy", flag: "🇮🇹" },
  { code: "DE", name: "Germany", country: "Germany", flag: "🇩🇪" },
  { code: "NL", name: "Netherlands", country: "Netherlands", flag: "🇳🇱" },
  { code: "BE", name: "Belgium", country: "Belgium", flag: "🇧🇪" },
  { code: "SE", name: "Sweden", country: "Sweden", flag: "🇸🇪" },
  { code: "SG", name: "Singapore", country: "Singapore", flag: "🇸🇬" },
  { code: "JP", name: "Japan", country: "Japan", flag: "🇯🇵" },
  { code: "IN", name: "India", country: "India", flag: "🇮🇳" },
  { code: "BR", name: "Brazil", country: "Brazil", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", country: "Mexico", flag: "🇲🇽" },
];

export function AdSurfer() {
  const [links, setLinks] = useState<MonetizationLink[]>([]);
  const [isSurfing, setIsSurfing] = useState(false);
  const [currentLinkIndex, setCurrentLinkIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalViewed, setTotalViewed] = useState(0);
  const [linkWindow, setLinkWindow] = useState<Window | null>(null);
  const linkWindowRef = useRef<Window | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region>(REGIONS[0]);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [error404Shown, setError404Shown] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const nextTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const errorCheckRef = useRef<NodeJS.Timeout | null>(null);
  const reopenCheckRef = useRef<NodeJS.Timeout | null>(null);
  const surfingRef = useRef(false);
  const wakeLockRef = useRef<any>(null);

  const sendLog = async (level: "INFO" | "WARN" | "ERROR", message: string, meta?: any) => {
    try {
      await fetch("/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, message, meta }),
      });
    } catch (e) {
      // Best-effort logging only
      console.log("Log send failed:", e);
    }
  };

  // Fetch links from server (Proxy-Safe) with selected region
  const fetchLinks = async () => {
    try {
      const data = await fetchLinksWithProxySupport(selectedRegion.code);
      setLinks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch links:", error);
      setLinks([]);
    }
  };

  useEffect(() => {
    fetchLinks();
    // Refresh links every 5 seconds to pick up any new links added by admin
    const interval = setInterval(fetchLinks, 5000);
    return () => clearInterval(interval);
  }, [selectedRegion]);

  useEffect(() => {
    if (!isSurfing) {
      if (reopenCheckRef.current) clearInterval(reopenCheckRef.current);
      return;
    }

    if (reopenCheckRef.current) clearInterval(reopenCheckRef.current);
    reopenCheckRef.current = setInterval(() => {
      if (!surfingRef.current) return;
      const win = linkWindowRef.current;
      if (!win || win.closed) {
        openNextLink(currentLinkIndex);
      }
    }, 1000);

    return () => {
      if (reopenCheckRef.current) clearInterval(reopenCheckRef.current);
    };
  }, [isSurfing, currentLinkIndex]);

  const startSurfing = async () => {
    if (links.length === 0) {
      alert("No links available. Please add monetization links from the Admin panel first.");
      console.warn("No links available for surfing");
      void sendLog("WARN", "No links available for surfing");
      return;
    }

    console.log("Starting ad surfing with links:", links);
    console.log("Selected region:", selectedRegion.code);
    void sendLog("INFO", "Surfing started", { count: links.length, region: selectedRegion.code });

    setIsSurfing(true);
    surfingRef.current = true;
    setCurrentLinkIndex(0);
    
    // Request screen wake lock to prevent laptop screen from turning off
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await (navigator.wakeLock as any).request('screen');
          console.log('Screen wake lock acquired');
          void sendLog("INFO", "Screen wake lock activated");
          
          // Re-acquire wake lock if user switches tabs (optional)
          const handleVisibilityChange = async () => {
            if (surfingRef.current && wakeLockRef.current === null) {
              try {
                wakeLockRef.current = await (navigator.wakeLock as any).request('screen');
              } catch (err) {
                console.log('Failed to re-acquire wake lock:', err);
              }
            }
          };
          document.addEventListener('visibilitychange', handleVisibilityChange);
        } else {
          console.log('Wake Lock API not supported on this browser');
        }
      } catch (err) {
        console.error('Failed to request wake lock:', err);
        void sendLog("WARN", "Wake lock request failed", { error: String(err) });
      }
    };
    
    await requestWakeLock();
    
    // Open a window synchronously on user click to avoid popup blocking
    if (!linkWindowRef.current || linkWindowRef.current.closed) {
      try {
        const win = window.open("about:blank", "_blank");
        if (win) {
          linkWindowRef.current = win;
          setLinkWindow(win);
        }
      } catch (e) {
        console.log("Initial window open failed:", e);
      }
    }

    // Important: Must call window.open in direct response to user click
    // or browser will block popups
    openNextLink(0);
  };

  const openNextLink = (index: number) => {
    if (!surfingRef.current) {
      stopSurfing();
      return;
    }

    if (links.length === 0) {
      stopSurfing();
      return;
    }

    const nextIndex = index >= links.length ? 0 : index;
    const currentLink = links[nextIndex];
    
    console.log(`Opening link ${nextIndex + 1}/${links.length}:`, currentLink.url);
    void sendLog("INFO", "Opening link", {
      index: nextIndex + 1,
      total: links.length,
      url: currentLink.url,
      title: currentLink.title,
      duration: currentLink.viewDuration,
      region: selectedRegion.code,
    });
    
    const scheduleNext = () => {
      if (nextTimeoutRef.current) clearTimeout(nextTimeoutRef.current);
      nextTimeoutRef.current = setTimeout(() => {
        if (surfingRef.current) {
          openNextLink(nextIndex + 1);
        }
      }, 500);
    };

    // Validate URL before opening
    if (!currentLink.url || currentLink.url.length === 0) {
      console.warn("Invalid URL, skipping...");
      void sendLog("WARN", "Invalid URL, skipping", { index: nextIndex + 1, total: links.length });
      scheduleNext();
      return;
    }

    const setActiveWindow = (win: Window | null) => {
      linkWindowRef.current = win;
      setLinkWindow(win);
    };

    let newWindow: Window | null = null;
    const existingWindow = linkWindowRef.current;

    // Always reuse the same window when possible (single-tab mode)
    if (existingWindow && !existingWindow.closed) {
      try {
        existingWindow.location.href = currentLink.url;
        existingWindow.focus();
        newWindow = existingWindow;
      } catch (e) {
        console.log("Failed to reuse window, opening a new one:", e);
      }
    }

    // If no existing window, open one and then navigate it
    if (!newWindow) {
      try {
        newWindow = window.open("about:blank", "_blank");
        if (newWindow) {
          newWindow.location.href = currentLink.url;
          newWindow.focus();
        }
      } catch (e) {
        console.log("Window open failed:", e);
      }
    }

    // If pop-up was blocked, skip to next link
    if (!newWindow || newWindow === null) {
      console.warn("Popup was blocked for URL:", currentLink.url);
      void sendLog("WARN", "Popup blocked, skipping", { url: currentLink.url });
      scheduleNext();
      return;
    }

    if (newWindow) {
      setActiveWindow(newWindow);
      // Ensure window stays focused for proper tracking with proxy/VPN
      try {
        newWindow.focus();
      } catch (e) {
        console.log("Window focus note:", e);
      }

      // Monitor for 404 errors (page not found)
      if (errorCheckRef.current) clearInterval(errorCheckRef.current);
      errorCheckRef.current = setInterval(() => {
        try {
          if (newWindow.closed) {
            if (errorCheckRef.current) clearInterval(errorCheckRef.current);
            return;
          }

          // Check if page contains 404 indicators
          const pageTitle = newWindow.document?.title?.toLowerCase() || "";
          const pageBody = newWindow.document?.body?.innerText?.toLowerCase() || "";
          
          const has404 = pageTitle.includes("404") || 
                        pageBody.includes("404") ||
                        pageBody.includes("not found") ||
                        pageBody.includes("page not found");

          if (has404 && !error404Shown) {
            setError404Shown(true);
            console.warn(`404 detected on ${currentLink.url}`);
            void sendLog("WARN", "404 detected", { url: currentLink.url });
            
            if (errorCheckRef.current) clearInterval(errorCheckRef.current);
            
            // Close window and move to next
            newWindow.close();
            if (nextTimeoutRef.current) clearTimeout(nextTimeoutRef.current);
            scheduleNext();
          }
        } catch (e) {
          // Cross-origin restrictions - window is loading
          console.log("Window access restricted (normal for cross-origin)", e);
        }
      }, 1000);
    }
    
    const durationSeconds = Math.max(5, Number(currentLink.viewDuration) || 40);
    setCurrentLinkIndex(nextIndex);
    setTimeRemaining(durationSeconds);

    // Add retry logic for proxy compatibility
    let windowCheckInterval: NodeJS.Timeout | null = null;
    
    // Start countdown timer with proxy resilience
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Close current window if it exists
          if (newWindow && !newWindow.closed) {
            try {
              newWindow.close();
            } catch (e) {
              console.error("Failed to close window:", e);
            }
          }
          setActiveWindow(null);
          
          // Clear window check interval
          if (windowCheckInterval) clearInterval(windowCheckInterval);
          windowCheckInterval = null;
          setError404Shown(false); // Reset for next window
          setTotalViewed((prev) => prev + 1);
          void sendLog("INFO", "Link completed", { url: currentLink.url });

          // Open next link
          scheduleNext();

          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopSurfing = async () => {
    setIsSurfing(false);
    surfingRef.current = false;
    void sendLog("INFO", "Surfing stopped");

    if (timerRef.current) clearInterval(timerRef.current);
    if (nextTimeoutRef.current) clearTimeout(nextTimeoutRef.current);
    if (errorCheckRef.current) clearInterval(errorCheckRef.current);
    if (reopenCheckRef.current) clearInterval(reopenCheckRef.current);
    if (linkWindowRef.current && !linkWindowRef.current.closed) {
      linkWindowRef.current.close();
    }

    // Release screen wake lock
    try {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log('Screen wake lock released');
        void sendLog("INFO", "Screen wake lock released");
      }
    } catch (err) {
      console.error('Failed to release wake lock:', err);
    }

    linkWindowRef.current = null;
    setLinkWindow(null);
    setTimeRemaining(0);
  };

  const currentLink = links[currentLinkIndex];
  const progressPercent = currentLink
    ? (timeRemaining / Math.max(5, Number(currentLink.viewDuration) || 40)) * 100
    : 0;

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-blue-500/30">
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <Zap className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Link Surfer</h2>
          <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
            Earn Money
          </span>
        </div>

        {!isSurfing ? (
          <div className="space-y-4">
            <div className="text-sm text-slate-300">
              <p className="font-semibold text-white mb-1">🌍 Start Earning Now!</p>
              <p>Visit links from selected location and earn money!</p>
              <p className="text-xs text-slate-400 mt-2">
                ✓ Each link opens automatically for 20-30 seconds
                <br />✓ Ads will appear as if you're really in the selected country
                <br />✓ Browser environment fully spoofed (language, timezone, location)
                <br />✓ No proxy detection - completely safe
              </p>
            </div>

            {/* Region Selection Dropdown with Info */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 space-y-3">
              <label className="block text-sm font-semibold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                Select Your Region
              </label>
              
              <div className="relative">
                <button
                  onClick={() => setShowRegionDropdown(!showRegionDropdown)}
                  className="w-full bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white font-semibold py-4 px-4 rounded-lg border-2 border-blue-500/50 hover:border-blue-500 flex items-center gap-3 justify-between transition-all shadow-lg hover:shadow-blue-500/50"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-3xl">{selectedRegion.flag}</span>
                    <div className="text-left">
                      <div className="text-white font-bold">{selectedRegion.name}</div>
                      <div className="text-xs text-slate-300">{selectedRegion.country}</div>
                    </div>
                  </span>
                  <span className="text-xl text-blue-400">▼</span>
                </button>
                
                {showRegionDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border-2 border-blue-500/50 rounded-lg shadow-2xl z-50 max-h-80 overflow-y-auto">
                    <div className="sticky top-0 bg-slate-900 border-b border-blue-500/30 px-4 py-2">
                      <p className="text-xs text-slate-400">Select a region (ads will use that country environment)</p>
                    </div>
                    {REGIONS.map((region) => (
                      <button
                        key={region.code}
                        onClick={() => {
                          setSelectedRegion(region);
                          setShowRegionDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all border-l-4 ${
                          selectedRegion.code === region.code
                            ? "bg-blue-600 text-white border-l-blue-400 shadow-lg"
                            : "hover:bg-slate-700 text-slate-200 border-l-transparent hover:border-l-blue-400"
                        }`}
                      >
                        <span className="text-2xl">{region.flag}</span>
                        <div>
                          <div className="font-semibold">{region.name}</div>
                          <div className="text-xs text-slate-400">{region.country}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-slate-700/50 rounded p-3 text-xs text-slate-300 space-y-1">
                <p className="font-semibold text-slate-200">ℹ️ What happens:</p>
                <ul className="space-y-1 ml-2">
                  <li>✓ Ads will think you're in {selectedRegion.name}</li>
                  <li>✓ Browser language: {selectedRegion.name}</li>
                  <li>✓ Location spoofed to {selectedRegion.name}</li>
                  <li>✓ No proxy/VPN detection warnings</li>
                </ul>
              </div>
            </div>

            <Button
              onClick={startSurfing}
              disabled={links.length === 0}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 flex items-center gap-2 justify-center text-lg transition-all shadow-lg hover:shadow-green-500/50"
            >
              <Play className="w-5 h-5" />
              Start Surfing & Earning
            </Button>

            <div className="bg-slate-700/50 rounded-lg p-3 text-xs text-slate-300">
              <p className="font-semibold mb-2">Statistics:</p>
              <p>Total Links Viewed: <span className="text-blue-400 font-bold">{totalViewed}</span></p>
              <p>Available Links: <span className="text-green-400 font-bold">{links.length}</span></p>
            </div>

            {/* Help Section */}
            <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 text-xs space-y-2">
              <div className="font-semibold text-slate-200 flex items-center gap-2">
                <span>ℹ️</span> How to Get Best Results:
              </div>
              <ul className="space-y-1 ml-4 text-slate-400">
                <li>✓ Select your target region above</li>
                <li>✓ Click "Start Surfing" to begin</li>
                <li>✓ Ads open in real browser windows</li>
                <li>✓ Browser appears to be IN that country</li>
                <li>✓ Language, timezone, location all spoofed</li>
                <li>✓ No VPN/Proxy detection alerts</li>
                <li>✓ Keep windows open for full duration</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-lg p-4 border border-blue-500/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{selectedRegion.flag}</span>
                  <div>
                    <h3 className="font-bold text-white text-lg">{currentLink?.title || "Loading..."}</h3>
                    <p className="text-sm text-slate-300">Region: {selectedRegion.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-400">{timeRemaining}s</div>
                  <div className="text-xs text-slate-400">Time remaining</div>
                </div>
              </div>

              <p className="text-sm text-slate-300 mb-3">
                Category: <span className="font-semibold text-blue-300">{currentLink?.category}</span>
              </p>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                  <span>Ads opened from {selectedRegion.name}</span>
                  <span className="text-slate-300">{currentLinkIndex + 1} / {links.length}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden border border-slate-600">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                    initial={{ width: "100%" }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border-2 border-blue-500/30 rounded-lg p-3 flex items-start gap-2 text-sm">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-slate-300">
                <p className="font-semibold mb-1">✓ Full {selectedRegion.name} Environment Active</p>
                <p className="text-xs text-slate-400">
                  Browser is spoofed as being in {selectedRegion.name}. Ads see no proxy/VPN. Keep window in focus.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs bg-slate-700/30 p-3 rounded-lg border border-slate-600">
              <div>
                <p className="text-slate-500 mb-1">🌍 Location</p>
                <p className="text-white font-semibold">{selectedRegion.name}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">📊 Viewed</p>
                <p className="text-green-400 font-semibold">{totalViewed}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">⏱️ Progress</p>
                <p className="text-blue-400 font-semibold">{currentLinkIndex + 1} / {links.length}</p>
              </div>
            </div>

            <Button
              onClick={stopSurfing}
              variant="destructive"
              className="w-full flex items-center gap-2 justify-center py-3 text-lg font-bold"
            >
              <Square className="w-5 h-5" />
              Stop Surfing
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
