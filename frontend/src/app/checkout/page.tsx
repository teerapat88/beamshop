'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuthStore, useCartStore } from '@/store';
import api from '@/lib/api';
import { CheckCircle, Tag, X } from 'lucide-react';

interface ShippingForm {
    shipping_name: string;
    shipping_phone: string;
    shipping_address: string;
    shipping_province: string;
    shipping_district: string;
    shipping_zipcode: string;
    payment_method: 'cash_on_delivery' | 'bank_transfer' | 'promptpay';
    notes: string;
    coupon_code: string;
}

export default function CheckoutPage() {
    const { user } = useAuthStore();
    const { items, getTotalPrice, clearCart } = useCartStore();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');

    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [validatingCoupon, setValidatingCoupon] = useState(false);

    const [form, setForm] = useState<ShippingForm>({
        shipping_name: user?.full_name || '',
        shipping_phone: user?.phone || '',
        shipping_address: user?.address || '',
        shipping_province: '',
        shipping_district: '',
        shipping_zipcode: '',
        payment_method: 'cash_on_delivery',
        notes: '',
        coupon_code: '',
    });

    useEffect(() => {
        if (!user) { router.push('/login'); return; }
        if (items.length === 0 && !orderPlaced && !orderNumber) { router.push('/cart'); }
    }, [user, items, orderPlaced, orderNumber]);

    const subtotal = getTotalPrice();

    // Calculate Discount
    let discount = 0;
    let isFreeShipping = false;

    if (appliedCoupon) {
        if (appliedCoupon.discount_type === 'percentage') {
            discount = (subtotal * appliedCoupon.discount_value) / 100;
            if (appliedCoupon.max_discount) discount = Math.min(discount, appliedCoupon.max_discount);
        } else if (appliedCoupon.discount_type === 'fixed') {
            discount = appliedCoupon.discount_value;
        } else if (appliedCoupon.discount_type === 'free_shipping') {
            isFreeShipping = true;
        }
    }

    const shippingFee = (subtotal >= 3000 || isFreeShipping) ? 0 : 80;
    const grandTotal = subtotal + shippingFee - discount;

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setValidatingCoupon(true);
        try {
            const res = await api.post('/coupons/validate', { code: couponCode, subtotal });
            setAppliedCoupon(res.data.data);
            setForm(f => ({ ...f, coupon_code: res.data.data.code }));
            toast.success('ใช้โค้ดส่วนลดแล้ว');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'โค้ดส่วนลดไม่ถูกต้อง');
            setAppliedCoupon(null);
            setForm(f => ({ ...f, coupon_code: '' }));
        } finally {
            setValidatingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setForm(f => ({ ...f, coupon_code: '' }));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.shipping_name || !form.shipping_phone || !form.shipping_address) {
            toast.error('กรุณากรอกข้อมูลจัดส่งให้ครบ');
            return;
        }

        setLoading(true);
        try {
            const orderItems = items.map((item) => ({ product_id: item.product_id, quantity: item.quantity }));
            const res = await api.post('/orders', {
                ...form,
                items: orderItems,
            });
            const newOrderNumber = res.data.orderNumber;
            setOrderNumber(newOrderNumber);
            clearCart();

            if (form.payment_method === 'promptpay') {
                router.push(`/checkout/payment/${newOrderNumber}`);
            } else {
                setOrderPlaced(true);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาด');
        } finally {
            setLoading(false);
        }
    };

    if (orderPlaced) {
        return (
            <div style={{ padding: '80px 0', textAlign: 'center' }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '80px', height: '80px', background: 'var(--green-light)',
                    borderRadius: '50%', marginBottom: '20px',
                }}>
                    <CheckCircle size={40} color="var(--green)" />
                </div>
                <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px', fontFamily: 'Space Grotesk' }}>
                    สั่งซื้อสำเร็จ! 🎉
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    หมายเลขคำสั่งซื้อ: <strong style={{ color: 'var(--accent)' }}>{orderNumber}</strong>
                </p>
                <p style={{ color: 'var(--text-muted)', marginBottom: '28px', fontSize: '14px' }}>
                    เราจะส่งสินค้าให้คุณโดยเร็วที่สุด
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <Link href="/orders" className="btn-primary">ดูคำสั่งซื้อของฉัน</Link>
                    <Link href="/products" className="btn-secondary">ช้อปต่อ</Link>
                </div>
            </div>
        );
    }

    const inputStyle = {
        width: '100%', padding: '12px 16px',
        background: '#ffffff', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
        transition: 'border-color 0.2s',
    };

    return (
        <div style={{ padding: '32px 0 60px' }}>
            <div className="container">
                <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '26px', fontWeight: '700', marginBottom: '28px' }}>ชำระเงิน</h1>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', alignItems: 'start' }}>
                        {/* Left - Form */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Shipping */}
                            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px' }}>
                                <h2 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '20px' }}>📦 ที่อยู่จัดส่ง</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                    {[
                                        { label: 'ชื่อ-นามสกุล *', key: 'shipping_name', placeholder: 'ชื่อผู้รับสินค้า' },
                                        { label: 'เบอร์โทร *', key: 'shipping_phone', placeholder: '0812345678' },
                                    ].map(({ label, key, placeholder }) => (
                                        <div key={key}>
                                            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>{label}</label>
                                            <input
                                                type="text" placeholder={placeholder} required
                                                value={(form as any)[key]}
                                                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                                style={inputStyle}
                                                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                            />
                                        </div>
                                    ))}
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>ที่อยู่ *</label>
                                        <textarea
                                            placeholder="บ้านเลขที่ ถนน ตำบล/แขวง" required
                                            value={form.shipping_address}
                                            onChange={e => setForm(f => ({ ...f, shipping_address: e.target.value }))}
                                            rows={3}
                                            style={{ ...inputStyle, resize: 'vertical' }}
                                            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                            onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                        />
                                    </div>
                                    {[
                                        { label: 'จังหวัด', key: 'shipping_province', placeholder: 'กรุงเทพมหานคร' },
                                        { label: 'อำเภอ/เขต', key: 'shipping_district', placeholder: 'เขตบางรัก' },
                                        { label: 'รหัสไปรษณีย์', key: 'shipping_zipcode', placeholder: '10500' },
                                    ].map(({ label, key, placeholder }) => (
                                        <div key={key}>
                                            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>{label}</label>
                                            <input
                                                type="text" placeholder={placeholder}
                                                value={(form as any)[key]}
                                                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                                style={inputStyle}
                                                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Payment */}
                            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px' }}>
                                <h2 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '20px' }}>💳 วิธีชำระเงิน</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {[
                                        { value: 'cash_on_delivery', label: '🚚 เก็บเงินปลายทาง (COD)' },
                                        { value: 'bank_transfer', label: '🏦 โอนเงิน (Bank Transfer)' },
                                        { value: 'promptpay', label: '📱 PromptPay' },
                                    ].map(({ value, label }) => (
                                        <label key={value} style={{
                                            display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
                                            border: `1px solid ${form.payment_method === value ? 'var(--accent)' : 'var(--border)'}`,
                                            borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                                            background: form.payment_method === value ? 'var(--accent-light)' : 'transparent',
                                            transition: 'all 0.2s',
                                        }}>
                                            <input
                                                type="radio" name="payment" value={value}
                                                checked={form.payment_method === value as any}
                                                onChange={() => setForm(f => ({ ...f, payment_method: value as any }))}
                                                style={{ accentColor: 'var(--accent)' }}
                                            />
                                            <span style={{ fontSize: '14px' }}>{label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Notes & Coupon */}
                            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px' }}>
                                <h2 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '20px' }}>📝 ข้อมูลเพิ่มเติม</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>โค้ดส่วนลด</label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <div style={{ position: 'relative', flex: 1 }}>
                                                <input type="text" placeholder="กรอกโค้ดส่วนลด (เช่น FREESHIP)"
                                                    value={couponCode}
                                                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                                    style={{ ...inputStyle, paddingRight: appliedCoupon ? '40px' : '16px' }}
                                                    disabled={!!appliedCoupon}
                                                />
                                                {appliedCoupon && (
                                                    <button type="button" onClick={handleRemoveCoupon} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer' }}>
                                                        <X size={16} />
                                                    </button>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleApplyCoupon}
                                                disabled={validatingCoupon || !couponCode || !!appliedCoupon}
                                                className="btn-secondary"
                                                style={{ padding: '0 20px', fontSize: '13px' }}
                                            >
                                                {validatingCoupon ? '...' : 'ใช้โค้ด'}
                                            </button>
                                        </div>
                                        {appliedCoupon && (
                                            <p style={{ fontSize: '12px', color: 'var(--green)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Tag size={12} /> ประยุกต์ใช้โค้ด: <strong>{appliedCoupon.code}</strong>
                                                {appliedCoupon.discount_type === 'free_shipping' ? ' (ส่งฟรี!)' : ` (-฿${discount.toLocaleString()})`}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>หมายเหตุ</label>
                                        <textarea placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
                                            value={form.notes}
                                            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                                            rows={2}
                                            style={{ ...inputStyle, resize: 'vertical' }}
                                            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                            onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right - Summary */}
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px', position: 'sticky', top: '80px' }}>
                            <h2 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '16px' }}>สรุปคำสั่งซื้อ</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                                {items.map((item) => (
                                    <div key={item.id} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <img src={item.image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=60&h=60&fit=crop'} alt=""
                                            style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px' }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: '12.5px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>x{item.quantity}</p>
                                        </div>
                                        <p style={{ fontSize: '13px', fontWeight: '600', flexShrink: 0 }}>฿{(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                            <div style={{ height: '1px', background: 'var(--border)', margin: '16px 0' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                                    <span>ราคาสินค้า</span><span>฿{subtotal.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                                    <span>ค่าจัดส่ง</span>
                                    <span style={{ color: shippingFee === 0 ? 'var(--green)' : 'inherit', textDecoration: isFreeShipping ? 'line-through' : 'none', opacity: isFreeShipping ? 0.6 : 1 }}>฿80</span>
                                    {shippingFee === 0 && <span style={{ color: 'var(--green)', marginLeft: '4px' }}>ฟรี!</span>}
                                </div>
                                {discount > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: 'var(--green)' }}>
                                        <span>ส่วนลด</span><span>-฿{discount.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                            <div style={{ height: '1px', background: 'var(--border)', margin: '16px 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <span style={{ fontSize: '16px', fontWeight: '600' }}>รวมทั้งหมด</span>
                                <span style={{ fontSize: '22px', fontWeight: '800', color: 'var(--accent)', fontFamily: 'Space Grotesk' }}>฿{grandTotal.toLocaleString()}</span>
                            </div>
                            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px', justifyContent: 'center' }}>
                                {loading ? 'กำลังดำเนินการ...' : '✓ ยืนยันคำสั่งซื้อ'}
                            </button>
                            <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>
                                🔒 ปลอดภัย 100% • SSL Secured
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
