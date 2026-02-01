import { useState, useRef, useEffect } from "react";
import type { ExtendedScreen } from "@/hooks/use-simulator";
import { 
  Smartphone, 
  Tablet, 
  Laptop, 
  Monitor, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize,
  MapPin,
  ExternalLink
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DeviceScreenProps {
  screen: ExtendedScreen;
  onRefresh: (id: number) => void;
  onToggleMute: (id: number) => void;
  isAutoClicking?: boolean;
  isAutoSliding?: boolean;
  isAutoRefreshing?: boolean;
}

export function DeviceScreen({ 
  screen, 
  onRefresh, 
  onToggleMute,
  isAutoClicking,
  isAutoSliding,
  isAutoRefreshing
}: DeviceScreenProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [clickPos, setClickPos] = useState<{ x: number, y: number } | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [activeTab, setActiveTab] = useState<'main' | 'ad'>('main');
  const [adUrl, setAdUrl] = useState<string | null>(null);
  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Auto-Clicker Logic (Enhanced for Redirect/Tab Simulation)
  useEffect(() => {
    if (!isAutoClicking) return;

    const handleAdFlow = () => {
      // 1. Detect and simulate click on "New Tab" button area (ExternalLink/Ad Button)
      // Since we can't truly "detect" buttons inside cross-origin iframes, 
      // we target likely ad interaction areas or the manual external link button
      const triggerClick = () => {
        // Target coordinates for common ad button locations
        const x = 50 + (Math.random() * 20 - 10); 
        const y = 50 + (Math.random() * 20 - 10);
        
        setClickPos({ x, y });
        
        // Simulation of ad redirection
        if (screen.url) {
          // Open the ad in the internal "panel tab"
          setAdUrl(screen.url);
          setActiveTab('ad');
          
          // Stay in ad for random duration (5-10s if autopilot off, or per ad length)
          const adDuration = (isAutoRefreshing ? 5000 : 8000) + Math.random() * 5000;
          
          setTimeout(() => {
            setActiveTab('main');
            setAdUrl(null);
            
            // If autopilot is on, the main simulator will handle the next refresh
            // If autopilot is off, we might want to refresh manually after completing
            if (!isAutoRefreshing) {
              onRefresh(screen.id);
            }
          }, adDuration);
        }
      };

      // Initial delay after load: 5 to 10 seconds
      const initialDelay = 5000 + Math.random() * 5000;
      const timeout = setTimeout(triggerClick, initialDelay);
      return timeout;
    };

    const timeout = handleAdFlow();
    return () => clearTimeout(timeout);
  }, [isAutoClicking, screen._key, screen.id, isAutoRefreshing, screen.url]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      iframeContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  // Auto-Slider Logic
  useEffect(() => {
    if (!isAutoSliding) {
      setScrollOffset(0);
      return;
    }

    let direction = 1;
    const interval = setInterval(() => {
      setScrollOffset(prev => {
        if (prev >= 150) direction = -1;
        if (prev <= 0) direction = 1;
        return prev + (5 * direction);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isAutoSliding]);

  const DeviceIcon = {
    'Mobile': Smartphone,
    'Tablet': Tablet,
    'Laptop': Laptop,
    'Desktop': Monitor
  }[screen.deviceType] || Monitor;

  const hasContent = screen.url || screen.htmlContent;

  return (
    <Card className={cn(
      "group relative overflow-hidden flex flex-col transition-all duration-300 border-border/50 hover:border-primary/50 hover:shadow-2xl animate-screen-enter bg-card",
      isFullscreen ? "fixed inset-0 z-50 rounded-none border-none" : "h-[400px]"
    )} data-testid={`card-screen-${screen.id}`}>
      {/* Tabs Header inside the panel */}
      <div className="flex bg-black/40 border-b border-white/5 p-1 gap-1">
        <button 
          onClick={() => setActiveTab('main')}
          className={cn(
            "text-[10px] px-2 py-0.5 rounded transition-colors uppercase tracking-widest font-bold",
            activeTab === 'main' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-white/5"
          )}
        >
          Main Node
        </button>
        {adUrl && (
          <button 
            className={cn(
              "text-[10px] px-2 py-0.5 rounded transition-colors uppercase tracking-widest font-bold flex items-center gap-1",
              activeTab === 'ad' ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-white/5"
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active Ad
          </button>
        )}
      </div>

      <div className="absolute top-10 left-0 right-0 z-20 flex items-center justify-between p-3 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0 -translate-y-full">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-black/40 border-white/10 text-white backdrop-blur-md">
            <MapPin className="w-3 h-3 mr-1 text-accent" />
            {screen.city}, {screen.country === "USA" ? screen.state : screen.country}
          </Badge>
          <div className="hidden sm:flex items-center text-xs text-muted-foreground font-mono bg-black/40 px-2 py-0.5 rounded backdrop-blur-md">
             {screen.width}x{screen.height}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className="bg-primary/20 hover:bg-primary/30 text-primary-foreground border-primary/20 backdrop-blur-md">
            <DeviceIcon className="w-3 h-3 mr-1.5" />
            {screen.deviceType}
          </Badge>
        </div>
      </div>

      <div 
        ref={iframeContainerRef}
        className="flex-1 relative bg-black w-full h-full flex items-center justify-center overflow-hidden"
      >
        <div 
          className="w-full h-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateY(-${scrollOffset}px)` }}
        >
          {activeTab === 'main' ? (
            screen.url ? (
              <iframe
              ref={iframeRef}
              key={`${screen.id}-${screen._key}`}
              src={screen.url}
              className="w-full h-full border-0"
              sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation allow-top-navigation-by-user-activation allow-storage-access-by-user-activation"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; attribution-reporting; run-ad-auction; join-ad-interest-group"
              referrerPolicy="no-referrer"
            />
            ) : screen.htmlContent ? (
            <iframe
              ref={iframeRef}
              key={`${screen.id}-${screen._key}`}
              srcDoc={screen.htmlContent}
              className="w-full h-full border-0"
              sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation allow-top-navigation-by-user-activation allow-storage-access-by-user-activation"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; attribution-reporting; run-ad-auction; join-ad-interest-group"
              referrerPolicy="no-referrer"
            />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground/30 p-8 text-center h-full">
                <DeviceIcon className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-sm font-medium uppercase tracking-widest">
                  Awaiting Signal
                </p>
                <div className="mt-2 text-xs font-mono opacity-50">
                  {screen.userAgent.substring(0, 40)}...
                </div>
              </div>
            )
          ) : (
            <iframe
              src={adUrl!}
              className="w-full h-full border-0"
              sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation allow-top-navigation-by-user-activation allow-storage-access-by-user-activation"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; attribution-reporting; run-ad-auction; join-ad-interest-group"
              referrerPolicy="no-referrer"
            />
          )}
        </div>

        {/* Visual Click Indicator */}
        {clickPos && (
          <div 
            className="absolute pointer-events-none z-50 w-10 h-10 -ml-5 -mt-5 bg-white/30 rounded-full border-2 border-white/50 animate-ping"
            style={{ left: `${clickPos.x}%`, top: `${clickPos.y}%` }}
          />
        )}

        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/5 to-transparent opacity-20" />
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />
      </div>


      <div className="absolute bottom-0 left-0 right-0 z-20 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex gap-2">
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
            onClick={() => onRefresh(screen.id)}
            title="Reload Screen"
            data-testid={`button-reload-${screen.id}`}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
            onClick={() => onToggleMute(screen.id)}
            title={screen.isMuted ? "Unmute" : "Mute"}
            data-testid={`button-mute-${screen.id}`}
          >
            {screen.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>

        <div className="flex gap-2">
           {screen.url && (
             <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                asChild
             >
               <a href={screen.url} target="_blank" rel="noopener noreferrer" title="Open in New Tab" data-testid={`link-external-${screen.id}`}>
                 <ExternalLink className="w-4 h-4" />
               </a>
             </Button>
           )}
           <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
            onClick={toggleFullscreen}
            title="Fullscreen"
            data-testid={`button-fullscreen-${screen.id}`}
          >
            <Maximize className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
