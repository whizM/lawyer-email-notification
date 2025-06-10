"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { LoaderCircle, Plus, Edit, Trash2, X, Upload, FileText } from "lucide-react";

interface Lawyer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  zip?: string;
  longitude?: string;
  address?: string;
  latitude?: string;
  createdAt?: string;
  updatedAt?: string;
}

const API_URL = "/api/lawyer";

export default function LawyersAdminPage() {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [form, setForm] = useState<Partial<Lawyer>>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [showForm, setShowForm] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch lawyers
  const fetchLawyers = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setLawyers(data);
    } catch {
      setError("Failed to fetch lawyers");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLawyers();
  }, []);

  // Handle form change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle new lawyer
  const handleNewLawyer = () => {
    setForm({});
    setEditId(null);
    setShowForm(true);
    setError("");
    setUploadSuccess("");
  };

  // Handle add or update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (!form.name || !form.email) {
      setError("Name and email are required");
      setSubmitting(false);
      return;
    }

    try {
      let response;
      if (editId) {
        // Update
        response = await fetch(API_URL, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editId, name: form.name, email: form.email, phone: form.phone }),
        });
      } else {
        // Add
        response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone }),
        });
      }

      if (!response.ok) {
        throw new Error("Operation failed");
      }

      setForm({});
      setEditId(null);
      setShowForm(false);
      fetchLawyers();
    } catch {
      setError("Operation failed. Please try again.");
    }
    setSubmitting(false);
  };

  // Handle edit
  const handleEdit = (lawyer: Lawyer) => {
    setForm({ name: lawyer.name, email: lawyer.email, phone: lawyer.phone, city: lawyer.city, state: lawyer.state, zip: lawyer.zip, longitude: lawyer.longitude, latitude: lawyer.latitude, address: lawyer.address });
    setEditId(lawyer.id);
    setShowForm(true);
    setError("");
    setUploadSuccess("");
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lawyer?")) return;

    try {
      const response = await fetch(API_URL, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      fetchLawyers();
    } catch {
      setError("Failed to delete lawyer. Please try again.");
    }
  };

  // Handle cancel edit
  const handleCancel = () => {
    setForm({});
    setEditId(null);
    setShowForm(false);
    setError("");
    setUploadSuccess("");
  };

  // Handle CSV upload
  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    setUploadSuccess("");

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/lawyer/csv', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      setUploadSuccess(result.message);
      if (result.errors && result.errors.length > 0) {
        setError(`Warnings: ${result.errors.join('; ')}`);
      }
      fetchLawyers();
    } catch (error) {
      setError(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Client side pagination
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Filter lawyers based on search
  const filteredLawyers = lawyers.filter((l) => {
    const nameMatch = l.name.toLowerCase().includes(search.toLowerCase());
    const emailMatch = l.email.toLowerCase().includes(search.toLowerCase());
    const phoneMatch = l.phone?.toLowerCase().includes(search.toLowerCase());
    const cityMatch = l.city?.toLowerCase().includes(search.toLowerCase());
    const stateMatch = l.state?.toLowerCase().includes(search.toLowerCase());
    const zipMatch = l.zip?.toLowerCase().includes(search.toLowerCase());
    return nameMatch || emailMatch || phoneMatch || cityMatch || stateMatch || zipMatch;
  });

  const totalPages = Math.ceil(filteredLawyers.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedLawyers = filteredLawyers.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Pagination logic with ellipsis
  const renderPaginationItems = () => {
    const items = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => setCurrentPage(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Always show first page
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => setCurrentPage(1)}
            isActive={currentPage === 1}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      // Show ellipsis and current page area
      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          items.push(
            <PaginationItem key={i}>
              <PaginationLink
                onClick={() => setCurrentPage(i)}
                isActive={currentPage === i}
                className="cursor-pointer"
              >
                {i}
              </PaginationLink>
            </PaginationItem>
          );
        }
      }

      // Show ellipsis before last page if needed
      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Always show last page (if more than 1 page)
      if (totalPages > 1) {
        items.push(
          <PaginationItem key={totalPages}>
            <PaginationLink
              onClick={() => setCurrentPage(totalPages)}
              isActive={currentPage === totalPages}
              className="cursor-pointer"
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    return items;
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Lawyer Management</h1>

      {/* Search and Action Buttons */}
      <div className="flex flex-col lg:flex-row justify-between items-center mb-6 gap-4">
        <Input
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full lg:w-1/3"
        />
        <div className="flex gap-2">
          <Button
            onClick={triggerFileInput}
            variant="outline"
            className="flex items-center gap-2"
            disabled={uploading}
          >
            {uploading ? (
              <LoaderCircle className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {uploading ? "Uploading..." : "Upload CSV"}
          </Button>
          <Button onClick={handleNewLawyer} variant="default" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Lawyer
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleCsvUpload}
        style={{ display: 'none' }}
      />

      {/* CSV Upload Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-2">
          <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">CSV Upload Format</h3>
            <p className="text-sm text-blue-700">
              Upload a CSV file with columns: <strong>Attorney</strong> (or Name), <strong>Phone</strong>, <strong>Email</strong>, <strong>Address</strong>, <strong>City</strong>, <strong>State</strong>, <strong>Zip</strong>, <strong>Geocodio Longitude</strong>, <strong>Geocodio Latitude</strong>
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Email, Address, Geocodio Longitude, and Geocodio Latitude columns are required for each lawyer. Phone, City, State, Zip, are optional.
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {uploadSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {uploadSuccess}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {editId ? "Edit Lawyer" : "Add New Lawyer"}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                value={form.name || ""}
                onChange={handleChange}
                placeholder="Enter lawyer's name"
                className="w-full"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email || ""}
                onChange={handleChange}
                placeholder="Enter lawyer's email"
                className="w-full"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone || ""}
                onChange={handleChange}
                placeholder="Enter lawyer's phone number"
                className="w-full"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2"
              >
                {submitting ? (
                  <LoaderCircle className="w-4 h-4 animate-spin" />
                ) : null}
                {editId ? "Update Lawyer" : "Add Lawyer"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoaderCircle className="animate-spin w-8 h-8" />
        </div>
      ) : (
        <>
          {/* Lawyers Table */}
          <div className="bg-white rounded-lg shadow-sm border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Zip</TableHead>
                  <TableHead>Longitude</TableHead>
                  <TableHead>Latitude</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLawyers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      {search ? "No lawyers found matching your search." : "No lawyers found. Add your first lawyer!"}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedLawyers.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{l.name}</TableCell>
                      <TableCell>{l.email}</TableCell>
                      <TableCell>{l.phone || "—"}</TableCell>
                      <TableCell>{l.address || "—"}</TableCell>
                      <TableCell>{l.city || "—"}</TableCell>
                      <TableCell>{l.state || "—"}</TableCell>
                      <TableCell>{l.zip || "—"}</TableCell>
                      <TableCell>{l.longitude || "—"}</TableCell>
                      <TableCell>{l.latitude || "—"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(l)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(l.id)}
                            className="flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {renderPaginationItems()}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {/* Results Summary */}
          <div className="text-center text-sm text-gray-600 mt-4">
            Showing {Math.min(startIndex + 1, filteredLawyers.length)} to {Math.min(endIndex, filteredLawyers.length)} of {filteredLawyers.length} lawyers
            {search && ` (filtered from ${lawyers.length} total)`}
          </div>
        </>
      )}
    </div>
  );
}
