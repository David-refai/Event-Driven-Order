"use client";

import React, { useState, useEffect } from 'react';
import { apiClient, Product, Category } from '@/lib/api';
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

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        inventory: '',
        categoryId: '',
        images: [''] // Array for multiple image URLs
    });

    useEffect(() => {
        fetchData();
    }, []);

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
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            inventory: product.inventory.toString(),
            categoryId: product.category?.id?.toString() || '',
            images: product.images.length > 0 ? product.images : ['']
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                await apiClient.deleteProduct(id);
                fetchData();
            } catch (error) {
                alert('Failed to delete product');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                price: parseFloat(formData.price),
                inventory: parseInt(formData.inventory),
                categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
                images: formData.images.filter(url => url.trim() !== '')
            };

            if (editingProduct) {
                await apiClient.updateProduct(editingProduct.id, data);
            } else {
                await apiClient.createProduct(data);
            }

            setIsFormOpen(false);
            setEditingProduct(null);
            setFormData({ name: '', description: '', price: '', inventory: '', categoryId: '', images: [''] });
            fetchData();
        } catch (error) {
            alert('Failed to save product');
        }
    };

    const addImageField = () => {
        setFormData({ ...formData, images: [...formData.images, ''] });
    };

    const updateImageField = (index: number, value: string) => {
        const newImages = [...formData.images];
        newImages[index] = value;
        setFormData({ ...formData, images: newImages });
    };

    const removeImageField = (index: number) => {
        const newImages = formData.images.filter((_, i) => i !== index);
        setFormData({ ...formData, images: newImages.length ? newImages : [''] });
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white mb-2 font-outfit">Product Catalog</h1>
                    <p className="text-gray-500">Manage your items, inventory, and categories across the platform.</p>
                </div>
                <Button
                    onClick={() => { setIsFormOpen(true); setEditingProduct(null); }}
                    className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add New Product
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Products', value: products.length, icon: Layers, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                    { label: 'Active Categories', value: categories.length, icon: Tag, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                    { label: 'Low Stock Items', value: products.filter(p => p.inventory < 10).length, icon: Trash2, color: 'text-rose-400', bg: 'bg-rose-400/10' },
                ].map((stat, i) => (
                    <Card key={i} className="bg-white/5 border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
                        <CardContent className="p-8 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className="text-3xl font-black text-white">{stat.value}</p>
                            </div>
                            <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center`}>
                                <stat.icon className={`w-7 h-7 ${stat.color}`} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Table Card */}
            <Card className="bg-white/5 border-white/10 rounded-[32px] overflow-hidden backdrop-blur-xl">
                <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
                    <CardTitle className="text-xl font-bold text-white">Product Directory</CardTitle>
                    <div className="relative w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search directory..."
                            className="h-10 bg-white/5 border-white/10 rounded-xl pl-10 pr-4 text-sm focus:border-blue-500/50"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/5">
                                    <th className="px-8 py-6">Product</th>
                                    <th className="px-6 py-6 font-outfit">Category</th>
                                    <th className="px-6 py-6 font-outfit">Price</th>
                                    <th className="px-6 py-6 font-outfit">Inventory</th>
                                    <th className="px-8 py-6 text-right font-outfit">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-8 py-6 h-20 bg-white/5" />
                                        </tr>
                                    ))
                                ) : filteredProducts.map((product) => (
                                    <tr key={product.id} className="group hover:bg-white/5 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-xl bg-gray-800 border border-white/10 overflow-hidden">
                                                    {product.images[0] ? (
                                                        <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-gray-600" /></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white group-hover:text-blue-400 transition-colors">{product.name}</p>
                                                    <p className="text-xs text-gray-500 truncate w-48">{product.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="px-3 py-1 bg-white/5 text-gray-400 text-[10px] font-bold rounded-full border border-white/5 uppercase tracking-widest">
                                                {product.category?.name || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 font-bold text-white">${product.price}</td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${product.inventory > 10 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                <span className="font-medium text-white">{product.inventory} items</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button onClick={() => handleEdit(product)} size="icon" variant="ghost" className="w-9 h-9 rounded-lg hover:bg-blue-500/10 hover:text-blue-400"><Edit2 className="w-4 h-4" /></Button>
                                                <Button onClick={() => handleDelete(product.id)} size="icon" variant="ghost" className="w-9 h-9 rounded-lg hover:bg-rose-500/10 hover:text-rose-400"><Trash2 className="w-4 h-4" /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Product Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                    <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-md" onClick={() => setIsFormOpen(false)} />
                    <Card className="relative w-full max-w-2xl bg-gray-900 border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
                        <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
                            <CardTitle className="text-2xl font-black text-white">{editingProduct ? 'Edit Product' : 'Add New Product'}</CardTitle>
                            <Button variant="ghost" size="icon" onClick={() => setIsFormOpen(false)} className="rounded-full hover:bg-white/5"><X className="w-6 h-6 text-gray-500" /></Button>
                        </CardHeader>
                        <CardContent className="p-8 h-[600px] overflow-y-auto custom-scrollbar">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Product Name</label>
                                        <Input
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="h-12 bg-white/5 border-white/10 rounded-xl focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Category</label>
                                        <select
                                            value={formData.categoryId}
                                            onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                                            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm focus:outline-none focus:border-blue-500 text-white"
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Description</label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500 text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 flex items-center gap-2"><DollarSign className="w-3 h-3" /> Price</label>
                                        <Input
                                            required
                                            type="number"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                            className="h-12 bg-white/5 border-white/10 rounded-xl focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 flex items-center gap-2"><Layers className="w-3 h-3" /> Inventory</label>
                                        <Input
                                            required
                                            type="number"
                                            value={formData.inventory}
                                            onChange={e => setFormData({ ...formData, inventory: e.target.value })}
                                            className="h-12 bg-white/5 border-white/10 rounded-xl focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 flex items-center justify-between">
                                        Product Images (URLs)
                                        <Button type="button" onClick={addImageField} variant="ghost" size="sm" className="h-6 text-[10px] text-blue-400 font-bold hover:bg-blue-400/10">
                                            <Plus className="w-3 h-3 mr-1" /> Add Image
                                        </Button>
                                    </label>
                                    <div className="space-y-3">
                                        {formData.images.map((url, idx) => (
                                            <div key={idx} className="flex gap-3">
                                                <Input
                                                    value={url}
                                                    onChange={e => updateImageField(idx, e.target.value)}
                                                    placeholder="https://..."
                                                    className="h-10 bg-white/5 border-white/10 rounded-xl flex-1 text-xs"
                                                />
                                                <Button type="button" onClick={() => removeImageField(idx)} size="icon" variant="ghost" className="h-10 w-10 text-rose-500 hover:bg-rose-500/10"><Trash2 className="w-4 h-4" /></Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/5">
                                    <Button
                                        type="submit"
                                        className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                                    >
                                        {editingProduct ? 'Update Product' : 'Create Product'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
