'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';
import { RefreshCw, Search, LayoutDashboard, Package, ShoppingBag, Users, BarChart3 } from 'lucide-react';

const STATUS_MAP: Record<string, string> = {
    pending: 'รอดำเนินการ', confirmed: 'ยืนยันแล้ว', processing: 'กำลังเตรียม',
    shipped: 'จัดส่งแล้ว', delivered: 'ส่งสำเร็จ', cancelled: 'ยกเลิก', refunded: 'คืนเงิน',
};

const SIDEBAR_ITEMS = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/products', icon: Package, label: 'สินค้า' },
    { href: '/admin/orders', icon: ShoppingBag, label: 'คำสั่งซื้อ' },
    { href: '/admin/users', icon: Users, label: 'ผู้ใช้' },
];

export default function AdminOrdersPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    useEffect(() => {
        if (!user || user.role !== 'admin') { router.push('/'); return; }
        fetchOrders();
    }, [user, statusFilter]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ limit: '50' });
            if (statusFilter) params.set('status', statusFilter);
            if (search) params.set('search', search);
            const res = await api.get(`/orders/admin/all?${params}`);
            setOrders(res.data.data || []);
        } catch { }
        finally { setLoading(false); }
    };

    const updateStatus = async (orderId: number, status: string) => {
        setUpdatingId(orderId);
        try {
            await api.put(`/orders/admin/${orderId}/status`, { status });
            toast.success('อัปเดตสถานะแล้ว');
            fetchOrders();
        } catch {
            toast.error('เกิดข้อผิดพลาด');
        } finally { setUpdatingId(null); }
    };

    if (!user || user.role !== 'admin') return null;

    return (
        <div style={{ display: 'flex', minHeight: '80vh' }}>
            {/* Sidebar */}
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
                    const isActive = href === '/admin/orders';
                    return (
                        <Link key={href} href={href} style={{
                            display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
                            borderRadius: '8px', fontSize: '14px',
                            color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                            background: isActive ? 'var(--accent-light)' : 'transparent',
                            fontWeight: isActive ? '600' : '500',
                            transition: 'all 0.2s', textDecoration: 'none', marginBottom: '2px',
                        }}>
                            <Icon size={16} /> {label}
                        </Link>
                    );
                })}
            </aside>

            <div style={{ flex: 1, padding: '32px', overflow: 'auto', background: 'var(--bg-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>จัดการคำสั่งซื้อ</h1>
                    <button onClick={fetchOrders} className="btn-secondary" style={{ fontSize: '13px', padding: '8px 16px' }}>
                        <RefreshCw size={14} /> รีเฟรช
                    </button>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input type="text" placeholder="ค้นหาหมายเลข / ชื่อลูกค้า..." value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && fetchOrders()}
                            className="input-field" style={{ paddingLeft: '36px', width: '260px' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                            <button key={s} onClick={() => setStatusFilter(s)} style={{
                                padding: '7px 14px', fontSize: '12.5px', borderRadius: '100px',
                                border: `1px solid ${statusFilter === s ? 'var(--accent)' : 'var(--border)'}`, cursor: 'pointer',
                                background: statusFilter === s ? 'var(--accent)' : '#ffffff',
                                color: statusFilter === s ? 'white' : 'var(--text-secondary)',
                                transition: 'all 0.2s',
                            }}>
                                {s ? STATUS_MAP[s] : 'ทั้งหมด'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                                    {['หมายเลข', 'ลูกค้า', 'ยอดรวม', 'การชำระ', 'สถานะ', 'อัปเดตสถานะ', 'วันที่'].map(h => (
                                        <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td colSpan={7} style={{ padding: '16px' }}>
                                                <div className="skeleton" style={{ height: '20px', borderRadius: '4px' }} />
                                            </td>
                                        </tr>
                                    ))
                                ) : orders.length === 0 ? (
                                    <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>ไม่มีคำสั่งซื้อ</td></tr>
                                ) : orders.map((order) => (
                                    <tr key={order.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)'}
                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '12px 14px', fontWeight: '600', color: 'var(--accent)', fontSize: '13.5px' }}>
                                            <Link href={`/admin/orders/${order.order_number}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                                                #{order.order_number}
                                            </Link>
                                        </td>
                                        <td style={{ padding: '12px 14px', fontSize: '13px' }}>
                                            <p style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{order.full_name || order.username}</p>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{order.email}</p>
                                        </td>
                                        <td style={{ padding: '12px 14px', fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>฿{Number(order.total).toLocaleString()}</td>
                                        <td style={{ padding: '12px 14px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>{order.payment_method}</td>
                                        <td style={{ padding: '12px 14px' }}>
                                            <span className={`badge status-${order.status}`}>{STATUS_MAP[order.status]}</span>
                                        </td>
                                        <td style={{ padding: '12px 14px' }}>
                                            <select
                                                value={order.status}
                                                onChange={e => updateStatus(order.id, e.target.value)}
                                                disabled={updatingId === order.id}
                                                style={{ padding: '6px 10px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12.5px', cursor: 'pointer' }}
                                            >
                                                {Object.entries(STATUS_MAP).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                            </select>
                                        </td>
                                        <td style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                            {new Date(order.created_at).toLocaleDateString('th-TH')}
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
