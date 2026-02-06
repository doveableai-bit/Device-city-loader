import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2, Edit2, Plus, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import type { Link as LinkType } from "@shared/schema";

const DEMO_LINKS: LinkType[] = [];

export default function AdminLinks() {
  const { logout } = useAuth();
  const [, setLocation] = useLocation();
  const [links, setLinks] = useState<LinkType[]>(DEMO_LINKS);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    url: "",
    title: "",
    category: "smart",
    viewDuration: "40",
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/links");
      if (response.ok) {
        const data = await response.json();
        setLinks(Array.isArray(data) ? data : []);
      } else {
        setLinks([]);
      }
    } catch (error) {
      console.error("Failed to fetch links", error);
      setLinks([]);
    } finally {
      setIsLoading(false);
    }
  };


  const handleAddClick = () => {
    setEditingId(null);
    setFormData({ url: "", title: "", category: "smart", viewDuration: "40" });
    setShowForm(true);
  };

  const handleEditClick = (link: LinkType) => {
    setFormData({
      url: link.url,
      title: link.title,
      category: link.category,
      viewDuration: String((link as any).viewDuration ?? 40),
    });
    setEditingId(link.id);
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.url || !formData.title || !formData.category) {
      toast.error("Please fill all fields");
      return;
    }

    // Validate URL format
    try {
      new URL(formData.url);
    } catch {
      toast.error("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    try {
      const parsedDuration = Number(formData.viewDuration);
      const payload = {
        url: formData.url.trim(),
        title: formData.title.trim(),
        category: formData.category,
        viewDuration: Number.isFinite(parsedDuration)
          ? Math.max(5, parsedDuration)
          : 40,
      };

      console.log("Submitting link:", payload);

      if (editingId) {
        const response = await fetch(`/api/links/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const responseText = await response.text();
        console.log("Update response:", response.status, response.statusText, responseText);

        if (response.ok) {
          const updatedLink = JSON.parse(responseText);
          setLinks(links.map(l => l.id === editingId ? updatedLink : l));
          await fetchLinks();
          toast.success("Link updated successfully!");
        } else {
          toast.error(`Failed to update link: ${responseText}`);
        }
      } else {
        const response = await fetch("/api/links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const responseText = await response.text();
        console.log("Create response:", response.status, response.statusText, responseText);

        if (response.ok) {
          const newLink = JSON.parse(responseText);
          console.log("New link added:", newLink);
          setLinks([...links, newLink]);
          await fetchLinks();
          toast.success("Link added successfully!");
        } else {
          console.error("API Error response:", response.status, responseText);
          toast.error(`Failed to add link: ${responseText || response.statusText}`);
        }
      }

      setFormData({ url: "", title: "", category: "smart", viewDuration: "40" });
      setEditingId(null);
      setShowForm(false);
    } catch (error) {
      console.error("Error:", error);
      toast.error(`Error saving link: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteClick = async (id: string) => {
    try {
      const response = await fetch(`/api/links/${id}`, { method: "DELETE" });
      if (response.ok) {
        setLinks(links.filter(l => l.id !== id));
        toast.success("Link deleted");
        setDeleteConfirm(null);
      } else {
        toast.error("Failed to delete link");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error deleting link");
    }
  };

  const handleLogout = () => {
    logout();
    setLocation("/");
    toast.success("Logged out");
  };

  const smartLinks = links.filter((l) => l.category === "smart");
  const adstera = links.filter((l) => l.category === "adstera");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading links...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-slate-400">Manage links that power surfing</p>
          </div>
          <Button variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Add Button */}
        <div className="mb-6">
          <Button onClick={handleAddClick} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add New Link
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingId ? "Edit Link" : "Add New Link"}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                <Input
                  type="text"
                  placeholder="e.g., Smart Monetag Link 1"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">URL</label>
                <Input
                  type="text"
                  placeholder="https://example.com"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                  pattern="https?://.+"
                  title="Please enter a valid URL starting with http:// or https://"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 w-full"
                  required
                >
                  <option value="smart">Smart Monetag</option>
                  <option value="adstera">Adstera</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">View Duration (seconds)</label>
                <Input
                  type="number"
                  min="5"
                  max="600"
                  value={formData.viewDuration}
                  onChange={(e) => setFormData({ ...formData, viewDuration: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingId ? "Update Link" : "Create Link"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ url: "", title: "", category: "smart", viewDuration: "40" });
                  }}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Smart Monetag Links */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-400 rounded-full"></span>
              Smart Monetag ({smartLinks.length})
            </h2>
          </div>
          {smartLinks.length > 0 ? (
            <div className="divide-y divide-slate-700">
              {smartLinks.map((link) => (
                <div key={link.id} className="p-4 hover:bg-slate-700/50 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-slate-300 font-medium">{link.title}</p>
                    <p className="text-xs text-slate-500">
                      Duration: {(link as any).viewDuration ?? 30}s
                    </p>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                    >
                      {link.url.substring(0, 50)}...
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(link)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-slate-700"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirm(link.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-slate-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-8">No Smart Monetag links</div>
          )}
        </div>

        {/* Adstera Links */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-400 rounded-full"></span>
              Adstera ({adstera.length})
            </h2>
          </div>
          {adstera.length > 0 ? (
            <div className="divide-y divide-slate-700">
              {adstera.map((link) => (
                <div key={link.id} className="p-4 hover:bg-slate-700/50 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-slate-300 font-medium">{link.title}</p>
                    <p className="text-xs text-slate-500">
                      Duration: {(link as any).viewDuration ?? 30}s
                    </p>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                    >
                      {link.url.substring(0, 50)}...
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(link)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-slate-700"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirm(link.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-slate-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-8">No Adstera links</div>
          )}
        </div>

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-sm">
              <h3 className="text-white font-bold text-lg mb-2">Delete Link?</h3>
              <p className="text-slate-400 mb-4">This action cannot be undone.</p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteClick(deleteConfirm)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
