"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  RefreshCw,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { CONFIG } from "@/lib/config";
import { getAccessToken, clearTokens, isAuthenticated } from "@/lib/auth";

interface Position {
  id: number;
  position_code: string;
  position_name: string;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    null
  );

  const [positionCode, setPositionCode] = useState("");
  const [positionName, setPositionName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPositions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAccessToken();
      const response = await fetch(
        `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.POSITIONS}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (response.status === 401) {
        clearTokens();
        router.push(CONFIG.ROUTES.LOGIN);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch positions");
      }

      const data = await response.json();
      setPositions(Array.isArray(data) ? data : data.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push(CONFIG.ROUTES.LOGIN);
      return;
    }
    fetchPositions();
  }, [router, fetchPositions]);

  const handleLogout = () => {
    clearTokens();
    router.push(CONFIG.ROUTES.LOGIN);
  };

  const openCreateModal = () => {
    setPositionCode("");
    setPositionName("");
    setIsCreateOpen(true);
  };

  const openEditModal = (position: Position) => {
    setSelectedPosition(position);
    setPositionCode(position.position_code);
    setPositionName(position.position_name);
    setIsEditOpen(true);
  };

  const openViewModal = (position: Position) => {
    setSelectedPosition(position);
    setIsViewOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = getAccessToken();
      const response = await fetch(
        `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.POSITIONS}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            position_code: positionCode,
            position_name: positionName,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to create position");

      setIsCreateOpen(false);
      fetchPositions();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error creating position");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPosition) return;
    setSubmitting(true);
    try {
      const token = getAccessToken();
      const response = await fetch(
        `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.POSITIONS}/${selectedPosition.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            position_code: positionCode,
            position_name: positionName,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update position");

      setIsEditOpen(false);
      fetchPositions();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error updating position");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this position?")) return;
    try {
      const token = getAccessToken();
      const response = await fetch(
        `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.POSITIONS}/${id}`,
        {
          method: "DELETE",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete position");

      fetchPositions();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error deleting position");
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? dateString
      : `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <header className="flex items-start justify-between pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 font-serif">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500 font-serif">
              Manage organization positions
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </header>

        {/* Main Card */}
        <main className="mt-8 border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900 font-serif">
                Positions
              </h2>
              <p className="text-sm text-gray-500 font-serif">
                A list of all positions stored in the backend.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchPositions}
                disabled={loading}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Read / Refresh
              </button>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Create Position
              </button>
            </div>
          </div>

          {error && (
            <div className="mx-6 mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto px-6 pb-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-sm font-semibold text-gray-700 font-serif">
                  <th className="py-3.5 pr-4 w-20">ID</th>
                  <th className="py-3.5 px-4 w-40">Position Code</th>
                  <th className="py-3.5 px-4">Position Name</th>
                  <th className="py-3.5 px-4 w-40">Created At</th>
                  <th className="py-3.5 pl-4 text-right w-64">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-800 font-serif">
                {loading && positions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      Loading positions...
                    </td>
                  </tr>
                ) : positions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No positions found.
                    </td>
                  </tr>
                ) : (
                  positions.map((pos) => (
                    <tr
                      key={pos.id}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      <td className="py-3.5 pr-4">{pos.id}</td>
                      <td className="py-3.5 px-4">{pos.position_code}</td>
                      <td className="py-3.5 px-4">{pos.position_name}</td>
                      <td className="py-3.5 px-4">
                        {formatDate(pos.created_at)}
                      </td>
                      <td className="py-3.5 pl-4 text-right">
                        <div className="inline-flex items-center justify-end gap-2 font-sans">
                          <button
                            onClick={() => openViewModal(pos)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Read
                          </button>
                          <button
                            onClick={() => openEditModal(pos)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Update
                          </button>
                          <button
                            onClick={() => handleDelete(pos.id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                Create Position
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position Code
                </label>
                <input
                  type="text"
                  required
                  value={positionCode}
                  onChange={(e) => setPositionCode(e.target.value)}
                  placeholder="e.g. Pres"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position Name
                </label>
                <input
                  type="text"
                  required
                  value={positionName}
                  onChange={(e) => setPositionName(e.target.value)}
                  placeholder="e.g. President"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {isEditOpen && selectedPosition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                Update Position #{selectedPosition.id}
              </h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position Code
                </label>
                <input
                  type="text"
                  required
                  value={positionCode}
                  onChange={(e) => setPositionCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position Name
                </label>
                <input
                  type="text"
                  required
                  value={positionName}
                  onChange={(e) => setPositionName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Read / View Modal */}
      {isViewOpen && selectedPosition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                Position Details
              </h3>
              <button
                onClick={() => setIsViewOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-500">ID:</span>{" "}
                <span className="text-gray-900">{selectedPosition.id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500">
                  Position Code:
                </span>{" "}
                <span className="text-gray-900">
                  {selectedPosition.position_code}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-500">
                  Position Name:
                </span>{" "}
                <span className="text-gray-900">
                  {selectedPosition.position_name}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-500">Created At:</span>{" "}
                <span className="text-gray-900">
                  {formatDate(selectedPosition.created_at)}
                </span>
              </div>
            </div>
            <div className="flex justify-end pt-5">
              <button
                onClick={() => setIsViewOpen(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}