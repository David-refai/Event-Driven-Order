"use client";

import React, { useState, useEffect } from 'react';
import { apiClient, Product, Category } from '@/lib/api';
import { API_BASE_URL } from '@/lib/config';
import {
    Plus,
    Search,
    MoreVertical,
    Edit2,
    Trash2,
    Image as ImageIcon,
    Tag,
    DollarSign,
    Layers,
    X,
    Upload
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from '@/components/ui/modal';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<string | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        inventory: '',
        categoryId: '',
        images: [] as string[],
    });
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const fetchData = async () => {
        try {
            const [pData, cData] = await Promise.all([
                apiClient.getProducts(),
                apiClient.getCategories()
            ]);
            setProducts(pData);
            setCategories(cData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            setNotification({ type: 'error', message: 'Failed to synchronize with server' });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product: Product) => {
        console.log(`Editing product: ${product.name}, images: ${product.images?.length || 0}`);
        setEditingProduct(product);

        // Reset and set form data cleanly
        const initialForm = {
            name: product.name || '',
            description: product.description || '',
            price: (product.price || 0).toString(),
            inventory: (product.inventory || 0).toString(),
            categoryId: product.category?.id?.toString() || '',
            images: [...(product.images || [])],
        };

        setFormData(initialForm);
        setSelectedFiles([]);
        setIsFormOpen(true);
    };

    const confirmDelete = (id: string) => {
        setProductToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!productToDelete) return;
        try {
            await apiClient.deleteProduct(productToDelete);
            setNotification({ type: 'success', message: 'Product successfully removed' });
            fetchData();
        } catch (error) {
            setNotification({ type: 'error', message: 'Technical error during deletion' });
        } finally {
            setProductToDelete(null);
            setIsDeleteDialogOpen(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const productData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                inventory: parseInt(formData.inventory),
                categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
                images: formData.images, // Pass remaining existing images
            };

            const data = new FormData();
            data.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json' }));

            selectedFiles.forEach(file => {
                data.append('files', file);
            });

            if (editingProduct) {
                await apiClient.updateProduct(editingProduct.id, data);
                setNotification({ type: 'success', message: 'Product updated successfully' });
            } else {
                await apiClient.createProduct(data);
                setNotification({ type: 'success', message: 'New product added successfully' });
            }

            setIsFormOpen(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error(error);
            setNotification({
                type: 'error',
                message: editingProduct ? 'Failed to update product details' : 'Failed to publish new product'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setEditingProduct(null);
        setFormData({ name: '', description: '', price: '', inventory: '', categoryId: '', images: [] });
        setSelectedFiles([]);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeExistingImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const removeNewFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700 relative">
            {/* Professional Notifications */}
            {notification && (
                <div className="fixed top-24 right-8 z-[150] animate-in slide-in-from-right duration-500">
                    <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl ${notification.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        }`}>
                        {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                        <span className="font-bold text-sm">{notification.message}</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white mb-2 font-outfit uppercase">Administrative Control</h1>
                    <p className="text-gray-500 font-medium">Manage your elite product catalog and inventory integrity.</p>
                </div>
                <Button
                    onClick={() => { resetForm(); setIsFormOpen(true); }}
                    className="h-14 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-[20px] font-black shadow-2xl shadow-blue-500/30 active:scale-95 transition-all flex items-center gap-3 overflow-hidden group"
                >
                    <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:rotate-90 transition-transform">
                        <Plus className="w-4 h-4" />
                    </div>
                    Deploy New Item
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Inventory', value: products.length, icon: Layers, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                    { label: 'Core Categories', value: categories.length, icon: Tag, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                    { label: 'Critical Stock', value: products.filter(p => (p.inventory || 0) < 10).length, icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-400/10' },
                ].map((stat, i) => (
                    <Card key={i} className="bg-white/5 border-white/10 rounded-[28px] overflow-hidden backdrop-blur-xl group hover:border-white/20 transition-colors">
                        <CardContent className="p-8 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                                <p className="text-4xl font-black text-white group-hover:text-blue-400 transition-colors">{stat.value}</p>
                            </div>
                            <div className={`w-16 h-16 ${stat.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Table Card */}
            <Card className="bg-white/5 border-white/10 rounded-[35px] overflow-hidden backdrop-blur-xl border-t-white/15">
                <CardHeader className="p-10 border-b border-white/5 flex flex-row items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                        <CardTitle className="text-2xl font-black text-white tracking-tight uppercase">Master Directory</CardTitle>
                    </div>
                    <div className="relative w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Filter data streams..."
                            className="h-12 bg-white/5 border-white/10 rounded-2xl pl-12 pr-4 text-sm focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 placeholder:text-gray-700 transition-all font-medium"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-white/5 bg-white/[0.01]">
                                    <th className="px-10 py-7">Product Profile</th>
                                    <th className="px-6 py-7">Classification</th>
                                    <th className="px-6 py-7">Valuation</th>
                                    <th className="px-6 py-7">Availability</th>
                                    <th className="px-10 py-7 text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-10 py-8 h-24 bg-white/5" />
                                        </tr>
                                    ))
                                ) : filteredProducts.map((product) => (
                                    <tr key={product.id} className="group hover:bg-white/[0.03] transition-all duration-300">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-white/10 overflow-hidden shadow-2xl group-hover:scale-105 transition-transform">
                                                    {product.images?.[0] ? (
                                                        <img
                                                            src={product.images[0].startsWith('http') ? product.images[0] : `${API_BASE_URL}${product.images[0]}`}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                                                            <ImageIcon className="w-7 h-7 text-gray-700" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-black text-white text-lg group-hover:text-blue-400 transition-colors tracking-tight">{product.name}</p>
                                                    <p className="text-xs text-gray-600 font-medium truncate w-64 mt-1 uppercase tracking-widest">{product.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-8">
                                            <span className="px-4 py-1.5 bg-blue-500/5 text-blue-400 text-[10px] font-black rounded-xl border border-blue-500/10 uppercase tracking-widest shadow-inner">
                                                {product.category?.name || 'Unclassified'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-8">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-blue-500 font-black text-sm">$</span>
                                                <span className="font-black text-xl text-white">{product.price}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-8">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center justify-between w-24">
                                                    <span className={`text-[10px] font-black uppercase tracking-tighter ${(product.inventory || 0) > 10 ? 'text-emerald-500' : 'text-rose-500'
                                                        }`}>
                                                        Stock Level: {product.inventory || 0}%
                                                    </span>
                                                </div>
                                                <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                    <div
                                                        className={`h-full transition-all duration-1000 ${(product.inventory || 0) > 10 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                                                            }`}
                                                        style={{ width: `${Math.min((product.inventory || 0), 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex justify-end gap-3">
                                                <Button
                                                    onClick={() => handleEdit(product)}
                                                    size="icon"
                                                    variant="ghost"
                                                    className="w-11 h-11 rounded-1.5xl bg-white/5 border border-white/5 hover:bg-blue-600 hover:text-white hover:border-blue-500 shadow-xl transition-all"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    onClick={() => confirmDelete(product.id)}
                                                    size="icon"
                                                    variant="ghost"
                                                    className="w-11 h-11 rounded-1.5xl bg-white/5 border border-white/5 hover:bg-rose-600 hover:text-white hover:border-rose-500 shadow-xl transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Premium Product Modal */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingProduct ? 'Update Asset' : 'Register New Asset'}
            >
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] pl-1">Product Designation</label>
                            <Input
                                required
                                placeholder="Enter asset name..."
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="h-14 bg-white/5 border-white/10 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-bold placeholder:text-gray-700 transition-all text-white"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] pl-1">Core Classification</label>
                            <select
                                value={formData.categoryId}
                                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm font-bold focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-white appearance-none transition-all"
                            >
                                <option value="" className="bg-gray-900">Select System Category</option>
                                {categories.map(cat => <option key={cat.id} value={cat.id} className="bg-gray-900">{cat.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] pl-1">Technical Specification</label>
                        <textarea
                            required
                            rows={4}
                            placeholder="Detailed product documentation..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-white placeholder:text-gray-700 transition-all resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] pl-1 flex items-center gap-2">
                                <DollarSign className="w-3 h-3 text-blue-500" /> Market Valuation
                            </label>
                            <Input
                                required
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                className="h-14 bg-white/5 border-white/10 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-black text-white"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] pl-1 flex items-center gap-2">
                                <Layers className="w-3 h-3 text-blue-500" /> Inventory Units
                            </label>
                            <Input
                                required
                                type="number"
                                placeholder="0"
                                value={formData.inventory}
                                onChange={e => setFormData({ ...formData, inventory: e.target.value })}
                                className="h-14 bg-white/5 border-white/10 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-black text-white"
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] pl-1">
                            Visual Assets (Media)
                        </label>

                        {/* Existing Images Management */}
                        {formData.images.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 border border-white/5 rounded-[28px] bg-black/20 overflow-visible min-h-[120px]">
                                {formData.images.map((img, i) => (
                                    <div key={`existing-${i}`} className="relative group aspect-square rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-2xl">
                                        <img
                                            src={img.startsWith('http') ? img : `${API_BASE_URL}${img}`}
                                            className="w-full h-full object-cover transition-all group-hover:scale-110"
                                            alt=""
                                            onLoad={() => console.log(`Image ${i} loaded: ${img}`)}
                                            onError={() => console.error(`Image ${i} failed: ${img}`)}
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => { e.preventDefault(); removeExistingImage(i); }}
                                            className="absolute top-2 right-2 w-10 h-10 rounded-full bg-rose-600/90 text-white flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:bg-rose-500 shadow-xl backdrop-blur-md z-30"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                        <div className="absolute bottom-0 inset-x-0 h-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* New File Previews */}
                        {selectedFiles.length > 0 && (
                            <div className="grid grid-cols-4 gap-4 animate-in slide-in-from-bottom duration-500">
                                {selectedFiles.map((file, i) => (
                                    <div key={`new-${i}`} className="relative group aspect-square rounded-2xl overflow-hidden border border-blue-500/20 bg-blue-500/5">
                                        <div className="w-full h-full flex flex-col items-center justify-center text-blue-400 p-2 text-center">
                                            <Upload className="w-6 h-6 mb-1 opacity-50" />
                                            <span className="text-[8px] font-black uppercase truncate w-full">{file.name}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeNewFile(i)}
                                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-gray-900/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-600 shadow-lg backdrop-blur-sm"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <div className="absolute bottom-0 inset-x-0 h-1 bg-blue-400 animate-pulse" />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="relative group cursor-pointer overflow-hidden rounded-[25px]">
                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                            />
                            <div className="h-40 border-2 border-dashed border-white/10 rounded-[25px] flex flex-col items-center justify-center gap-3 group-hover:bg-white/[0.04] group-hover:border-blue-500/40 transition-all duration-500 bg-white/[0.02]">
                                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Upload className="w-7 h-7 text-blue-500" />
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-white font-black uppercase tracking-widest leading-loose">
                                        {selectedFiles.length > 0 ? `Add ${selectedFiles.length} More Streams` : "Initialize Media Uplink"}
                                    </p>
                                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">Support for High-Res PNG/JPG</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-16 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white rounded-[22px] font-black text-xl shadow-2xl shadow-blue-500/40 active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-tighter"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                editingProduct ? 'Synchronize Updates' : 'Initialize Product Deployment'
                            )}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Professional Deletion Dialog */}
            <ConfirmationDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                title="System Purge Authorization"
                description="This protocol will permanently delete the selected asset from the master database. This action is irreversible and will affect global inventory streams."
                confirmLabel="Confirm Purge"
                cancelLabel="Abort Mission"
                variant="danger"
            />
        </div>
    );
}
