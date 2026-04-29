'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store';
import { Order } from '@/types';
import { Package, ChevronLeft, MapPin, Truck, CreditCard, Calendar, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_MAP: Record<string, { label: string; class: string }> = {
    pending: { label: 'รอดำเนินการ', class: 'status-pending' },
    confirmed: { label: 'ยืนยันแล้ว', class: 'status-confirmed' },
    processing: { label: 'กำลังเตรียม', class: 'status-processing' },
    shipped: { label: 'จัดส่งแล้ว', class: 'status-shipped' },
    delivered: { label: 'ส่งสำเร็จ', class: 'status-delivered' },
    cancelled: { label: 'ยกเลิก', class: 'status-cancelled' },
};

export default function OrderDetailsPage() {
    const { orderNumber } = useParams();
    const { user } = useAuthStore();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) { router.push('/login'); return; }
        fetchOrderDetails();
    }, [user, orderNumber]);

    const fetchOrderDetails = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/orders/${orderNumber}`);
            setOrder(res.data.data);
        } catch (err: any) {
            toast.error('ไม่พบข้อมูลคำสั่งซื้อ');
            router.push('/orders');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div style={{ padding: '60px 0' }}>
            <div className="container" style={{ maxWidth: '900px' }}>
                <div className="skeleton" style={{ height: '40px', width: '200px', marginBottom: '24px' }} />
                <div className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius)' }} />
            </div>
        </div>
    );

    if (!order) return null;

    const status = STATUS_MAP[order.status] || { label: order.status, class: '' };

    return (
        <div style={{ padding: '32px 0 80px', background: 'var(--bg-primary)', minHeight: '100vh' }}>
            <div className="container" style={{ maxWidth: '900px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <Link href="/orders" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
                        <ChevronLeft size={16} /> กลับไปที่รายการสั่งซื้อ
                    </Link>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {order.status === 'pending' && (order.payment_method === 'promptpay' || order.payment_method === 'bank_transfer') && (
                            <Link href={`/checkout/payment/${order.order_number}`} className="btn-primary" style={{ fontSize: '13px', padding: '8px 16px' }}>
                                💳 ชำระเงินตอนนี้
                            </Link>
                        )}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
                    {/* Main Content */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Order Header Info */}
                        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                <div>
                                    <h1 style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'Space Grotesk', color: 'var(--text-primary)', marginBottom: '4px' }}>
                                        คำสั่งซื้อ #{order.order_number}
                                    </h1>
                                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {new Date(order.created_at).toLocaleString('th-TH')}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span className={`badge ${status.class}`} style={{ fontSize: '11px', padding: '2px 8px' }}>{status.label}</span>
                                        </span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>ยอดรวมสุทธิ</p>
                                    <p style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent)', fontFamily: 'Space Grotesk' }}>฿{Number(order.total).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Tracking Info */}
                            {order.tracking_number && (
                                <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '32px', height: '32px', background: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                                            <Truck size={16} color="var(--green)" />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>หมายเลขพัสดุ</p>
                                            <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{order.tracking_number}</p>
                                        </div>
                                        <button className="btn-secondary" style={{ marginLeft: 'auto', fontSize: '12px', padding: '4px 10px' }} onClick={() => {
                                            navigator.clipboard.writeText(order.tracking_number || '');
                                            toast.success('คัดลอกแล้ว');
                                        }}>คัดลอก</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Items Section */}
                        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                            <h2 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Package size={18} color="var(--accent)" /> รายการสินค้า
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {order.items?.map((item) => (
                                    <div key={item.id} style={{ display: 'flex', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                                        <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-secondary)', border: '1px solid var(--border)', flexShrink: 0 }}>
                                            {item.product_image ? (
                                                <img src={item.product_image} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Package size={24} color="var(--text-muted)" />
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <Link href={`/products/${item.product_id}`} style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', textDecoration: 'none', display: 'block', marginBottom: '4px' }}>
                                                {item.product_name}
                                            </Link>
                                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                                                <span className={`badge-status ${item.condition_type === 'new' ? 'new' : 'used'}`} style={{ fontSize: '10px', padding: '1px 6px' }}>
                                                    {item.condition_type === 'new' ? 'ของใหม่' : 'มือสอง'}
                                                </span>
                                            </p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>฿{Number(item.price).toLocaleString()} x {item.quantity}</p>
                                                <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>฿{Number(item.subtotal).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment Slip */}
                        {order.payment_slip && (
                            <div style={{ background: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                                <h2 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '20px' }}>หลักฐานการชำระเงิน</h2>
                                <img src={order.payment_slip} alt="Payment Slip" style={{ width: '100%', maxWidth: '400px', borderRadius: '12px', border: '1px solid var(--border)' }} />
                            </div>
                        )}

                        {/* Shipping & Payment Method */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{ background: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <MapPin size={16} color="var(--accent)" /> ที่อยู่ประกอบการจัดส่ง
                                </h3>
                                <div style={{ fontSize: '13.5px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                                    <p style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>{order.shipping_name}</p>
                                    <p>{order.shipping_phone}</p>
                                    <p>{order.shipping_address}</p>
                                    <p>{order.shipping_subdistrict}, {order.shipping_district}</p>
                                    <p>{order.shipping_province} {order.shipping_zipcode}</p>
                                </div>
                            </div>
                            <div style={{ background: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CreditCard size={16} color="var(--accent)" /> วิธีการชำระเงิน
                                </h3>
                                <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                                    <p style={{ fontWeight: '600', color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                                        {order.payment_method === 'promptpay' ? 'พร้อมเพย์ (PromptPay)' :
                                            order.payment_method === 'bank_transfer' ? 'โอนเงินผ่านธนาคาร' :
                                                order.payment_method === 'cod' ? 'เก็บเงินปลายทาง' : order.payment_method}
                                    </p>
                                    <p style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        สถานะ: <span style={{ color: order.payment_status === 'paid' ? 'var(--green)' : 'var(--orange)', fontWeight: '600' }}>
                                            {order.payment_status === 'paid' ? 'ชำระเงินแล้ว' : 'รอการชำระเงิน'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Order Summary */}
                    <div style={{ position: 'sticky', top: '32px' }}>
                        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                            <h2 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '20px' }}>สรุปคำสั่งซื้อ</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                    <span>ยอดรวมสินค้า</span>
                                    <span>฿{Number(order.subtotal).toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                    <span>ค่าจัดส่ง</span>
                                    <span>{order.shipping_fee > 0 ? `฿${Number(order.shipping_fee).toLocaleString()}` : 'ฟรี'}</span>
                                </div>
                                {order.discount_amount > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--red)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Tag size={14} /> ส่วนลด</span>
                                        <span>-฿{Number(order.discount_amount).toLocaleString()}</span>
                                    </div>
                                )}
                                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '700', fontSize: '16px' }}>ยอดรวมทั้งหมด</span>
                                    <span style={{ fontSize: '22px', fontWeight: '800', color: 'var(--accent)', fontFamily: 'Space Grotesk' }}>฿{Number(order.total).toLocaleString()}</span>
                                </div>
                            </div>

                            {order.notes && (
                                <div style={{ marginTop: '20px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '13px' }}>
                                    <p style={{ fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase' }}>หมายเหตุจากลูกค้า</p>
                                    <p style={{ color: 'var(--text-secondary)' }}>{order.notes}</p>
                                </div>
                            )}

                            {order.status === 'pending' && (
                                <div style={{ marginTop: '24px' }}>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '12px' }}>
                                        กรุณาชำระเงินเพื่อให้เราเริ่มดำเนินการจัดส่งสินค้า
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Order Help */}
                        <div style={{ marginTop: '20px', padding: '20px', background: 'var(--accent-light)', borderRadius: '16px', border: '1px solid var(--accent-light)' }}>
                            <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--accent)', marginBottom: '4px' }}>มีคำถามเกี่ยวกับคำสั่งซื้อ?</p>
                            <p style={{ fontSize: '12px', color: 'var(--accent)', opacity: 0.8, marginBottom: '12px' }}>ติดต่อฝ่ายบริการลูกค้าของเราได้ตลอด 24 ชั่วโมง</p>
                            <Link href="/contact" style={{ display: 'block', textAlign: 'center', fontSize: '13px', padding: '8px', background: 'var(--accent)', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
                                แชทกับเจ้าหน้าที่
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
