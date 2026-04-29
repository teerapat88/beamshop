'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, X, ChevronDown, Search } from 'lucide-react';
import api from '@/lib/api';
import { Product, Category, Pagination } from '@/types';
import ProductCard from '@/components/products/ProductCard';

const SORT_OPTIONS = [
    { value: 'created_at-DESC', label: 'ใหม่ล่าสุด' },
    { value: 'price-ASC', label: 'ราคาต่ำ → สูง' },
    { value: 'price-DESC', label: 'ราคาสูง → ต่ำ' },
    { value: 'sold_count-DESC', label: 'ขายดีที่สุด' },
    { value: 'rating-DESC', label: 'คะแนนสูงสุด' },
];

function ProductsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState({
        condition: searchParams.get('condition') || '',
        category: searchParams.get('category') || '',
        search: searchParams.get('search') || '',
        min_price: searchParams.get('min_price') || '',
        max_price: searchParams.get('max_price') || '',
        sort: 'created_at-DESC',
        page: 1,
    });

    useEffect(() => {
        api.get('/categories').then((res) => setCategories(res.data.data || []));
    }, []);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const [sortField, sortOrder] = filters.sort.split('-');
            const params = new URLSearchParams();
            if (filters.condition) params.set('condition', filters.condition);
            if (filters.category) params.set('category', filters.category);
            if (filters.search) params.set('search', filters.search);
            if (filters.min_price) params.set('min_price', filters.min_price);
            if (filters.max_price) params.set('max_price', filters.max_price);
            params.set('sort', sortField);
            params.set('order', sortOrder);
            params.set('page', String(filters.page));
            params.set('limit', '12');

            const res = await api.get(`/products?${params.toString()}`);
            setProducts(res.data.data || []);
            setPagination(res.data.pagination || null);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const updateFilter = (key: string, value: string | number) => {
        setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    };

    const clearFilters = () => {
        setFilters({ condition: '', category: '', search: '', min_price: '', max_price: '', sort: 'created_at-DESC', page: 1 });
    };

    const hasActiveFilters = filters.condition || filters.category || filters.search || filters.min_price || filters.max_price;

    const pageTitle = filters.search
        ? `ค้นหา: "${filters.search}"`
        : filters.condition === 'new' ? 'สินค้ามือ 1'
            : filters.condition === 'used' ? 'สินค้ามือ 2'
                : filters.category ? categories.find((c) => c.slug === filters.category)?.name || 'สินค้า'
                    : 'สินค้าทั้งหมด';

    return (
        <div style={{ padding: '32px 0', minHeight: '70vh' }}>
            <div className="container">
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <h1 style={{ fontSize: '26px', fontWeight: '700', fontFamily: 'Space Grotesk' }}>{pageTitle}</h1>
                        {pagination && (
                            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                พบ {pagination.total.toLocaleString()} รายการ
                            </p>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary" style={{ padding: '9px 16px', fontSize: '13px' }}>
                            <SlidersHorizontal size={14} /> ตัวกรอง {hasActiveFilters && <span style={{ background: 'var(--accent)', color: 'white', borderRadius: '50%', width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>!</span>}
                        </button>
                        <select
                            value={filters.sort}
                            onChange={(e) => updateFilter('sort', e.target.value)}
                            className="input-field"
                            style={{ width: 'auto', padding: '9px 14px', fontSize: '13px', cursor: 'pointer' }}
                        >
                            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div style={{
                        padding: '20px', marginBottom: '24px',
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)', animation: 'fadeIn 0.2s ease',
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                            {/* Search */}
                            <div>
                                <label className="label">ค้นหา</label>
                                <div style={{ position: 'relative' }}>
                                    <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        type="text"
                                        placeholder="ชื่อสินค้า, แบรนด์..."
                                        value={filters.search}
                                        onChange={(e) => updateFilter('search', e.target.value)}
                                        className="input-field"
                                        style={{ paddingLeft: '36px' }}
                                    />
                                </div>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="label">หมวดหมู่</label>
                                <select value={filters.category} onChange={(e) => updateFilter('category', e.target.value)} className="input-field" style={{ cursor: 'pointer' }}>
                                    <option value="">ทั้งหมด</option>
                                    {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                                </select>
                            </div>

                            {/* Condition */}
                            <div>
                                <label className="label">สภาพสินค้า</label>
                                <select value={filters.condition} onChange={(e) => updateFilter('condition', e.target.value)} className="input-field" style={{ cursor: 'pointer' }}>
                                    <option value="">ทั้งหมด</option>
                                    <option value="new">มือ 1 (ใหม่)</option>
                                    <option value="used">มือ 2 (มือสอง)</option>
                                </select>
                            </div>

                            {/* Price Range */}
                            <div>
                                <label className="label">ราคาต่ำสุด (฿)</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={filters.min_price}
                                    onChange={(e) => updateFilter('min_price', e.target.value)}
                                    className="input-field"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="label">ราคาสูงสุด (฿)</label>
                                <input
                                    type="number"
                                    placeholder="ไม่จำกัด"
                                    value={filters.max_price}
                                    onChange={(e) => updateFilter('max_price', e.target.value)}
                                    className="input-field"
                                    min="0"
                                />
                            </div>

                            {hasActiveFilters && (
                                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                    <button onClick={clearFilters} className="btn-secondary" style={{ width: '100%', fontSize: '13px' }}>
                                        <X size={14} /> ล้างตัวกรอง
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Active Filter Tags */}
                {hasActiveFilters && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        {filters.condition && (
                            <span className="badge badge-accent" style={{ cursor: 'pointer' }} onClick={() => updateFilter('condition', '')}>
                                {filters.condition === 'new' ? 'มือ 1' : 'มือ 2'} <X size={10} />
                            </span>
                        )}
                        {filters.category && (
                            <span className="badge badge-accent" style={{ cursor: 'pointer' }} onClick={() => updateFilter('category', '')}>
                                {categories.find((c) => c.slug === filters.category)?.name} <X size={10} />
                            </span>
                        )}
                        {filters.search && (
                            <span className="badge badge-accent" style={{ cursor: 'pointer' }} onClick={() => updateFilter('search', '')}>
                                "{filters.search}" <X size={10} />
                            </span>
                        )}
                    </div>
                )}

                {/* Products Grid */}
                {loading ? (
                    <div className="product-grid">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i}>
                                <div className="skeleton" style={{ aspectRatio: '1', borderRadius: 'var(--radius)' }} />
                                <div style={{ padding: '12px 0' }}>
                                    <div className="skeleton" style={{ height: '14px', marginBottom: '8px' }} />
                                    <div className="skeleton" style={{ height: '20px', width: '60%' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                        <div style={{ fontSize: '60px', marginBottom: '16px' }}>🔍</div>
                        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>ไม่พบสินค้า</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>ลองปรับตัวกรองหรือค้นหาด้วยคำอื่น</p>
                        <button onClick={clearFilters} className="btn-primary">ล้างตัวกรองทั้งหมด</button>
                    </div>
                ) : (
                    <div className="product-grid">
                        {products.map((p) => <ProductCard key={p.id} product={p} />)}
                    </div>
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '40px' }}>
                        <button
                            disabled={filters.page <= 1}
                            onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                            className="btn-secondary"
                            style={{ padding: '8px 16px', fontSize: '13px' }}
                        >
                            ← ก่อนหน้า
                        </button>
                        {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                            const page = i + 1;
                            return (
                                <button
                                    key={page}
                                    onClick={() => setFilters((prev) => ({ ...prev, page }))}
                                    style={{
                                        padding: '8px 14px', fontSize: '13px', borderRadius: 'var(--radius-sm)',
                                        border: '1px solid var(--border)', cursor: 'pointer',
                                        background: filters.page === page ? 'var(--accent)' : 'transparent',
                                        color: filters.page === page ? 'white' : 'var(--text-secondary)',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {page}
                                </button>
                            );
                        })}
                        <button
                            disabled={filters.page >= pagination.totalPages}
                            onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                            className="btn-secondary"
                            style={{ padding: '8px 16px', fontSize: '13px' }}
                        >
                            ถัดไป →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>กำลังโหลด...</div>}>
            <ProductsContent />
        </Suspense>
    );
}
