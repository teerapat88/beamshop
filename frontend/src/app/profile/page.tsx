'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Save, Package } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const { user, setUser } = useAuthStore();
    const router = useRouter();
    const [form, setForm] = useState({ full_name: '', phone: '', address: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) { router.push('/login'); return; }
        setForm({ full_name: user.full_name || '', phone: user.phone || '', address: user.address || '' });
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/auth/profile', form);
            const res = await api.get('/auth/me');
            setUser(res.data.user);
            toast.success('อัปเดตโปรไฟล์แล้ว!');
        } catch {
            toast.error('เกิดข้อผิดพลาด');
        } finally { setLoading(false); }
    };

    if (!user) return null;

    const inputStyle = {
        width: '100%', padding: '12px 16px',
        background: '#ffffff', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
    };

    return (
        <div style={{ padding: '40px 0 60px' }}>
            <div className="container" style={{ maxWidth: '680px' }}>
                <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '26px', fontWeight: '700', marginBottom: '28px' }}>โปรไฟล์ของฉัน</h1>

                {/* User Card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: '24px' }}>
                    <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '800', color: 'white', flexShrink: 0 }}>
                        {(user.full_name?.[0] || user.username[0]).toUpperCase()}
                    </div>
                    <div>
                        <h2 style={{ fontSize: '20px', fontWeight: '700' }}>{user.full_name || user.username}</h2>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{user.email}</p>
                        <span className={`badge ${user.role === 'admin' ? 'badge-accent' : 'badge-new'}`} style={{ marginTop: '6px' }}>
                            {user.role === 'admin' ? '👑 Admin' : '👤 สมาชิก'}
                        </span>
                    </div>
                </div>

                {/* Edit Form */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '28px', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '20px' }}>ข้อมูลส่วนตัว</h2>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>ชื่อ-นามสกุล</label>
                            <input type="text" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="ชื่อ นามสกุล" style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>เบอร์โทร</label>
                            <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="0812345678" style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>ที่อยู่</label>
                            <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="ที่อยู่จัดส่งหลัก" rows={3} style={{ ...inputStyle, resize: 'vertical' }} onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary" style={{ alignSelf: 'flex-start', padding: '11px 24px', fontSize: '14px' }}>
                            <Save size={15} /> {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                        </button>
                    </form>
                </div>

                {/* Quick links */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Link href="/orders" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', textDecoration: 'none', color: 'var(--text-secondary)', transition: 'all 0.2s' }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--accent)'; el.style.color = 'var(--text-primary)'; }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.color = 'var(--text-secondary)'; }}
                    >
                        <Package size={18} color="var(--accent)" />
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>คำสั่งซื้อของฉัน</span>
                    </Link>
                    <Link href="/cart" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', textDecoration: 'none', color: 'var(--text-secondary)', transition: 'all 0.2s' }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--accent)'; el.style.color = 'var(--text-primary)'; }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.color = 'var(--text-secondary)'; }}
                    >
                        <Package size={18} color="var(--green)" />
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>ตะกร้าสินค้า</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
