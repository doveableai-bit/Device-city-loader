import { type User, type InsertUser, type Ad, type InsertAd, type AdView, type Link, type InsertLink } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Ad operations
  getAds(activeOnly?: boolean): Promise<Ad[]>;
  getAdById(id: string): Promise<Ad | undefined>;
  createAd(ad: InsertAd): Promise<Ad>;
  updateAd(id: string, ad: Partial<InsertAd>): Promise<Ad | undefined>;
  deleteAd(id: string): Promise<boolean>;

  // Ad view operations
  recordAdView(view: { userId: string; adId: string; duration?: number }): Promise<AdView>;
  getUserAdViews(userId: string): Promise<AdView[]>;
  getAdStats(adId: string): Promise<{ totalViews: number; avgDuration: number }>;

  // Link operations
  getLinks(activeOnly?: boolean): Promise<Link[]>;
  getLinkById(id: string): Promise<Link | undefined>;
  createLink(link: InsertLink): Promise<Link>;
  updateLink(id: string, link: Partial<InsertLink>): Promise<Link | undefined>;
  deleteLink(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private ads: Map<string, Ad>;
  private adViews: Array<AdView>;
  private links: Map<string, Link>;

  constructor() {
    this.users = new Map();
    this.ads = new Map();
    this.adViews = [];
    this.links = new Map();

    // Initialize with admin-managed links
    const smartLinks = [
      { id: "smart1", title: "Smart Monetag 1", url: "https://otieu.com/4/10552505", category: "smart" as const, viewDuration: 40 },
      { id: "smart2", title: "Smart Monetag 2", url: "https://otieu.com/4/10554663", category: "smart" as const, viewDuration: 40 },
      { id: "smart3", title: "Smart Monetag 3", url: "https://otieu.com/4/10554664", category: "smart" as const, viewDuration: 40 },
      { id: "smart4", title: "Smart Monetag 4", url: "https://otieu.com/4/10554669", category: "smart" as const, viewDuration: 40 },
    ];

    const adstera = [
      { id: "adstera1", title: "Adstera Link 1", url: "https://www.effectivegatecpm.com/ez5uqew0q?key=43835e559a634d0bd01dd83d56a7c669", category: "adstera" as const, viewDuration: 40 },
      { id: "adstera2", title: "Adstera Link 2", url: "https://www.effectivegatecpm.com/xzh90qd2hb?key=10b32712d4294c44ddd6824564e7ad92", category: "adstera" as const, viewDuration: 40 },
      { id: "adstera3", title: "Adstera Link 3", url: "https://www.effectivegatecpm.com/xzh90qd2hb?key=10b32712d4294c44ddd6824564e7ad92", category: "adstera" as const, viewDuration: 40 },
      { id: "adstera4", title: "Adstera Link 4", url: "https://www.effectivegatecpm.com/cp9f4q4kdn?key=febf55050321ec137fda7a9102169c31", category: "adstera" as const, viewDuration: 40 },
      { id: "adstera5", title: "Adstera Link 5", url: "https://www.effectivegatecpm.com/z9mxqm8te5?key=1cabdb29ec3325104ed2fde2e2af3036", category: "adstera" as const, viewDuration: 40 },
      { id: "adstera6", title: "Adstera Link 6", url: "https://www.effectivegatecpm.com/fhvh1z01?key=8dd1538a2fc57d8fd48531ca66f495e3", category: "adstera" as const, viewDuration: 40 },
    ];

    [...smartLinks, ...adstera].forEach((link) => {
      this.links.set(link.id, {
        ...link,
        isActive: true,
        createdAt: new Date(),
      } as Link);
    });
  }

  // ==================== USER OPERATIONS ====================
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // ==================== AD OPERATIONS ====================
  async getAds(activeOnly: boolean = false): Promise<Ad[]> {
    const ads = Array.from(this.ads.values());
    return activeOnly ? ads.filter((ad) => ad.isActive) : ads;
  }

  async getAdById(id: string): Promise<Ad | undefined> {
    return this.ads.get(id);
  }

  async createAd(ad: InsertAd): Promise<Ad> {
    const id = randomUUID();
    const newAd: Ad = {
      url: ad.url,
      title: ad.title,
      description: ad.description || null,
      viewDuration: ad.viewDuration || 30,
      id,
      isActive: true,
      createdAt: new Date(),
    };
    this.ads.set(id, newAd);
    return newAd;
  }

  async updateAd(id: string, updates: Partial<InsertAd>): Promise<Ad | undefined> {
    const ad = this.ads.get(id);
    if (!ad) return undefined;

    const updated: Ad = {
      ...ad,
      ...updates,
      id: ad.id,
      createdAt: ad.createdAt,
    };
    this.ads.set(id, updated);
    return updated;
  }

  async deleteAd(id: string): Promise<boolean> {
    return this.ads.delete(id);
  }

  // ==================== AD VIEW OPERATIONS ====================
  async recordAdView(view: { userId: string; adId: string; duration?: number }): Promise<AdView> {
    const adView: AdView = {
      id: randomUUID(),
      userId: view.userId,
      adId: view.adId,
      duration: view.duration || 30,
      viewedAt: new Date(),
    };
    this.adViews.push(adView);
    return adView;
  }

  async getUserAdViews(userId: string): Promise<AdView[]> {
    return this.adViews.filter((view) => view.userId === userId);
  }

  async getAdStats(adId: string): Promise<{ totalViews: number; avgDuration: number }> {
    const views = this.adViews.filter((view) => view.adId === adId);
    const totalViews = views.length;
    const avgDuration = totalViews > 0
      ? views.reduce((sum, view) => sum + (view.duration || 0), 0) / totalViews
      : 0;

    return { totalViews, avgDuration };
  }

  // ==================== LINK OPERATIONS ====================
  async getLinks(activeOnly: boolean = false): Promise<Link[]> {
    const links = Array.from(this.links.values());
    return activeOnly ? links.filter((link) => link.isActive) : links;
  }

  async getLinkById(id: string): Promise<Link | undefined> {
    return this.links.get(id);
  }

  async createLink(link: InsertLink): Promise<Link> {
    const id = randomUUID();
    const newLink: Link = {
      url: link.url,
      title: link.title,
      category: link.category,
      viewDuration: link.viewDuration ?? 40,
      id,
      isActive: true,
      createdAt: new Date(),
    };
    this.links.set(id, newLink);
    return newLink;
  }

  async updateLink(id: string, updates: Partial<InsertLink>): Promise<Link | undefined> {
    const link = this.links.get(id);
    if (!link) return undefined;

    const updated: Link = {
      ...link,
      ...updates,
      id: link.id,
      createdAt: link.createdAt,
    };
    this.links.set(id, updated);
    return updated;
  }

  async deleteLink(id: string): Promise<boolean> {
    return this.links.delete(id);
  }
}

export const storage = new MemStorage();
