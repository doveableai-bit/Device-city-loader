import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit2, LogOut } from "lucide-react";
import { motion } from "framer-motion";

interface Ad {
  id: string;
  url: string;
  title: string;
  description?: string;
  viewDuration: number;
  isActive: boolean;
}

export default function AdminAds() {
  const { logout } = useAuth();
  const [, setLocation] = useLocation();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [formData, setFormData] = useState({
    url: "",
    title: "",
    description: "",
    viewDuration: 30,
  });

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const response = await fetch("/api/ads");
      const data = await response.json();
      setAds(data);
    } catch (error) {
      console.error("Failed to fetch ads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAd = async () => {
    if (!formData.url || !formData.title) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const method = editingAd ? "PUT" : "POST";
      const url = editingAd ? `/api/ads/${editingAd.id}` : "/api/ads";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ url: "", title: "", description: "", viewDuration: 25 });
        setEditingAd(null);
        setDialogOpen(false);
        fetchAds();
      }
    } catch (error) {
      console.error("Failed to save ad:", error);
    }
  };

  const handleDeleteAd = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;

    try {
      const response = await fetch(`/api/ads/${id}`, { method: "DELETE" });
      if (response.ok) {
        fetchAds();
      }
    } catch (error) {
      console.error("Failed to delete ad:", error);
    }
  };

  const handleEditAd = (ad: Ad) => {
    setEditingAd(ad);
    setFormData({
      url: ad.url,
      title: ad.title,
      description: ad.description || "",
      viewDuration: ad.viewDuration,
    });
    setDialogOpen(true);
  };

  const handleOpenDialog = () => {
    setEditingAd(null);
    setFormData({ url: "", title: "", description: "", viewDuration: 25 });
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-8">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Admin - Manage Ads</h1>
          <div className="flex items-center gap-3">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleOpenDialog} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add New Ad
                </Button>
              </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700">
              <DialogHeader>
                <DialogTitle>{editingAd ? "Edit Ad" : "Create New Ad"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 block mb-2">Ad URL *</label>
                  <Input
                    placeholder="https://example.com"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 block mb-2">Title *</label>
                  <Input
                    placeholder="Ad Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 block mb-2">Description</label>
                  <Textarea
                    placeholder="Ad Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 block mb-2">View Duration (seconds, 20-30)</label>
                  <Input
                    type="number"
                    min="20"
                    max="30"
                    value={formData.viewDuration}
                    onChange={(e) => setFormData({ ...formData, viewDuration: parseInt(e.target.value) })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <Button
                  onClick={handleAddAd}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {editingAd ? "Update Ad" : "Create Ad"}
                </Button>
              </div>
            </DialogContent>
            </Dialog>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        {loading ? (
          <Card className="p-8 text-center text-slate-400">Loading ads...</Card>
        ) : ads.length === 0 ? (
          <Card className="p-8 text-center text-slate-400">
            No ads yet. Click "Add New Ad" to create one.
          </Card>
        ) : (
          <Card className="overflow-hidden border-slate-700">
            <Table>
              <TableHeader className="bg-slate-800">
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ads.map((ad, idx) => (
                  <motion.tr
                    key={ad.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-slate-700 hover:bg-slate-800/50"
                  >
                    <TableCell className="font-medium">{ad.title}</TableCell>
                    <TableCell className="text-sm text-slate-400 truncate max-w-xs">{ad.url}</TableCell>
                    <TableCell>{ad.viewDuration}s</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        ad.isActive
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}>
                        {ad.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditAd(ad)}
                        className="border-slate-600 hover:bg-slate-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteAd(ad.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
}
