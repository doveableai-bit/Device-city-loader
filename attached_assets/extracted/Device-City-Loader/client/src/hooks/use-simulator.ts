import { useState, useCallback, useEffect } from "react";
import { DEVICE_TYPES, LOCATIONS, type Screen } from "@/lib/simulation-data";

export type EmbedMode = "url" | "html";

// Extended screen type with HTML embed support
export interface ExtendedScreen extends Screen {
  _key?: number;
  htmlContent?: string | null;
  country?: string;
}

// Helper to generate a random screen configuration with premium User Agents
function generateRandomScreen(id: number): ExtendedScreen {
  const device = DEVICE_TYPES[Math.floor(Math.random() * DEVICE_TYPES.length)];
  const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  
  // Premium User Agents pool
  const premiumUAs = [
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.80 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  ];
  
  const ua = premiumUAs[Math.floor(Math.random() * premiumUAs.length)];

  return {
    id,
    deviceType: device.type,
    city: location.city,
    state: location.state,
    country: location.country,
    width: device.width,
    height: device.height,
    userAgent: ua,
    url: null,
    isMuted: true,
    htmlContent: null,
  };
}

export function useSimulator() {
  const [screens, setScreens] = useState<ExtendedScreen[]>([]);
  const [screenCount, setScreenCount] = useState(4);
  const [globalUrl, setGlobalUrl] = useState("https://www.effectivegatecpm.com/xzh90qd2hb?key=10b32712d4294c44ddd6824564e7ad92");
  const [embedMode, setEmbedMode] = useState<EmbedMode>("url");
  const [htmlCode, setHtmlCode] = useState("");
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const [isAutoClicking, setIsAutoClicking] = useState(false);
  const [isAutoSliding, setIsAutoSliding] = useState(false);

  // Initialize screens
  useEffect(() => {
    resetScreens();
  }, [screenCount]);

  // Auto-Refresh Logic (CPM Booster)
  useEffect(() => {
    if (!isAutoRefreshing) return;
    
    const interval = setInterval(() => {
      setScreens(prev => prev.map(s => ({ ...s, _key: Date.now() + Math.random() })));
    }, 45000); // Refresh every 45 seconds
    
    return () => clearInterval(interval);
  }, [isAutoRefreshing]);

  const resetScreens = useCallback(() => {
    const newScreens = Array.from({ length: screenCount }).map((_, i) => 
      generateRandomScreen(i + 1)
    );
    const currentUrl = globalUrl || "https://www.effectivegatecpm.com/xzh90qd2hb?key=10b32712d4294c44ddd6824564e7ad92";
    newScreens.forEach(s => s.url = currentUrl);
    setScreens(newScreens);
  }, [screenCount, globalUrl]);

  const loadUrlOnAll = useCallback(() => {
    if (embedMode === "url") {
      const urlToLoad = globalUrl || "https://www.effectivegatecpm.com/xzh90qd2hb?key=10b32712d4294c44ddd6824564e7ad92";
      setScreens(prev => prev.map(s => ({ ...s, url: urlToLoad, htmlContent: null, _key: Date.now() })));
    } else {
      if (!htmlCode) return;
      setScreens(prev => prev.map(s => ({ ...s, url: null, htmlContent: htmlCode, _key: Date.now() })));
    }
  }, [globalUrl, htmlCode, embedMode]);

  const updateScreenUrl = useCallback((id: number, url: string) => {
    setScreens(prev => prev.map(s => s.id === id ? { ...s, url } : s));
  }, []);

  const toggleMute = useCallback((id: number) => {
    setScreens(prev => prev.map(s => s.id === id ? { ...s, isMuted: !s.isMuted } : s));
  }, []);

  const refreshScreen = useCallback((id: number) => {
    setScreens(prev => prev.map(s => {
      if (s.id !== id) return s;
      return { ...s, _key: Date.now() + Math.random() };
    }));
  }, []);

  return {
    screens,
    screenCount,
    setScreenCount,
    globalUrl,
    setGlobalUrl,
    loadUrlOnAll,
    resetScreens,
    updateScreenUrl,
    toggleMute,
    refreshScreen,
    embedMode,
    setEmbedMode,
    htmlCode,
    setHtmlCode,
    isAutoRefreshing,
    setIsAutoRefreshing,
    isAutoClicking,
    setIsAutoClicking,
    isAutoSliding,
    setIsAutoSliding
  };
}
