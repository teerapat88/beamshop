'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store';
import { Product } from '@/types';
import ProductCard from '@/components/products/ProductCard';
import { Heart, ArrowLeft, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WishlistPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) { router.push('/login'); return; }
        fetchWishlist();
    }, [user]);

    const fetchWishlist = async () => {
        setLoading(true);
        try {
            // In a real app, we'd have a /wishlist endpoint
            // For now, we'll simulate by fetching featured products as "favorites"
            // or if you want to implement the backend route later
            const res = await api.get('/products?featured=true&limit=10');
            setProducts(res.data.data || []);
        } catch {
            setProducts([]);
        } finally { setLoading(false); }
    };

    if (!user) return null;

    return (
        <div style={{ padding: '32px 0 60px' }}>
            <div className="container">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                    <Link href="/products" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '14px' }}>
                        <ArrowLeft size={16} /> กลับ
                    </Link>
                    <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '26px', fontWeight: '700' }}>
                        รายการที่ชอบ
                    </h1>
                    <Heart size={20} color="var(--red)" fill="var(--red)" />
                </div>

                {loading ? (
                    <div className="product-grid">
                        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ aspectRatio: '1', borderRadius: 'var(--radius)' }} />)}
                    </div>
                ) : products.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                        <Heart size={64} style={{ margin: '0 auto 20px', color: 'var(--text-muted)', display: 'block' }} />
                        <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '8px' }}>ยังไม่มีรายการที่ชอบ</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>กดหัวใจที่สินค้าเพื่อบันทึกไว้ดูทีหลัง</p>
                        <Link href="/products" className="btn-primary" style={{ display: 'inline-flex' }}>เลือกดูสินค้า</Link>
                    </div>
                ) : (
                    <div className="product-grid">
                        {products.map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                )}
            </div>
        </div>
    );
}
