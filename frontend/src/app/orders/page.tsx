'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store';
import { Order } from '@/types';
import { Package } from 'lucide-react';

const STATUS_MAP: Record<string, { label: string; class: string }> = {
    pending: { label: 'รอดำเนินการ', class: 'status-pending' },
    confirmed: { label: 'ยืนยันแล้ว', class: 'status-confirmed' },
    processing: { label: 'กำลังเตรียม', class: 'status-processing' },
    shipped: { label: 'จัดส่งแล้ว', class: 'status-shipped' },
    delivered: { label: 'ส่งสำเร็จ', class: 'status-delivered' },
    cancelled: { label: 'ยกเลิก', class: 'status-cancelled' },
};

export default function OrdersPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        if (!user) { router.push('/login'); return; }
        fetchOrders();
    }, [user, statusFilter]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = statusFilter ? `?status=${statusFilter}` : '';
            const res = await api.get(`/orders${params}`);
            setOrders(res.data.data || []);
        } catch { }
        finally { setLoading(false); }
    };

    if (!user) return null;

    return (
        <div style={{ padding: '32px 0 60px' }}>
            <div className="container" style={{ maxWidth: '860px' }}>
                <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '26px', fontWeight: '700', marginBottom: '24px' }}>
                    📦 คำสั่งซื้อของฉัน
                </h1>

                {/* Filter */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    {[
                        { value: '', label: 'ทั้งหมด' },
                        { value: 'pending', label: 'รอดำเนินการ' },
                        { value: 'confirmed', label: 'ยืนยันแล้ว' },
                        { value: 'shipped', label: 'จัดส่งแล้ว' },
                        { value: 'delivered', label: 'ส่งสำเร็จ' },
                        { value: 'cancelled', label: 'ยกเลิก' },
                    ].map(({ value, label }) => (
                        <button key={value}
                            onClick={() => setStatusFilter(value)}
                            style={{
                                padding: '7px 16px', fontSize: '13px', borderRadius: '100px',
                                border: '1px solid var(--border)', cursor: 'pointer',
                                background: statusFilter === value ? 'var(--accent)' : 'transparent',
                                color: statusFilter === value ? 'white' : 'var(--text-secondary)',
                                transition: 'all 0.2s',
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius)' }} />)}
                    </div>
                ) : orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <Package size={56} style={{ margin: '0 auto 16px', color: 'var(--text-muted)', display: 'block' }} />
                        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>ไม่มีคำสั่งซื้อ</h2>
                        <Link href="/products" className="btn-primary" style={{ display: 'inline-flex', marginTop: '16px' }}>เริ่มช้อปปิ้ง</Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {orders.map((order) => {
                            const status = STATUS_MAP[order.status] || { label: order.status, class: '' };
                            return (
                                <div key={order.id} style={{
                                    padding: '20px', background: 'var(--bg-card)',
                                    border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                                    transition: 'border-color 0.2s',
                                }}
                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'}
                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                                        <div>
                                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>หมายเลขคำสั่งซื้อ</p>
                                            <p style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'Space Grotesk', color: 'var(--accent)' }}>#{order.order_number}</p>
                                        </div>
                                        <span className={`badge ${status.class}`}>{status.label}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '24px', marginTop: '14px', flexWrap: 'wrap' }}>
                                        <div>
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>วันที่สั่ง</p>
                                            <p style={{ fontSize: '13.5px', fontWeight: '500' }}>{new Date(order.created_at).toLocaleDateString('th-TH')}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>จำนวนรายการ</p>
                                            <p style={{ fontSize: '13.5px', fontWeight: '500' }}>{order.item_count || '-'} ชิ้น</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ยอดรวม</p>
                                            <p style={{ fontSize: '16px', fontWeight: '700', color: 'var(--accent)', fontFamily: 'Space Grotesk' }}>฿{Number(order.total).toLocaleString()}</p>
                                        </div>
                                        {order.tracking_number && (
                                            <div>
                                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>เลขติดตาม</p>
                                                <p style={{ fontSize: '13.5px', fontWeight: '500', color: 'var(--green)' }}>{order.tracking_number}</p>
                                            </div>
                                        )}
                                        {/* Action Button */}
                                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            {order.status === 'pending' && (order.payment_method === 'promptpay' || order.payment_method === 'bank_transfer') && (
                                                <Link href={`/checkout/payment/${order.order_number}`} className="btn-primary" style={{ fontSize: '12.5px', padding: '6px 14px' }}>
                                                    💳 ชำระเงิน
                                                </Link>
                                            )}
                                            <Link href={`/orders/${order.order_number}`} className="btn-secondary" style={{ fontSize: '12.5px', padding: '6px 14px' }}>
                                                รายละเอียด
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
