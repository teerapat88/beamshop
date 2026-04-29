'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store';
import { Order } from '@/types';
import { Package, ChevronLeft, MapPin, Truck, CreditCard, Calendar, Tag, User, Mail, Phone, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_MAP: Record<string, string> = {
    pending: 'รอดำเนินการ', confirmed: 'ยืนยันแล้ว', processing: 'กำลังเตรียม',
    shipped: 'จัดส่งแล้ว', delivered: 'ส่งสำเร็จ', cancelled: 'ยกเลิก', refunded: 'คืนเงิน',
};

export default function AdminOrderDetailsPage() {
    const { orderNumber } = useParams();
    const { user } = useAuthStore();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [trackingNumber, setTrackingNumber] = useState('');

    useEffect(() => {
        if (!user || user.role !== 'admin') { router.push('/'); return; }
        fetchOrderDetails();
    }, [user, orderNumber]);

    const fetchOrderDetails = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/orders/admin/details/${orderNumber}`);
            setOrder(res.data.data);
            setTrackingNumber(res.data.data.tracking_number || '');
        } catch (err: any) {
            toast.error('ไม่พบข้อมูลคำสั่งซื้อ');
            router.push('/admin/orders');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (status: string) => {
        setUpdating(true);
        try {
            await api.put(`/orders/admin/${order.id}/status`, { status, tracking_number: trackingNumber });
            toast.success('อัปเดตสถานะการสั่งซื้อแล้ว');
            fetchOrderDetails();
        } catch {
            toast.error('อัปเดตไม่สำเร็จ');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <div style={{ padding: '60px 0' }}>
            <div className="container" style={{ maxWidth: '1000px' }}>
                <div className="skeleton" style={{ height: '40px', width: '200px', marginBottom: '24px' }} />
                <div className="skeleton" style={{ height: '500px', borderRadius: 'var(--radius)' }} />
            </div>
        </div>
    );

    if (!order) return null;

    return (
        <div style={{ padding: '32px 0 80px', background: 'var(--bg-primary)', minHeight: '100vh' }}>
            <div className="container" style={{ maxWidth: '1000px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <Link href="/admin/orders" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
                        <ChevronLeft size={16} /> กลับไปยังรายการทั้งหมด
                    </Link>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <select
                            value={order.status}
                            onChange={(e) => updateStatus(e.target.value)}
                            disabled={updating}
                            className="input-field"
                            style={{ padding: '8px 12px', width: 'auto', fontSize: '14px' }}
                        >
                            {Object.entries(STATUS_MAP).map(([val, label]) => (
                                <option key={val} value={val}>{label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', alignItems: 'start' }}>
                    {/* Main Content */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Order Summary Card */}
                        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                <div>
                                    <h1 style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'Space Grotesk', color: 'var(--text-primary)', marginBottom: '4px' }}>
                                        คำสั่งซื้อ #{order.order_number}
                                    </h1>
                                    <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                                        สั่งซื้อเมื่อ: {new Date(order.created_at).toLocaleString('th-TH')}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span className={`badge status-${order.status}`} style={{ fontSize: '13px', padding: '6px 14px' }}>
                                        {STATUS_MAP[order.status]}
                                    </span>
                                </div>
                            </div>

                            {/* Tracking Number Input */}
                            <div style={{ padding: '20px', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>หมายเลขติดตามพัสดุ (Tracking Number)</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="text"
                                        value={trackingNumber}
                                        onChange={(e) => setTrackingNumber(e.target.value)}
                                        placeholder="ใส่หมายเลขพัสดุ..."
                                        className="input-field"
                                        style={{ height: '42px' }}
                                    />
                                    <button
                                        onClick={() => updateStatus(order.status)}
                                        disabled={updating}
                                        className="btn-primary"
                                        style={{ padding: '0 20px', whiteSpace: 'nowrap' }}
                                    >
                                        อัปเดตพัสดุ
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>รายการสินค้า ({order.items?.length})</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {order.items?.map((item: any) => (
                                    <div key={item.id} style={{ display: 'flex', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                                        <img src={item.product_image} style={{ width: '64px', height: '64px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--border)' }} />
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: '600', fontSize: '15px' }}>{item.product_name}</p>
                                            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>฿{Number(item.price).toLocaleString()} x {item.quantity}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontWeight: '700', fontSize: '15px' }}>฿{Number(item.subtotal).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                                <div style={{ marginTop: '8px', borderTop: '2px solid var(--bg-secondary)', paddingTop: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>ยอดรวมสินค้า</span>
                                        <span>฿{Number(order.subtotal).toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>ค่าจัดส่ง</span>
                                        <span>฿{Number(order.shipping_fee).toLocaleString()}</span>
                                    </div>
                                    {order.discount_amount > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: 'var(--red)' }}>
                                            <span>ส่วนลด</span>
                                            <span>-฿{Number(order.discount_amount).toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '18px', fontWeight: '800' }}>
                                        <span>ยอดรวมสุทธิ</span>
                                        <span style={{ color: 'var(--accent)' }}>฿{Number(order.total).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Slip If paid */}
                        {order.payment_slip && (
                            <div style={{ background: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>หลักฐานการโอนเงิน</h2>
                                <img src={order.payment_slip} alt="Payment Slip" style={{ width: '100%', borderRadius: '12px', border: '1px solid var(--border)' }} />
                                <div style={{ marginTop: '12px', textAlign: 'center' }}>
                                    <a href={order.payment_slip} target="_blank" rel="noreferrer" style={{ fontSize: '14px', color: 'var(--accent)', fontWeight: '600', textDecoration: 'none' }}>
                                        ดูรูปขนาดเต็ม <ExternalLink size={14} />
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar: Customer & Shipping */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '32px' }}>
                        {/* Customer Info */}
                        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <User size={18} color="var(--accent)" /> ข้อมูลลูกค้า
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: 'var(--accent)' }}>
                                        {order.username?.[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: '600', fontSize: '15px' }}>{order.full_name || order.username}</p>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ID: {order.user_id}</p>
                                    </div>
                                </div>
                                <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Mail size={14} color="var(--text-muted)" /> {order.email}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Phone size={14} color="var(--text-muted)" /> {order.shipping_phone}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <MapPin size={18} color="var(--accent)" /> ที่อยู่การจัดส่ง
                            </h3>
                            <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                <p style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>{order.shipping_name}</p>
                                <p>{order.shipping_address}</p>
                                <p>{order.shipping_subdistrict}, {order.shipping_district}</p>
                                <p>{order.shipping_province} {order.shipping_zipcode}</p>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <CreditCard size={18} color="var(--accent)" /> การชำระเงิน
                            </h3>
                            <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                                <p style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px', textTransform: 'uppercase' }}>{order.payment_method}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>สถานะ:</span>
                                    <span style={{ fontWeight: '700', color: order.payment_status === 'paid' ? 'var(--green)' : 'var(--orange)' }}>
                                        {order.payment_status === 'paid' ? 'ชำระเงินแล้ว' : 'ยังไม่ชำระเงิน'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Customer Notes */}
                        {order.notes && (
                            <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>บันทึกเพิ่มเติม</h3>
                                <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontStyle: 'italic' }}>"{order.notes}"</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
