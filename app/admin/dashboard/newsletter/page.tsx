"use client"; 
import { useEffect, useState } from "react";
import { isPrimaryPointer, motion } from "framer-motion";
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

    // Mobile Card Component
    const MobileNewsletterCard = ({ item }: { item: Newsletter }) => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-200 p-3 space-y-2 shadow-sm"
        >
            {/* Header with type and status */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {getTypeIcon(item.type)}
                    <span className="text-xs font-medium text-gray-900 capitalize">{item.type}</span>
                </div>
                <span
                    className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${item.is_published
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                >
                    {item.is_published ? "Published" : "Draft"}
                </span>
            </div>

            {/* Title and content */}
            <div>
                <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                    {item.title}
                </p>
                {item.content && (
                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                        {item.content}
                    </p>
                )}
            </div>

            {/* Date and actions */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                    {formatDate(new Date(item.created_at))}
                </span>
                <div className="flex items-center gap-1">
                    <Link href={`/admin/dashboard/newsletter/${item.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <PencilSimple size={16} className="text-blue-600" />
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleDelete(item.id)}
                    >
                        <Trash size={16} className="text-red-600" />
                    </Button>
                </div>
            </div>
        </motion.div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brown-dark mx-auto"></div>
                    <p className="text-gray-600 mt-4 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3 md:space-y-6 overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl md:text-3xl font-bold text-gray-900">Newsletter & Broadcasts</h1>
                    <p className="text-xs md:text-sm text-gray-600 mt-0.5">Manage reports, news, and announcements</p>
                </div>
                <Link href="/admin/dashboard/newsletter/create">
                    <Button className="bg-brown-dark hover:bg-brown-medium text-white text-xs md:text-sm h-9 md:h-10 w-full sm:w-auto">
                        <Plus size={16} className="mr-1.5" />
                        Create New
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-2 md:p-4 rounded-xl shadow-sm border border-gray-200 space-y-2 md:space-y-0 md:flex md:gap-4">
                <div className="flex-1 relative">
                    <MagnifyingGlass
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <Input
                        placeholder="Search by title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-9 md:h-10 text-sm"
                    />
                </div>
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                    {["all", "report", "news", "pdf", "broadcast", "calendar"].map((type) => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors ${selectedType === type
                                    ? "bg-brown-dark text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Mobile View - Cards */}
            <div className="md:hidden space-y-2">
                {filteredNewsletters.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                        <p className="text-gray-500 text-sm">No items found</p>
                    </div>
                ) : (
                    filteredNewsletters.map((item) => (
                        <MobileNewsletterCard key={item.id} item={item} />
                    ))
                )}
            </div>

            {/* Desktop View - Table */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
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
        </div>
    );
}
