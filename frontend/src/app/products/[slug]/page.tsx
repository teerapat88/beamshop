'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ShoppingCart, Heart, Star, Shield, Truck, RotateCcw,
    ChevronRight, Minus, Plus, CheckCircle, AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import { Product } from '@/types';
import { useAuthStore, useCartStore } from '@/store';
import ProductCard from '@/components/products/ProductCard';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const router = useRouter();
    const { user } = useAuthStore();
    const { addToCart } = useCartStore();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');
    const [addingToCart, setAddingToCart] = useState(false);

    useEffect(() => {
        if (!slug) return;
        setLoading(true);
        api.get(`/products/${slug}`)
            .then((res) => {
                setProduct(res.data.data);
                setSelectedImage(0);
            })
            .catch(() => { setProduct(null); })
            .finally(() => setLoading(false));
    }, [slug]);

    const handleAddToCart = async () => {
        if (!user) {
            toast.error('กรุณาเข้าสู่ระบบก่อน');
            router.push('/login');
            return;
        }
        if (!product) return;
        setAddingToCart(true);
        try {
            await addToCart(product.id, quantity);
            toast.success(`เพิ่ม ${quantity} ชิ้น ลงตะกร้าแล้ว!`);
        } catch {
            toast.error('ไม่สามารถเพิ่มสินค้าได้');
        } finally {
            setAddingToCart(false);
        }
    };

    const handleBuyNow = async () => {
        await handleAddToCart();
        if (user) router.push('/cart');
    };

    const renderStars = (rating: number, size = 16) =>
        Array.from({ length: 5 }, (_, i) => (
            <Star key={i} size={size} fill={i < Math.round(rating) ? '#ca8a04' : 'none'} color={i < Math.round(rating) ? '#ca8a04' : '#d0d5dd'} />
        ));

    if (loading) {
        return (
            <div style={{ padding: '40px 0' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                        <div className="skeleton" style={{ aspectRatio: '1', borderRadius: 'var(--radius-lg)' }} />
                        <div>
                            {[200, 40, 100, 60, 80, 120].map((h, i) => (
                                <div key={i} className="skeleton" style={{ height: h + 'px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div style={{ padding: '100px 0', textAlign: 'center' }}>
                <div style={{ fontSize: '60px', marginBottom: '16px' }}>😕</div>
                <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>ไม่พบสินค้า</h2>
                <Link href="/products" className="btn-primary" style={{ display: 'inline-flex' }}>กลับไปดูสินค้า</Link>
            </div>
        );
    }

    const images = product.images && product.images.length > 0
        ? product.images
        : [{ id: 0, product_id: product.id, image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=600&fit=crop', is_primary: true }];

    const discountPercent = product.original_price
        ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0;

    return (
        <div style={{ padding: '24px 0 60px' }}>
            <div className="container">
                {/* Breadcrumb */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <Link href="/" style={{ color: 'var(--text-muted)' }}>หน้าแรก</Link>
                    <ChevronRight size={12} />
                    <Link href="/products" style={{ color: 'var(--text-muted)' }}>สินค้า</Link>
                    <ChevronRight size={12} />
                    <Link href={`/products?category=${product.category_slug}`} style={{ color: 'var(--text-muted)' }}>{product.category_name}</Link>
                    <ChevronRight size={12} />
                    <span style={{ color: 'var(--text-primary)' }}>{product.name}</span>
                </div>

                {/* Main */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }}>
                    {/* Images */}
                    <div>
                        <div style={{
                            borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            marginBottom: '12px', aspectRatio: '1',
                        }}>
                            <img
                                src={images[selectedImage]?.image_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=600&fit=crop'}
                                alt={product.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                        {images.length > 1 && (
                            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
                                {images.map((img, i) => (
                                    <button
                                        key={img.id}
                                        onClick={() => setSelectedImage(i)}
                                        style={{
                                            width: '72px', height: '72px', borderRadius: '8px', overflow: 'hidden',
                                            border: `2px solid ${selectedImage === i ? 'var(--accent)' : 'var(--border)'}`,
                                            cursor: 'pointer', background: 'none', padding: 0, flexShrink: 0,
                                        }}
                                    >
                                        <img src={img.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div>
                        {/* Badges */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                            <span className={`badge ${product.condition_type === 'new' ? 'badge-new' : 'badge-used'}`}>
                                {product.condition_type === 'new' ? 'สินค้ามือ 1' : 'สินค้ามือ 2'}
                            </span>
                            {product.condition_detail && (
                                <span className="badge badge-accent">
                                    {product.condition_detail === 'like_new' ? 'สภาพเหมือนใหม่' :
                                        product.condition_detail === 'good' ? 'สภาพดี' :
                                            product.condition_detail === 'fair' ? 'สภาพพอใช้' : 'สภาพทั่วไป'}
                                </span>
                            )}
                            {discountPercent > 0 && (
                                <span style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '100px', padding: '4px 10px', fontSize: '11px', fontWeight: '600' }}>
                                    ลด {discountPercent}%
                                </span>
                            )}
                        </div>

                        {product.brand && <p style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: '600', marginBottom: '6px' }}>{product.brand}</p>}
                        <h1 style={{ fontSize: '24px', fontWeight: '700', lineHeight: '1.3', marginBottom: '12px', fontFamily: 'Space Grotesk' }}>
                            {product.name}
                        </h1>

                        {/* Rating */}
                        {product.review_count > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', gap: '2px' }}>{renderStars(product.rating)}</div>
                                <span style={{ fontSize: '14px', fontWeight: '600' }}>{product.rating.toFixed(1)}</span>
                                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>({product.review_count} รีวิว)</span>
                                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>· ขายแล้ว {product.sold_count}</span>
                            </div>
                        )}

                        {/* Price */}
                        <div style={{ marginBottom: '20px', padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                                <span style={{ fontSize: '38px', fontWeight: '800', color: 'var(--accent)', fontFamily: 'Space Grotesk' }}>
                                    ฿{product.price.toLocaleString()}
                                </span>
                                {product.original_price && (
                                    <span style={{ fontSize: '18px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                                        ฿{product.original_price.toLocaleString()}
                                    </span>
                                )}
                            </div>
                            {discountPercent > 0 && (
                                <p style={{ fontSize: '13px', color: 'var(--green)', marginTop: '4px' }}>
                                    คุณประหยัด ฿{(product.original_price! - product.price).toLocaleString()}
                                </p>
                            )}
                        </div>

                        {/* Stock */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                            {product.stock > 0 ? (
                                <>
                                    <CheckCircle size={16} color="var(--green)" />
                                    <span style={{ fontSize: '14px', color: 'var(--green)' }}>มีสินค้า ({product.stock} ชิ้น)</span>
                                </>
                            ) : (
                                <>
                                    <AlertCircle size={16} color="var(--red)" />
                                    <span style={{ fontSize: '14px', color: 'var(--red)' }}>สินค้าหมด</span>
                                </>
                            )}
                            {product.warranty && (
                                <span style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--text-muted)' }}>
                                    🛡️ ประกัน {product.warranty}
                                </span>
                            )}
                        </div>

                        {/* Quantity */}
                        {product.stock > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px', fontWeight: '500' }}>จำนวน</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                                    <button
                                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                        style={{
                                            width: '40px', height: '40px', border: '1px solid var(--border)',
                                            borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)',
                                            background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <div style={{
                                        width: '60px', height: '40px', border: '1px solid var(--border)',
                                        borderLeft: 'none', borderRight: 'none',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '16px', fontWeight: '600',
                                    }}>
                                        {quantity}
                                    </div>
                                    <button
                                        onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                                        style={{
                                            width: '40px', height: '40px', border: '1px solid var(--border)',
                                            borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                                            background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock === 0 || addingToCart}
                                className="btn-secondary"
                                style={{ flex: 1, padding: '14px', fontSize: '14px' }}
                            >
                                <ShoppingCart size={18} />
                                {addingToCart ? 'กำลังเพิ่ม...' : 'เพิ่มลงตะกร้า'}
                            </button>
                            <button
                                onClick={handleBuyNow}
                                disabled={product.stock === 0 || addingToCart}
                                className="btn-primary"
                                style={{ flex: 1, padding: '14px', fontSize: '14px' }}
                            >
                                ซื้อเลย
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            {[
                                { icon: Truck, text: 'ส่งฟรีเมื่อครบ ฿3,000', color: 'var(--green)' },
                                { icon: Shield, text: 'สินค้ามีการรับประกัน', color: 'var(--accent)' },
                                { icon: RotateCcw, text: 'คืนได้ภายใน 7 วัน', color: 'var(--orange)' },
                                { icon: CheckCircle, text: 'ชำระเงินปลอดภัย', color: 'var(--green)' },
                            ].map(({ icon: Icon, text, color }, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    padding: '10px 12px', background: 'var(--bg-card)',
                                    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                                }}>
                                    <Icon size={14} color={color} />
                                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ marginTop: '48px' }}>
                    <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
                        {(['desc', 'specs', 'reviews'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '12px 24px', fontSize: '14px', fontWeight: '500',
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
                                    borderBottom: `2px solid ${activeTab === tab ? 'var(--accent)' : 'transparent'}`,
                                    transition: 'all 0.2s', marginBottom: '-1px',
                                }}
                            >
                                {tab === 'desc' ? 'รายละเอียด' : tab === 'specs' ? 'สเปค' : `รีวิว (${product.review_count})`}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'desc' && (
                        <div style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '14.5px' }}>
                            {product.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
                        </div>
                    )}

                    {activeTab === 'specs' && (
                        <div>
                            {product.specs && product.specs.length > 0 ? (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <tbody>
                                        {product.specs.map((spec, i) => (
                                            <tr key={spec.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg-secondary)' }}>
                                                <td style={{ padding: '12px 16px', fontSize: '13.5px', color: 'var(--text-muted)', width: '220px', fontWeight: '500' }}>
                                                    {spec.spec_key}
                                                </td>
                                                <td style={{ padding: '12px 16px', fontSize: '13.5px', color: 'var(--text-primary)' }}>
                                                    {spec.spec_value}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p style={{ color: 'var(--text-muted)' }}>ไม่มีข้อมูลสเปค</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div>
                            {product.reviews && product.reviews.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {product.reviews.map((r) => (
                                        <div key={r.id} style={{
                                            padding: '16px', background: 'var(--bg-card)',
                                            border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: '36px', height: '36px', background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', color: 'white' }}>
                                                        {r.username[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p style={{ fontSize: '13.5px', fontWeight: '600' }}>{r.username}</p>
                                                        <div style={{ display: 'flex', gap: '2px' }}>{renderStars(r.rating, 13)}</div>
                                                    </div>
                                                </div>
                                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                    {new Date(r.created_at).toLocaleDateString('th-TH')}
                                                </span>
                                            </div>
                                            {r.title && <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>{r.title}</p>}
                                            {r.comment && <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{r.comment}</p>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: 'var(--text-muted)' }}>ยังไม่มีรีวิว</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Related */}
                {product.related && product.related.length > 0 && (
                    <div style={{ marginTop: '60px' }}>
                        <h2 className="section-title" style={{ marginBottom: '20px' }}>สินค้าที่เกี่ยวข้อง</h2>
                        <div className="product-grid">
                            {product.related.map((p) => <ProductCard key={p.id} product={p} />)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
