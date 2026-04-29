'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store';
import { Category } from '@/types';
import toast from 'react-hot-toast';
import { Plus, Search, Edit, Trash2, LayoutDashboard, Package, ShoppingBag, Users, Eye, BarChart3, PlusCircle } from 'lucide-react';

const SIDEBAR_ITEMS = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/products', icon: Package, label: 'สินค้า' },
    { href: '/admin/orders', icon: ShoppingBag, label: 'คำสั่งซื้อ' },
    { href: '/admin/users', icon: Users, label: 'ผู้ใช้' },
];

export default function AdminProductsPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editProduct, setEditProduct] = useState<any>(null);
    const [stockPrompt, setStockPrompt] = useState<{ id: number; name: string } | null>(null);
    const [stockIncrement, setStockIncrement] = useState('1');
    const [form, setForm] = useState({
        category_id: '',
        name: '',
        description: '',
        short_description: '',
        price: '',
        original_price: '',
        stock: '',
        condition_type: 'new',
        condition_detail: 'like_new',
        brand: '',
        model: '',
        warranty: '',
        is_featured: false,
        image_url: '',
    });

    useEffect(() => {
        if (!user || user.role !== 'admin') { router.push('/'); return; }
        fetchAll();
        api.get('/categories').then(r => setCategories(r.data.data || []));
    }, [user]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/products?limit=100${search ? `&search=${encodeURIComponent(search)}` : ''}`);
            setProducts(res.data.data || []);
        } catch { } finally { setLoading(false); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('ลบสินค้านี้?')) return;
        try {
            await api.delete(`/products/${id}`);
            toast.success('ลบสินค้าแล้ว');
            fetchAll();
        } catch { toast.error('เกิดข้อผิดพลาด'); }
    };

    const handleUpdateStock = async () => {
        if (!stockPrompt) return;
        try {
            await api.patch(`/products/${stockPrompt.id}/stock`, { increment: parseInt(stockIncrement) });
            toast.success(`เพิ่มสต็อก ${stockPrompt.name} แล้ว`);
            setStockPrompt(null);
            setStockIncrement('1');
            fetchAll();
        } catch { toast.error('เกิดข้อผิดพลาดในการอัปเดตสต็อก'); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = {
                ...form,
                category_id: parseInt(form.category_id),
                price: parseFloat(form.price),
                original_price: form.original_price ? parseFloat(form.original_price) : null,
                stock: parseInt(form.stock),
                images: form.image_url ? [{ url: form.image_url }] : [],
            };
            if (editProduct) {
                await api.put(`/products/${editProduct.id}`, data);
                toast.success('อัปเดตสินค้าแล้ว');
            } else {
                await api.post('/products', data);
                toast.success('เพิ่มสินค้าแล้ว');
            }
            setShowForm(false);
            setEditProduct(null);
            fetchAll();
        } catch (err: any) { toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาด'); }
    };

    if (!user || user.role !== 'admin') return null;

    const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '13.5px', outline: 'none' };

    return (
        <div style={{ display: 'flex', minHeight: '80vh' }}>
            <aside style={{ width: '240px', background: '#ffffff', borderRight: '1px solid var(--border)', padding: '24px 14px', flexShrink: 0 }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '12px 12px', marginBottom: '20px',
                    background: 'var(--accent-light)', borderRadius: '10px',
                }}>
                    <div style={{
                        width: '32px', height: '32px', background: 'var(--accent)',
                        borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <BarChart3 size={16} color="white" />
                    </div>
                    <div>
                        <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent)' }}>Admin Panel</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>จัดการระบบ</p>
                    </div>
                </div>
                <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', padding: '0 12px' }}>เมนู</p>
                {SIDEBAR_ITEMS.map(({ href, icon: Icon, label }) => {
                    const isActive = href === '/admin/products';
                    return (
                        <Link key={href} href={href} style={{
                            display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
                            borderRadius: '8px', fontSize: '14px',
                            color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                            background: isActive ? 'var(--accent-light)' : 'transparent',
                            fontWeight: isActive ? '600' : '500',
                            textDecoration: 'none', marginBottom: '2px',
                        }}>
                            <Icon size={16} /> {label}
                        </Link>
                    );
                })}
            </aside>

            <div style={{ flex: 1, padding: '32px', overflow: 'auto', background: 'var(--bg-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>จัดการสินค้า</h1>
                    <button onClick={() => { setShowForm(true); setEditProduct(null); setForm({ category_id: '', name: '', description: '', short_description: '', price: '', original_price: '', stock: '', condition_type: 'new', condition_detail: 'like_new', brand: '', model: '', warranty: '', is_featured: false, image_url: '' }); }} className="btn-primary" style={{ fontSize: '13px', padding: '9px 18px' }}>
                        <Plus size={14} /> เพิ่มสินค้า
                    </button>
                </div>

                {/* Search */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
                        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input type="text" placeholder="ค้นหาสินค้า..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchAll()} className="input-field" style={{ paddingLeft: '36px' }} />
                    </div>
                    <button onClick={fetchAll} className="btn-secondary" style={{ fontSize: '13px', padding: '9px 16px' }}>ค้นหา</button>
                </div>

                {/* Add/Edit Form */}
                {showForm && (
                    <div style={{ background: '#ffffff', border: '1px solid var(--accent)', borderRadius: 'var(--radius)', padding: '24px', marginBottom: '24px', animation: 'fadeIn 0.2s ease' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: 'var(--text-primary)' }}>{editProduct ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>หมวดหมู่ *</label>
                                    <select required value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                                        <option value="">-- เลือกหมวดหมู่ --</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>ชื่อสินค้า *</label>
                                    <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} placeholder="ชื่อสินค้า" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>แบรนด์</label>
                                    <input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} style={inputStyle} placeholder="ASUS, MSI, etc." />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>สภาพ *</label>
                                    <select value={form.condition_type} onChange={e => setForm(f => ({ ...f, condition_type: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                                        <option value="new">มือ 1 (ใหม่)</option>
                                        <option value="used">มือ 2 (มือสอง)</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>ราคา (฿) *</label>
                                    <input required type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} style={inputStyle} placeholder="0.00" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>ราคาเดิม (฿)</label>
                                    <input type="number" value={form.original_price} onChange={e => setForm(f => ({ ...f, original_price: e.target.value }))} style={inputStyle} placeholder="0.00" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>สต็อก *</label>
                                    <input required type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} style={inputStyle} placeholder="0" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>ประกัน</label>
                                    <input value={form.warranty} onChange={e => setForm(f => ({ ...f, warranty: e.target.value }))} style={inputStyle} placeholder="1 ปี" />
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>URL รูปภาพ</label>
                                    <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} style={inputStyle} placeholder="https://..." />
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>รายละเอียด</label>
                                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="รายละเอียดสินค้า..." />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input type="checkbox" id="featured" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} style={{ accentColor: 'var(--accent)', width: '16px', height: '16px' }} />
                                    <label htmlFor="featured" style={{ fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>สินค้าแนะนำ</label>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="btn-primary" style={{ fontSize: '13.5px', padding: '10px 20px' }}>{editProduct ? 'บันทึก' : 'เพิ่มสินค้า'}</button>
                                <button type="button" onClick={() => { setShowForm(false); setEditProduct(null); }} className="btn-secondary" style={{ fontSize: '13.5px', padding: '10px 20px' }}>ยกเลิก</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Stock Prompt Modal (Simple) */}
                {stockPrompt && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '320px', boxShadow: 'var(--shadow-lg)' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>เพิ่มสต็อก: {stockPrompt.name}</h3>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>จำนวนที่ต้องการเพิ่ม</label>
                                <input type="number" value={stockIncrement} onChange={e => setStockIncrement(e.target.value)} style={inputStyle} min="1" autoFocus />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={handleUpdateStock} className="btn-primary" style={{ flex: 1 }}>ตกลง</button>
                                <button onClick={() => setStockPrompt(null)} className="btn-secondary" style={{ flex: 1 }}>ยกเลิก</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Products Table */}
                <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                                    {['สินค้า', 'หมวดหมู่', 'สภาพ', 'ราคา', 'สต็อก', 'ขายแล้ว', 'สถานะ', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td colSpan={8} style={{ padding: '16px' }}><div className="skeleton" style={{ height: '20px', borderRadius: '4px' }} /></td>
                                    </tr>
                                )) : products.map(p => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}
                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)'}
                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '12px 14px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <img src={p.primary_image || `https://images.unsplash.com/photo-1518770660439-4636190af475?w=80&h=80&fit=crop`} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                                                <div>
                                                    <p style={{ fontSize: '13px', fontWeight: '600', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>{p.name}</p>
                                                    <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{p.brand}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 14px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>{p.category_name}</td>
                                        <td style={{ padding: '12px 14px' }}>
                                            <span className={`badge ${p.condition_type === 'new' ? 'badge-new' : 'badge-used'}`}>{p.condition_type === 'new' ? 'มือ 1' : 'มือ 2'}</span>
                                        </td>
                                        <td style={{ padding: '12px 14px', fontSize: '14px', fontWeight: '700', color: 'var(--accent)' }}>฿{Number(p.price).toLocaleString()}</td>
                                        <td style={{ padding: '12px 14px', fontSize: '13.5px', color: p.stock <= 5 ? 'var(--red)' : 'var(--text-primary)' }}>{p.stock}</td>
                                        <td style={{ padding: '12px 14px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>{p.sold_count}</td>
                                        <td style={{ padding: '12px 14px' }}>
                                            <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '100px', background: p.is_active ? 'var(--green-light)' : 'var(--red-light)', color: p.is_active ? 'var(--green)' : 'var(--red)', border: `1px solid ${p.is_active ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)'}` }}>
                                                {p.is_active ? 'เผยแพร่' : 'ปิด'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 14px' }}>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button onClick={() => { setStockPrompt({ id: p.id, name: p.name }); setStockIncrement('1'); }} title="เพิ่มสต็อก" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '6px', background: 'var(--green-light)', color: 'var(--green)', border: 'none', cursor: 'pointer' }}>
                                                    <PlusCircle size={13} />
                                                </button>
                                                <Link href={`/products/${p.slug}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '6px', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                                                    <Eye size={13} />
                                                </Link>
                                                <button onClick={() => { setEditProduct(p); setForm({ category_id: String(p.category_id), name: p.name, description: p.description || '', short_description: p.short_description || '', price: String(p.price), original_price: p.original_price ? String(p.original_price) : '', stock: String(p.stock), condition_type: p.condition_type, condition_detail: p.condition_detail || 'like_new', brand: p.brand || '', model: p.model || '', warranty: p.warranty || '', is_featured: p.is_featured, image_url: p.primary_image || '' }); setShowForm(true); window.scrollTo(0, 0); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '6px', background: 'var(--accent-light)', color: 'var(--accent)', border: 'none', cursor: 'pointer' }}>
                                                    <Edit size={13} />
                                                </button>
                                                <button onClick={() => handleDelete(p.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '6px', background: 'var(--red-light)', color: 'var(--red)', border: 'none', cursor: 'pointer' }}>
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
