'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';
import { RefreshCw, Search, LayoutDashboard, Package, ShoppingBag, Users, Shield, ShieldAlert, BarChart3 } from 'lucide-react';

const SIDEBAR_ITEMS = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/products', icon: Package, label: 'สินค้า' },
    { href: '/admin/orders', icon: ShoppingBag, label: 'คำสั่งซื้อ' },
    { href: '/admin/users', icon: Users, label: 'ผู้ใช้' },
];

export default function AdminUsersPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!user || user.role !== 'admin') { router.push('/'); return; }
        fetchUsers();
    }, [user]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const url = search ? `/auth/users?search=${encodeURIComponent(search)}` : '/auth/users';
            const res = await api.get(url);
            setUsers(res.data.data || []);
        } catch {
            setUsers([]);
        } finally { setLoading(false); }
    };

    const toggleRole = async (userId: number, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (!confirm(`เปลี่ยนสถานะเป็น ${newRole}?`)) return;
        try {
            await api.put(`/auth/users/${userId}/role`, { role: newRole });
            toast.success('อัปเดตสิทธิ์ผู้ใช้แล้ว');
            fetchUsers();
        } catch { toast.error('เกิดข้อผิดพลาด'); }
    };

    const toggleStatus = async (userId: number, currentStatus: boolean) => {
        const action = currentStatus ? 'แบน' : 'ปลดแบน';
        if (!confirm(`ยืนยันการ${action}ผู้ใช้นี้?`)) return;
        try {
            await api.put(`/auth/users/${userId}/status`, { is_active: !currentStatus });
            toast.success(`${action}ผู้ใช้สำเร็จ`);
            fetchUsers();
        } catch { toast.error('เกิดข้อผิดพลาด'); }
    };

    if (!user || user.role !== 'admin') return null;

    return (
        <div style={{ display: 'flex', minHeight: '80vh' }}>
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
                    const isActive = href === '/admin/users';
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
                    <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>จัดการผู้ใช้</h1>
                    <button onClick={fetchUsers} className="btn-secondary" style={{ fontSize: '13px', padding: '8px 16px' }}>
                        <RefreshCw size={14} /> รีเฟรช
                    </button>
                </div>

                <div style={{ position: 'relative', marginBottom: '20px', maxWidth: '400px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="text" placeholder="ค้นหาชื่อผู้ใช้ / อีเมล..." value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && fetchUsers()}
                        className="input-field" style={{ paddingLeft: '36px' }} />
                </div>

                <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                                {['ผู้ใช้', 'อีเมล', 'สิทธิ์', 'สถานะ', 'วันที่เข้าร่วม', 'การจัดการ'].map(h => (
                                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '12.2px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center' }}><RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-muted)' }} /></td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>ไม่พบข้อมูลผู้ใช้</td></tr>
                            ) : users.map((u) => (
                                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}
                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)'}
                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                                >
                                    <td style={{ padding: '12px 14px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '32px', height: '32px', background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: 'white', fontSize: '13px' }}>
                                                {u.username[0].toUpperCase()}
                                            </div>
                                            <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>{u.username}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 14px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>{u.email}</td>
                                    <td style={{ padding: '12px 14px' }}>
                                        <span className={`badge ${u.role === 'admin' ? 'badge-accent' : 'badge-new'}`}>
                                            {u.role === 'admin' ? 'แอดมิน' : 'สมาชิก'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 14px' }}>
                                        <span style={{
                                            fontSize: '12px', padding: '3px 10px', borderRadius: '100px',
                                            background: u.is_active ? 'var(--green-light)' : 'var(--red-light)',
                                            color: u.is_active ? 'var(--green)' : 'var(--red)',
                                            border: `1px solid ${u.is_active ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)'}`,
                                        }}>
                                            {u.is_active ? 'ปกติ' : 'ถูกระงับ'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 14px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                                        {new Date(u.created_at).toLocaleDateString('th-TH')}
                                    </td>
                                    <td style={{ padding: '12px 14px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => toggleRole(u.id, u.role)} style={{ padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.2s' }} title="เปลี่ยนสิทธิ์"
                                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
                                            >
                                                <Shield size={14} />
                                            </button>
                                            <button onClick={() => toggleStatus(u.id, u.is_active)} style={{ padding: '6px', background: u.is_active ? 'var(--red-light)' : 'var(--green-light)', border: 'none', borderRadius: '6px', cursor: 'pointer', color: u.is_active ? 'var(--red)' : 'var(--green)' }} title={u.is_active ? 'แบน' : 'ปลดแบน'}>
                                                <ShieldAlert size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
