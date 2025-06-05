"use client";
import React, { useState, useEffect } from "react";
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
import { LoaderCircle, Plus, Edit, Trash2, X } from "lucide-react";

interface Laywer {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

const API_URL = "/api/lawyer";

export default function LawyersAdminPage() {
  const [laywers, setLaywers] = useState<Laywer[]>([]);
  const [form, setForm] = useState<Partial<Laywer>>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [showForm, setShowForm] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Fetch laywers
  const fetchLaywers = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setLaywers(data);
    } catch {
      setError("Failed to fetch lawyers");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLaywers();
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
          body: JSON.stringify({ id: editId, name: form.name, email: form.email }),
        });
      } else {
        // Add
        response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, email: form.email }),
        });
      }

      if (!response.ok) {
        throw new Error("Operation failed");
      }

      setForm({});
      setEditId(null);
      setShowForm(false);
      fetchLaywers();
    } catch {
      setError("Operation failed. Please try again.");
    }
    setSubmitting(false);
  };

  // Handle edit
  const handleEdit = (laywer: Laywer) => {
    setForm({ name: laywer.name, email: laywer.email });
    setEditId(laywer.id);
    setShowForm(true);
    setError("");
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

      fetchLaywers();
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
  };

  // Client side pagination
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Filter lawyers based on search
  const filteredLawyers = laywers.filter((l) => {
    const nameMatch = l.name.toLowerCase().includes(search.toLowerCase());
    const emailMatch = l.email.toLowerCase().includes(search.toLowerCase());
    return nameMatch || emailMatch;
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
      // Show ellipsis logic for more than 7 pages
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);

      // Always show page 1
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

      // Show ellipsis after page 1 if needed
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Show pages around current page
      for (let i = Math.max(2, startPage); i <= Math.min(totalPages - 1, endPage); i++) {
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

      // Show ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis-end">
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

      {/* Search and New Lawyer Button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3"
        />
        <Button onClick={handleNewLawyer} variant="default" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Lawyer
        </Button>
      </div>

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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLawyers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                      {search ? "No lawyers found matching your search." : "No lawyers found. Add your first lawyer!"}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedLawyers.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{l.name}</TableCell>
                      <TableCell>{l.email}</TableCell>
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
            {search && ` (filtered from ${laywers.length} total)`}
          </div>
        </>
      )}
    </div>
  );
}
