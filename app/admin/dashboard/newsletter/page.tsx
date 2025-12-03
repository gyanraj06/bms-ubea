"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Plus,
    PencilSimple,
    Trash,
    FilePdf,
    Newspaper,
    Megaphone,
    CalendarBlank,
    ChartBar,
    MagnifyingGlass,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";

interface Newsletter {
    id: string;
    title: string;
    type: 'report' | 'news' | 'pdf' | 'broadcast' | 'calendar';
    content?: string;
    file_url?: string;
    created_at: string;
    is_published: boolean;
}

export default function NewsletterPage() {
    const router = useRouter();
    const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState<string>("all");

    useEffect(() => {
        fetchNewsletters();
    }, []);

    const fetchNewsletters = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            if (!token) return;

            const response = await fetch("/api/admin/newsletter", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setNewsletters(data.newsletters || []);
            } else {
                toast.error("Failed to fetch newsletters");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return;

        try {
            const token = localStorage.getItem("adminToken");
            const response = await fetch(`/api/admin/newsletter/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                toast.success("Item deleted successfully");
                fetchNewsletters();
            } else {
                toast.error("Failed to delete item");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Something went wrong");
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "report":
                return <ChartBar size={20} className="text-blue-600" />;
            case "news":
                return <Newspaper size={20} className="text-green-600" />;
            case "pdf":
                return <FilePdf size={20} className="text-red-600" />;
            case "broadcast":
                return <Megaphone size={20} className="text-orange-600" />;
            case "calendar":
                return <CalendarBlank size={20} className="text-purple-600" />;
            default:
                return <Newspaper size={20} className="text-gray-600" />;
        }
    };

    const filteredNewsletters = newsletters.filter((item) => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === "all" || item.type === selectedType;
        return matchesSearch && matchesType;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-dark"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Newsletter & Broadcasts</h1>
                    <p className="text-gray-600 mt-1">Manage reports, news, and announcements</p>
                </div>
                <Link href="/admin/dashboard/newsletter/create">
                    <Button className="bg-brown-dark hover:bg-brown-medium text-white">
                        <Plus size={20} className="mr-2" />
                        Create New
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <MagnifyingGlass
                        size={20}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <Input
                        placeholder="Search by title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    {["all", "report", "news", "pdf", "broadcast", "calendar"].map((type) => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedType === type
                                    ? "bg-brown-dark text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredNewsletters.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    No items found
                                </td>
                            </tr>
                        ) : (
                            filteredNewsletters.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {getTypeIcon(item.type)}
                                            <span className="text-sm text-gray-900 capitalize">{item.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                            {item.title}
                                        </p>
                                        {item.content && (
                                            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                                                {item.content}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(new Date(item.created_at))}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 py-1 text-xs font-medium rounded-full ${item.is_published
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-gray-100 text-gray-800"
                                                }`}
                                        >
                                            {item.is_published ? "Published" : "Draft"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/admin/dashboard/newsletter/${item.id}`}>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <PencilSimple size={18} className="text-blue-600" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => handleDelete(item.id)}
                                            >
                                                <Trash size={18} className="text-red-600" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
