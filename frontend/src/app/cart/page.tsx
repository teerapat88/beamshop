'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Truck } from 'lucide-react';
import { useAuthStore, useCartStore } from '@/store';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function CartPage() {
    const { user } = useAuthStore();
    const { items, fetchCart, updateQuantity, removeItem, getTotalPrice } = useCartStore();
    const router = useRouter();

    useEffect(() => {
        if (!user) { router.push('/login'); return; }
        fetchCart();
    }, [user]);

    const totalPrice = getTotalPrice();
    const shippingFee = totalPrice >= 3000 ? 0 : 80;
    const grandTotal = totalPrice + shippingFee;

    const handleCheckout = () => {
        if (items.length === 0) { toast.error('ตะกร้าว่างเปล่า'); return; }
        router.push('/checkout');
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
                        ตะกร้าสินค้า
                    </h1>
                    {items.length > 0 && (
                        <span className="badge badge-accent">{items.length} รายการ</span>
                    )}
                </div>

                {items.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                        <ShoppingBag size={64} style={{ margin: '0 auto 20px', color: 'var(--text-muted)', display: 'block' }} />
                        <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '8px' }}>ตะกร้าว่างเปล่า</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>เริ่มช้อปปิ้งกันเลย!</p>
                        <Link href="/products" className="btn-primary" style={{ display: 'inline-flex' }}>
                            ดูสินค้าทั้งหมด
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
                        {/* Items */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {items.map((item) => (
                                <div key={item.id} style={{
                                    display: 'flex', gap: '16px', alignItems: 'center',
                                    padding: '16px', background: 'var(--bg-card)',
                                    border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                                    transition: 'all 0.2s',
                                }}>
                                    <Link href={`/products/${item.product_id}`}>
                                        <img
                                            src={item.image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=120&h=120&fit=crop'}
                                            alt={item.name}
                                            style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '8px', background: 'var(--bg-secondary)' }}
                                        />
                                    </Link>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <span className={`badge ${item.condition_type === 'new' ? 'badge-new' : 'badge-used'}`} style={{ marginBottom: '6px' }}>
                                            {item.condition_type === 'new' ? 'มือ 1' : 'มือ 2'}
                                        </span>
                                        <Link href={`/products/${item.product_id}`}>
                                            <h3 style={{ fontSize: '14.5px', fontWeight: '600', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {item.name}
                                            </h3>
                                        </Link>
                                        <p style={{ fontSize: '18px', fontWeight: '700', color: 'var(--accent)', fontFamily: 'Space Grotesk' }}>
                                            ฿{item.price.toLocaleString()}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                        {/* Quantity */}
                                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                style={{ padding: '6px 10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span style={{ padding: '6px 12px', fontSize: '14px', fontWeight: '600', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                disabled={item.quantity >= item.stock}
                                                style={{ padding: '6px 10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        {/* Total */}
                                        <div style={{ width: '90px', textAlign: 'right' }}>
                                            <p style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                                ฿{(item.price * item.quantity).toLocaleString()}
                                            </p>
                                        </div>
                                        {/* Remove */}
                                        <button
                                            onClick={() => { removeItem(item.id); toast.success('ลบสินค้าแล้ว'); }}
                                            style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', borderRadius: '6px', transition: 'all 0.2s' }}
                                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--red)'; (e.currentTarget as HTMLElement).style.background = 'var(--red-light)'; }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = 'none'; }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)', padding: '24px', position: 'sticky', top: '80px',
                        }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>สรุปคำสั่งซื้อ</h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                    <span>ราคาสินค้า ({items.length} รายการ)</span>
                                    <span>฿{totalPrice.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                    <span>ค่าจัดส่ง</span>
                                    <span style={{ color: shippingFee === 0 ? 'var(--green)' : 'inherit' }}>
                                        {shippingFee === 0 ? 'ฟรี!' : `฿${shippingFee}`}
                                    </span>
                                </div>
                            </div>

                            {totalPrice < 3000 && (
                                <div style={{
                                    padding: '12px', background: 'var(--accent-light)',
                                    border: '1px solid rgba(108,99,255,0.2)', borderRadius: '8px', marginBottom: '16px',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--accent)' }}>
                                        <Truck size={14} />
                                        <span>อีก ฿{(3000 - totalPrice).toLocaleString()} จะได้ส่งฟรี!</span>
                                    </div>
                                </div>
                            )}

                            <div style={{ height: '1px', background: 'var(--border)', margin: '16px 0' }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <span style={{ fontSize: '16px', fontWeight: '600' }}>รวมทั้งหมด</span>
                                <span style={{ fontSize: '22px', fontWeight: '800', color: 'var(--accent)', fontFamily: 'Space Grotesk' }}>
                                    ฿{grandTotal.toLocaleString()}
                                </span>
                            </div>

                            <button onClick={handleCheckout} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px', justifyContent: 'center' }}>
                                ดำเนินการชำระเงิน →
                            </button>

                            <Link href="/products" style={{
                                display: 'block', textAlign: 'center', marginTop: '12px',
                                fontSize: '13.5px', color: 'var(--text-muted)', transition: 'color 0.2s',
                            }}>
                                ← ช้อปต่อ
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
