import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // ==================== PROXY DETECTION ROUTES ====================

  // Detect proxy/VPN headers
  app.get("/api/detect-proxy", async (req, res) => {
    try {
      const headers = req.headers;
      const isProxy = !!(
        headers["x-forwarded-for"] ||
        headers["x-proxy-authorization"] ||
        headers["via"] ||
        headers["x-forwarded-host"] ||
        headers["cf-connecting-ip"]
      );

      const proxyIndicators = [];
      if (headers["x-forwarded-for"]) proxyIndicators.push("X-Forwarded-For detected");
      if (headers["via"]) proxyIndicators.push("Via header detected");
      if (headers["x-proxy-authorization"]) proxyIndicators.push("Proxy authorization detected");
      if (headers["cf-connecting-ip"]) proxyIndicators.push("Cloudflare proxy detected");

      res.json({
        isProxy,
        isVpn: false, // VPN detection is client-side via WebRTC
        proxyIndicators,
        clientIp: headers["x-forwarded-for"] || headers["cf-connecting-ip"] || req.socket.remoteAddress,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to detect proxy" });
    }
  });

  // ==================== ADS ROUTES ====================

  // Get all active ads (Proxy/VPN compatible)
  app.get("/api/ads", async (req, res) => {
    try {
      const active = req.query.active === "true";
      const ads = await storage.getAds(active);
      
      // Add CORS headers for proxy compatibility
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cache-Control", "public, max-age=60");
      res.setHeader("X-Content-Type-Options", "nosniff");
      
      res.json(ads);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ads" });
    }
  });

  // Get single ad
  app.get("/api/ads/:id", async (req, res) => {
    try {
      const ad = await storage.getAdById(req.params.id);
      if (!ad) {
        return res.status(404).json({ error: "Ad not found" });
      }
      res.json(ad);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ad" });
    }
  });

  // Create new ad
  app.post("/api/ads", async (req, res) => {
    try {
      const { url, title, description, viewDuration } = req.body;

      if (!url || !title) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const newAd = await storage.createAd({
        url,
        title,
        description,
        viewDuration: viewDuration || 25,
      });

      res.status(201).json(newAd);
    } catch (error) {
      res.status(500).json({ error: "Failed to create ad" });
    }
  });

  // Update ad
  app.put("/api/ads/:id", async (req, res) => {
    try {
      const { url, title, description, viewDuration } = req.body;
      const updatedAd = await storage.updateAd(req.params.id, {
        url,
        title,
        description,
        viewDuration,
      });

      if (!updatedAd) {
        return res.status(404).json({ error: "Ad not found" });
      }

      res.json(updatedAd);
    } catch (error) {
      res.status(500).json({ error: "Failed to update ad" });
    }
  });

  // Delete ad
  app.delete("/api/ads/:id", async (req, res) => {
    try {
      const result = await storage.deleteAd(req.params.id);
      if (!result) {
        return res.status(404).json({ error: "Ad not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete ad" });
    }
  });

  // ==================== AD VIEWS ROUTES ====================

  // Record ad view
  app.post("/api/ad-views", async (req, res) => {
    try {
      const { adId, duration } = req.body;
      const userId = (req as any).session?.userId || "anonymous";

      if (!adId) {
        return res.status(400).json({ error: "Missing adId" });
      }

      const adView = await storage.recordAdView({
        userId,
        adId,
        duration: duration || 30,
      });

      res.status(201).json(adView);
    } catch (error) {
      res.status(500).json({ error: "Failed to record ad view" });
    }
  });

  // Get user's ad view history
  app.get("/api/ad-views/user/:userId", async (req, res) => {
    try {
      const views = await storage.getUserAdViews(req.params.userId);
      res.json(views);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ad views" });
    }
  });

  // Get ad view statistics
  app.get("/api/ad-stats/:adId", async (req, res) => {
    try {
      const stats = await storage.getAdStats(req.params.adId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ad stats" });
    }
  });

  // ==================== LINKS ROUTES ====================

  // Client logging (for terminal visibility)
  app.post("/api/log", async (req, res) => {
    try {
      const { level, message, meta } = req.body || {};
      const safeLevel = typeof level === "string" ? level.toUpperCase() : "INFO";
      const safeMessage = typeof message === "string" ? message : "";
      const safeMeta = meta !== undefined ? meta : null;

      const line = safeMeta ? `${safeMessage} :: ${JSON.stringify(safeMeta)}` : safeMessage;
      switch (safeLevel) {
        case "ERROR":
          console.error(line);
          break;
        case "WARN":
          console.warn(line);
          break;
        default:
          console.log(line);
      }

      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to log" });
    }
  });

  // Get all links (active or all)
  app.get("/api/links", async (req, res) => {
    try {
      const active = req.query.active === "true";
      const links = await storage.getLinks(active);
      res.json(links);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch links" });
    }
  });

  // Get single link
  app.get("/api/links/:id", async (req, res) => {
    try {
      const link = await storage.getLinkById(req.params.id);
      if (!link) {
        return res.status(404).json({ error: "Link not found" });
      }
      res.json(link);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch link" });
    }
  });

  // Create new link
  app.post("/api/links", async (req, res) => {
    try {
      const { url, title, category, viewDuration } = req.body;

      console.log("Creating link with payload:", { url, title, category });

      if (!url || !title || !category) {
        console.log("Missing required fields:", { url: !!url, title: !!title, category: !!category });
        return res.status(400).json({ error: "Missing required fields: url, title, and category are required" });
      }

      const newLink = await storage.createLink({
        url,
        title,
        category,
        viewDuration: typeof viewDuration === "number" ? viewDuration : undefined,
      });

      console.log("Link created successfully:", newLink);
      res.status(201).json(newLink);
    } catch (error) {
      console.error("Error creating link:", error);
      res.status(500).json({ error: "Failed to create link", details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Update link
  app.put("/api/links/:id", async (req, res) => {
    try {
      const { url, title, category, viewDuration } = req.body;
      const updatedLink = await storage.updateLink(req.params.id, {
        url,
        title,
        category,
        viewDuration: typeof viewDuration === "number" ? viewDuration : undefined,
      });

      if (!updatedLink) {
        return res.status(404).json({ error: "Link not found" });
      }

      res.json(updatedLink);
    } catch (error) {
      res.status(500).json({ error: "Failed to update link" });
    }
  });

  // Delete link
  app.delete("/api/links/:id", async (req, res) => {
    try {
      const result = await storage.deleteLink(req.params.id);
      if (!result) {
        return res.status(404).json({ error: "Link not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete link" });
    }
  });

  return httpServer;
}
