import { useState, useEffect } from "react";

interface ProxyDetectionResult {
  isProxyDetected: boolean;
  isVpnDetected: boolean;
  indicators: string[];
  shouldBlockAds: boolean;
}

export function useProxyDetection(): ProxyDetectionResult {
  const [result, setResult] = useState<ProxyDetectionResult>({
    isProxyDetected: false,
    isVpnDetected: false,
    indicators: [],
    shouldBlockAds: false, // ALWAYS allow ads
  });

  useEffect(() => {
    // NEVER block ads - always return false for shouldBlockAds
    setResult({
      isProxyDetected: false,
      isVpnDetected: false,
      indicators: [],
      shouldBlockAds: false, // ALWAYS FALSE - NEVER BLOCK ADS
    });

    // Store result for all tabs
    localStorage.setItem(
      "proxyDetection",
      JSON.stringify({
        isProxyDetected: false,
        isVpnDetected: false,
        shouldBlockAds: false,
        timestamp: Date.now(),
        tabSupport: true,
      })
    );
  }, []);

    detectProxy();

    // Re-check every 5 minutes
    const interval = setInterval(detectProxy, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return result;
}

// Get local IPs via WebRTC
function getLocalIPs(): Promise<string[]> {
  return new Promise((resolve) => {
    const ips: string[] = [];
    const peerConnection = new (window as any).RTCPeerConnection({
      iceServers: [],
    });

    peerConnection.createDataChannel("");
    peerConnection.createOffer().then((offer: any) => {
      peerConnection.setLocalDescription(offer);
    });

    peerConnection.onicecandidate = (ice: any) => {
      if (!ice || !ice.candidate) return;
      const ipAddress = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
      const ipMatches = ice.candidate.candidate.match(ipAddress);
      if (ipMatches) {
        const ip = ipMatches[1];
        // Filter out standard local IPs
        if (
          !ip.startsWith("192.168.") &&
          !ip.startsWith("10.") &&
          !ip.startsWith("172.")
        ) {
          if (!ips.includes(ip)) ips.push(ip);
        }
      }
    };

    setTimeout(() => {
      peerConnection.close();
      resolve(ips);
    }, 3000);
  });
}

// Check for non-standard DNS
function checkDNS(): Promise<boolean> {
  return new Promise((resolve) => {
    // Common VPN DNS providers
    const vpnDnsServers = [
      "1.1.1.1", // Cloudflare
      "8.8.8.8", // Google (often used with VPN)
      "208.67.222.222", // OpenDNS
      "9.9.9.9", // Quad9
    ];

    // This is a simplified check - real DNS detection is more complex
    try {
      // Attempt to detect via timing and response patterns
      fetch("https://example.com", { method: "HEAD", mode: "no-cors" })
        .then(() => {
          resolve(false);
        })
        .catch(() => {
          resolve(false);
        });

      setTimeout(() => resolve(false), 2000);
    } catch {
      resolve(false);
    }
  });
}

// Check timezone mismatch with IP location
function checkTimezoneMismatch(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      // Get user's timezone from browser
      const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Fetch IP-based location
      fetch("https://ipapi.co/json/", { method: "GET", mode: "cors" })
        .then((res) => res.json())
        .then((data) => {
          const ipTimezone = data.timezone;
          // If timezones don't match, likely VPN
          const mismatch =
            userTz && ipTimezone && userTz !== ipTimezone ? true : false;
          resolve(mismatch);
        })
        .catch(() => resolve(false));

      // Timeout fallback
      setTimeout(() => resolve(false), 3000);
    } catch {
      resolve(false);
    }
  });
}
