import { useSimulator } from "@/hooks/use-simulator";
import { Header } from "@/components/Header";
import { DeviceScreen } from "@/components/DeviceScreen";
import { AdSurfer } from "@/components/AdSurfer";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
  const {
    screens,
    screenCount,
    setScreenCount,
    globalUrl,
    setGlobalUrl,
    loadUrlOnAll,
    resetScreens,
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
  } = useSimulator();

  const getGridCols = (count: number) => {
    if (count <= 2) return "grid-cols-1 md:grid-cols-2";
    if (count <= 4) return "grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4";
    if (count <= 6) return "grid-cols-1 md:grid-cols-2 xl:grid-cols-3";
    if (count <= 9) return "grid-cols-1 md:grid-cols-3 xl:grid-cols-3";
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
      <Header
        url={globalUrl}
        onUrlChange={setGlobalUrl}
        screenCount={screenCount}
        onScreenCountChange={setScreenCount}
        onLoad={loadUrlOnAll}
        onReset={resetScreens}
        embedMode={embedMode}
        onEmbedModeChange={setEmbedMode}
        htmlCode={htmlCode}
        onHtmlCodeChange={setHtmlCode}
        isAutoRefreshing={isAutoRefreshing}
        onAutoRefreshingChange={setIsAutoRefreshing}
        isAutoClicking={isAutoClicking}
        onAutoClickingChange={setIsAutoClicking}
        isAutoSliding={isAutoSliding}
        onAutoSlidingChange={setIsAutoSliding}
      />

      <main className="flex-1 container mx-auto px-4 py-8">
        <Tabs defaultValue="simulator" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-900 border border-slate-700 mb-6">
            <TabsTrigger value="simulator" className="data-[state=active]:bg-blue-600">
              Device Simulator
            </TabsTrigger>
            <TabsTrigger value="ads" className="data-[state=active]:bg-yellow-600">
              Ad Surfer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="simulator" className="space-y-8">
            <div className="flex items-center justify-between mb-8 text-xs font-mono text-muted-foreground uppercase tracking-widest opacity-60">
              <div>
                Active Nodes: <span className="text-primary">{screens.length}</span>
              </div>
              <div>
                System Status: <span className="text-emerald-500">ONLINE</span>
              </div>
            </div>

            <div className={cn(
              "grid gap-6 auto-rows-fr transition-all duration-500", 
              getGridCols(screens.length)
            )}>
              {screens.map((screen) => (
                <motion.div
                  key={screen.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  layout
                >
                  <DeviceScreen 
                    screen={screen}
                    onRefresh={refreshScreen}
                    onToggleMute={toggleMute}
                    isAutoClicking={isAutoClicking}
                    isAutoSliding={isAutoSliding}
                    isAutoRefreshing={isAutoRefreshing}
                  />
                </motion.div>
              ))}
            </div>
            
            {screens.length === 0 && (
              <div className="h-[60vh] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-white/5 rounded-3xl animate-pulse">
                 <p>Initializing Simulation Grid...</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ads">
            <div className="max-w-2xl mx-auto">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">Earn Money Viewing Ads</h2>
                <p className="text-slate-400">
                  Ads will automatically open and close. Each view takes 20-30 seconds. 
                  Stop anytime by clicking the "Stop Surfing" button.
                </p>
              </div>
              <AdSurfer />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]" />
      </div>
    </div>
  );
}
