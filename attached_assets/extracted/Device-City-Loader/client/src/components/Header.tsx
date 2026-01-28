import { MonitorPlay, LayoutGrid, RotateCw, Play, Code, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { EmbedMode } from "@/hooks/use-simulator";

interface HeaderProps {
  url: string;
  onUrlChange: (val: string) => void;
  screenCount: number;
  onScreenCountChange: (val: number) => void;
  onLoad: () => void;
  onReset: () => void;
  embedMode: EmbedMode;
  onEmbedModeChange: (mode: EmbedMode) => void;
  htmlCode: string;
  onHtmlCodeChange: (val: string) => void;
  isAutoRefreshing: boolean;
  onAutoRefreshingChange: (val: boolean) => void;
  isAutoClicking: boolean;
  onAutoClickingChange: (val: boolean) => void;
  isAutoSliding: boolean;
  onAutoSlidingChange: (val: boolean) => void;
}

export function Header({ 
  url, 
  onUrlChange, 
  screenCount, 
  onScreenCountChange, 
  onLoad, 
  onReset,
  embedMode,
  onEmbedModeChange,
  htmlCode,
  onHtmlCodeChange,
  isAutoRefreshing,
  onAutoRefreshingChange,
  isAutoClicking,
  onAutoClickingChange,
  isAutoSliding,
  onAutoSlidingChange
}: HeaderProps) {
  const canLoad = embedMode === "url" ? !!url : !!htmlCode;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/5">
      <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 min-w-fit">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <MonitorPlay className="h-6 w-6 text-white" />
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-bold leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                Multi-Device USA Screen Simulator
              </h1>
              <p className="text-xs text-muted-foreground mt-1">CPM Booster Enabled</p>
            </div>
          </div>

          <div className="flex items-center gap-3 min-w-fit">
            <Button
              size="sm"
              variant={isAutoRefreshing ? "default" : "outline"}
              onClick={() => onAutoRefreshingChange(!isAutoRefreshing)}
              className={cn(
                "gap-1.5 transition-all duration-300",
                isAutoRefreshing ? "bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "border-white/10"
              )}
            >
              <RotateCw className={cn("w-3.5 h-3.5", isAutoRefreshing && "animate-spin")} />
              {isAutoRefreshing ? "Auto-Pilot ON" : "Auto-Pilot OFF"}
            </Button>

            <div className="flex items-center bg-secondary/30 rounded-lg p-1 border border-white/5">
              <Button
                size="sm"
                variant={embedMode === "url" ? "default" : "ghost"}
                onClick={() => onEmbedModeChange("url")}
                className="gap-1.5"
                data-testid="button-mode-url"
              >
                <Link2 className="w-3.5 h-3.5" />
                URL
              </Button>
              <Button
                size="sm"
                variant={embedMode === "html" ? "default" : "ghost"}
                onClick={() => onEmbedModeChange("html")}
                className="gap-1.5"
                data-testid="button-mode-html"
              >
                <Code className="w-3.5 h-3.5" />
                HTML/Script
              </Button>
            </div>
            
            <Select 
              value={screenCount.toString()} 
              onValueChange={(val) => onScreenCountChange(parseInt(val))}
            >
              <SelectTrigger className="w-[140px] h-10 bg-secondary/30 border-white/5 hover:bg-secondary/50" data-testid="select-screen-count">
                <LayoutGrid className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Screens" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 Screens</SelectItem>
                <SelectItem value="4">4 Screens</SelectItem>
                <SelectItem value="6">6 Screens</SelectItem>
                <SelectItem value="9">9 Screens</SelectItem>
                <SelectItem value="12">12 Screens</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              size="icon"
              onClick={onReset}
              className="h-10 w-10 border-white/10 bg-secondary/30 hover:bg-destructive/20 hover:text-destructive hover:border-destructive/30 transition-colors"
              title="Reset Simulation"
              data-testid="button-reset"
            >
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

          <div className="flex items-start gap-3">
          <div className="flex gap-2">
            <Button
              onClick={() => onAutoClickingChange(!isAutoClicking)}
              variant={isAutoClicking ? "default" : "outline"}
              className={cn(
                "h-11 px-4 transition-all duration-300 gap-2",
                isAutoClicking ? "bg-amber-500 hover:bg-amber-600 text-white border-none shadow-[0_0_15px_rgba(245,158,11,0.3)]" : "border-white/10"
              )}
            >
              <div className={cn("w-2 h-2 rounded-full bg-white", isAutoClicking && "animate-ping")} />
              Auto Clicker
            </Button>

            <Button
              onClick={() => onAutoSlidingChange(!isAutoSliding)}
              variant={isAutoSliding ? "default" : "outline"}
              className={cn(
                "h-11 px-4 transition-all duration-300 gap-2",
                isAutoSliding ? "bg-blue-500 hover:bg-blue-600 text-white border-none shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "border-white/10"
              )}
            >
              <RotateCw className={cn("w-4 h-4", isAutoSliding && "animate-bounce")} />
              Auto Slider
            </Button>
          </div>

          {embedMode === "url" ? (
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <span className="text-muted-foreground text-xs font-mono">URL</span>
              </div>
              <Input 
                value={url}
                onChange={(e) => onUrlChange(e.target.value)}
                placeholder="Enter URL to simulate (YouTube embed, TikTok, etc)..."
                className="pl-12 h-11 bg-secondary/50 border-secondary-foreground/10 focus:bg-secondary focus:border-primary/50 transition-all font-mono text-sm shadow-inner"
                data-testid="input-url"
              />
              <div className="absolute inset-0 -z-10 bg-primary/5 rounded-md opacity-0 group-focus-within:opacity-100 transition-opacity blur-lg" />
            </div>
          ) : (
            <div className="relative flex-1 group">
              <Textarea 
                value={htmlCode}
                onChange={(e) => onHtmlCodeChange(e.target.value)}
                placeholder="Paste your ad script or HTML code here (e.g., <script> tags from Adsterra)..."
                className="min-h-[80px] bg-secondary/50 border-secondary-foreground/10 focus:bg-secondary focus:border-primary/50 transition-all font-mono text-sm shadow-inner resize-none"
                data-testid="input-html-code"
              />
              <div className="absolute inset-0 -z-10 bg-accent/5 rounded-md opacity-0 group-focus-within:opacity-100 transition-opacity blur-lg" />
            </div>
          )}

          <Button 
            onClick={onLoad}
            className="h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95"
            disabled={!canLoad}
            data-testid="button-broadcast"
          >
            <Play className="w-4 h-4 mr-2 fill-current" />
            Broadcast
          </Button>
        </div>

        {embedMode === "html" && (
          <p className="text-xs text-muted-foreground">
            Use HTML/Script mode for ad networks like Adsterra. Paste the full script tag they provide.
          </p>
        )}
      </div>
    </header>
  );
}
