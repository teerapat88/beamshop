'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';
import {
    LayoutDashboard, Package, ShoppingBag, Users, Tag,
    TrendingUp, ChevronRight, RefreshCw, BarChart3, Activity,
    DollarSign, Clock, AlertCircle
} from 'lucide-react';

interface Stats {
    totalOrders: number; totalRevenue: number; pendingOrders: number;
    todayOrders: number; todayRevenue: number; totalUsers: number; totalProducts: number;
}

const SIDEBAR_ITEMS = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/products', icon: Package, label: 'สินค้า' },
    { href: '/admin/orders', icon: ShoppingBag, label: 'คำสั่งซื้อ' },
    { href: '/admin/users', icon: Users, label: 'ผู้ใช้' },
];

export default function AdminDashboard() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) { router.push('/login'); return; }
        if (user.role !== 'admin') { router.push('/'); return; }
        fetchDashboard();
    }, [user]);

    const fetchDashboard = async () => {
        setLoading(true);
        try {
            const [statsRes, ordersRes] = await Promise.all([
                api.get('/orders/admin/stats'),
                api.get('/orders/admin/all?limit=5'),
            ]);
            setStats(statsRes.data.data);
            setRecentOrders(ordersRes.data.data || []);
        } catch { }
        finally { setLoading(false); }
    };

    if (!user || user.role !== 'admin') return null;

    const STATUS_MAP: Record<string, string> = {
        pending: 'รอดำเนินการ', confirmed: 'ยืนยันแล้ว', processing: 'กำลังเตรียม',
        shipped: 'จัดส่งแล้ว', delivered: 'ส่งสำเร็จ', cancelled: 'ยกเลิก',
    };

    return (
        <div style={{ display: 'flex', minHeight: '80vh' }}>
            {/* Sidebar */}
            <aside style={{
                width: '240px', background: '#ffffff', borderRight: '1px solid var(--border)',
                padding: '24px 14px', flexShrink: 0,
            }}>
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
                <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', padding: '0 12px' }}>
                    เมนู
                </p>
                {SIDEBAR_ITEMS.map(({ href, icon: Icon, label }) => {
                    const isActive = href === '/admin';
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

            {/* Content */}
            <div style={{ flex: 1, padding: '32px', overflow: 'auto', background: 'var(--bg-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                    <div>
                        <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)' }}>Dashboard</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>ยินดีต้อนรับ, {user.full_name || user.username}</p>
                    </div>
                    <button onClick={fetchDashboard} className="btn-secondary" style={{ fontSize: '13px', padding: '8px 16px' }}>
                        <RefreshCw size={14} /> รีเฟรช
                    </button>
                </div>

                {/* Stats Grid */}
                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
                        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: '130px', borderRadius: 'var(--radius)' }} />)}
                    </div>
                ) : stats && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                        {[
                            { label: 'ยอดคำสั่งซื้อรวม', value: stats.totalOrders.toLocaleString(), sub: 'คำสั่ง', color: '#4f46e5', icon: ShoppingBag },
                            { label: 'รายได้รวม', value: `฿${Number(stats.totalRevenue).toLocaleString()}`, sub: 'บาท', color: '#16a34a', icon: DollarSign },
                            { label: 'รอดำเนินการ', value: stats.pendingOrders.toLocaleString(), sub: 'คำสั่ง', color: '#ca8a04', icon: Clock },
                            { label: 'สมาชิกทั้งหมด', value: stats.totalUsers.toLocaleString(), sub: 'คน', color: '#2563eb', icon: Users },
                            { label: 'สินค้าทั้งหมด', value: stats.totalProducts.toLocaleString(), sub: 'รายการ', color: '#ea580c', icon: Tag },
                            { label: 'คำสั่งวันนี้', value: stats.todayOrders.toLocaleString(), sub: 'คำสั่ง', color: '#7c3aed', icon: Activity },
                            { label: 'รายได้วันนี้', value: `฿${Number(stats.todayRevenue).toLocaleString()}`, sub: 'บาท', color: '#059669', icon: TrendingUp },
                        ].map(({ label, value, sub, color, icon: Icon }, i) => (
                            <div key={i} style={{
                                padding: '20px', background: '#ffffff',
                                border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                                transition: 'all 0.2s',
                            }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLElement).style.transform = 'none';
                                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{label}</p>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}10` }}>
                                        <Icon size={18} color={color} />
                                    </div>
                                </div>
                                <p style={{ fontSize: '26px', fontWeight: '800', fontFamily: 'Space Grotesk', color }}>{value}</p>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{sub}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Quick Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '28px' }}>
                    <Link href="/admin/products" style={{
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px',
                        background: 'rgba(79,70,229,0.04)', border: '1px solid rgba(79,70,229,0.12)',
                        borderRadius: 'var(--radius)', textDecoration: 'none', transition: 'all 0.2s',
                    }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(79,70,229,0.08)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(79,70,229,0.04)'; }}
                    >
                        <Package size={20} color="var(--accent)" />
                        <div>
                            <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>จัดการสินค้า</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>เพิ่ม/แก้ไข/ลบสินค้า</p>
                        </div>
                    </Link>
                    <Link href="/admin/orders" style={{
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px',
                        background: 'rgba(22,163,74,0.04)', border: '1px solid rgba(22,163,74,0.12)',
                        borderRadius: 'var(--radius)', textDecoration: 'none', transition: 'all 0.2s',
                    }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(22,163,74,0.08)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(22,163,74,0.04)'; }}
                    >
                        <ShoppingBag size={20} color="#16a34a" />
                        <div>
                            <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>จัดการคำสั่งซื้อ</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>อัปเดตสถานะคำสั่งซื้อ</p>
                        </div>
                    </Link>
                    <Link href="/admin/users" style={{
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px',
                        background: 'rgba(37,99,235,0.04)', border: '1px solid rgba(37,99,235,0.12)',
                        borderRadius: 'var(--radius)', textDecoration: 'none', transition: 'all 0.2s',
                    }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(37,99,235,0.08)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(37,99,235,0.04)'; }}
                    >
                        <Users size={20} color="#2563eb" />
                        <div>
                            <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>จัดการผู้ใช้</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ดูข้อมูล/แบนผู้ใช้</p>
                        </div>
                    </Link>
                </div>

                {/* Recent Orders */}
                <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>คำสั่งซื้อล่าสุด</h2>
                        <Link href="/admin/orders" style={{ fontSize: '13px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            ดูทั้งหมด <ChevronRight size={12} />
                        </Link>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                                    {['หมายเลข', 'ลูกค้า', 'สถานะ', 'ยอดรวม', 'วันที่'].map(h => (
                                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            <AlertCircle size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                                            <p>ยังไม่มีคำสั่งซื้อ</p>
                                        </td>
                                    </tr>
                                ) : recentOrders.map(order => (
                                    <tr key={order.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)'}
                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '12px 16px', fontSize: '13.5px', fontWeight: '600', color: 'var(--accent)' }}>
                                            #{order.order_number}
                                        </td>
                                        <td style={{ padding: '12px 16px', fontSize: '13.5px', color: 'var(--text-primary)' }}>
                                            {order.full_name || order.username}
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span className={`badge status-${order.status}`}>{STATUS_MAP[order.status]}</span>
                                        </td>
                                        <td style={{ padding: '12px 16px', fontSize: '13.5px', fontWeight: '600', color: 'var(--text-primary)' }}>
                                            ฿{Number(order.total).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '12px 16px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
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
