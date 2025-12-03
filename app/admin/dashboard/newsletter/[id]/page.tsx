"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, UploadSimple, X, FilePdf, Image as ImageIcon, FileText } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Attachment {
    name: string;
    url: string;
    type: string;
}

export default function EditNewsletterPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [existingAttachments, setExistingAttachments] = useState<Attachment[]>([]);
    const [formData, setFormData] = useState({
        title: "",
        type: "news",
        content: "",
        is_published: true,
    });

    useEffect(() => {
        fetchNewsletter();
    }, []);

    const fetchNewsletter = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            if (!token) return;

            const response = await fetch(`/api/admin/newsletter/${params.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setFormData({
                    title: data.newsletter.title,
                    type: data.newsletter.type,
                    content: data.newsletter.content || "",
                    is_published: data.newsletter.is_published,
                });

                // Handle attachments
                if (data.newsletter.attachments && Array.isArray(data.newsletter.attachments)) {
                    setExistingAttachments(data.newsletter.attachments);
                } else if (data.newsletter.file_url) {
                    // Backward compatibility for single file
                    setExistingAttachments([{
                        name: "Attachment",
                        url: data.newsletter.file_url,
                        type: "unknown"
                    }]);
                }
            } else {
                toast.error("Failed to fetch newsletter details");
                router.push("/admin/dashboard/newsletter");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setNewFiles((prev) => [...prev, ...files]);
        }
    };

    const removeNewFile = (index: number) => {
        setNewFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const removeExistingAttachment = (index: number) => {
        setExistingAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return <ImageIcon size={20} className="text-purple-600" />;
        if (ext === 'pdf') return <FilePdf size={20} className="text-red-600" />;
        return <FileText size={20} className="text-blue-600" />;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const token = localStorage.getItem("adminToken");
            if (!token) {
                toast.error("Please login again");
                return;
            }

            const newAttachments: Attachment[] = [];

            // Upload new files
            for (const file of newFiles) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', file);

                const uploadResponse = await fetch('/api/admin/upload', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: uploadFormData,
                });

                const uploadData = await uploadResponse.json();

                if (!uploadResponse.ok || !uploadData.success) {
                    console.error(`Failed to upload ${file.name}:`, uploadData.error);
                    toast.error(`Failed to upload ${file.name}`);
                    continue;
                }

                newAttachments.push({
                    name: uploadData.name,
                    url: uploadData.url,
                    type: uploadData.type
                });
            }

            // Combine existing and new attachments
            const finalAttachments = [...existingAttachments, ...newAttachments];

            // Update newsletter
            const response = await fetch(`/api/admin/newsletter/${params.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    attachments: finalAttachments,
                    // Update file_url to the first attachment for backward compatibility
                    file_url: finalAttachments.length > 0 ? finalAttachments[0].url : "",
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Newsletter updated successfully");
                router.push("/admin/dashboard/newsletter");
            } else {
                toast.error(data.error || "Failed to update newsletter");
            }
        } catch (error: any) {
            console.error("Error:", error);
            toast.error(error.message || "Something went wrong");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-dark"></div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/dashboard/newsletter">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Item</h1>
                    <p className="text-gray-600">Update newsletter details</p>
                </div>
            </div>

            {/* Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter title..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Type</Label>
                            <select
                                id="type"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="news">News</option>
                                <option value="report">Report</option>
                                <option value="pdf">PDF Document</option>
                                <option value="broadcast">Broadcast</option>
                                <option value="calendar">Calendar</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Content / Description</Label>
                        <Textarea
                            id="content"
                            rows={5}
                            value={formData.content}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, content: e.target.value })}
                            placeholder="Enter content..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Attachments</Label>

                        {/* Existing Attachments */}
                        {existingAttachments.length > 0 && (
                            <div className="space-y-2 mb-4">
                                <p className="text-xs font-medium text-gray-500 uppercase">Current Attachments</p>
                                {existingAttachments.map((file, index) => (
                                    <div key={`existing-${index}`} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                                        <div className="flex items-center gap-3">
                                            {getFileIcon(file.name)}
                                            <div>
                                                <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-900 hover:underline">
                                                    {file.name}
                                                </a>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeExistingAttachment(index)}
                                            className="p-1 hover:bg-red-100 text-gray-400 hover:text-red-600 rounded-full transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* New Files List */}
                        {newFiles.length > 0 && (
                            <div className="space-y-2 mb-4">
                                <p className="text-xs font-medium text-gray-500 uppercase">New Uploads</p>
                                {newFiles.map((file, index) => (
                                    <div key={`new-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center gap-3">
                                            {getFileIcon(file.name)}
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeNewFile(index)}
                                            className="p-1 hover:bg-red-100 text-gray-400 hover:text-red-600 rounded-full transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Upload Area */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors relative">
                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            />
                            <div className="flex flex-col items-center gap-2">
                                <UploadSimple size={32} className="text-gray-400" />
                                <p className="text-sm font-medium text-gray-900">
                                    Click to upload or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">
                                    PDF, Images, or Documents (max 10MB)
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_published"
                            checked={formData.is_published}
                            onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300 text-brown-dark focus:ring-brown-dark"
                        />
                        <Label htmlFor="is_published" className="font-normal">
                            Publish immediately
                        </Label>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <Link href="/admin/dashboard/newsletter">
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={saving}
                            className="bg-brown-dark hover:bg-brown-medium text-white min-w-[120px]"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
