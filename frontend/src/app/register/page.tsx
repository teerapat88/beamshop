'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { Eye, EyeOff, Cpu, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const [form, setForm] = useState({ username: '', email: '', password: '', confirm_password: '', full_name: '', phone: '' });
    const [showPass, setShowPass] = useState(false);
    const { register, isLoading } = useAuthStore();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password !== form.confirm_password) {
            toast.error('รหัสผ่านไม่ตรงกัน');
            return;
        }
        if (form.password.length < 6) {
            toast.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
            return;
        }
        try {
            await register({ username: form.username, email: form.email, password: form.password, full_name: form.full_name });
            toast.success('สมัครสมาชิกสำเร็จ!');
            router.push('/');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาด');
        }
    };

    const updateForm = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

    const passwordStrength = () => {
        const p = form.password;
        if (!p) return null;
        if (p.length < 6) return { label: 'อ่อนแอ', color: 'var(--red)' };
        if (p.length < 10) return { label: 'ปานกลาง', color: 'var(--orange)' };
        return { label: 'แข็งแกร่ง', color: 'var(--green)' };
    };
    const strength = passwordStrength();

    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--bg-secondary)' }}>
            <div style={{ width: '100%', maxWidth: '480px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '16px' }}>
                        <div style={{ background: 'var(--accent)', borderRadius: '10px', padding: '8px', display: 'flex' }}>
                            <Cpu size={22} color="white" />
                        </div>
                        <span style={{ fontFamily: 'Space Grotesk', fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)' }}>
                            Beam<span style={{ color: 'var(--accent)' }}>Shop</span>
                        </span>
                    </Link>
                    <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '6px' }}>สมัครสมาชิก</h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>สร้างบัญชีเพื่อเริ่มช้อปปิ้ง</p>
                </div>

                <div style={{
                    background: '#ffffff', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)', padding: '32px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                            <div>
                                <label className="label">ชื่อผู้ใช้ *</label>
                                <input type="text" value={form.username} required onChange={e => updateForm('username', e.target.value)} placeholder="username" className="input-field" />
                            </div>
                            <div>
                                <label className="label">ชื่อ-นามสกุล</label>
                                <input type="text" value={form.full_name} onChange={e => updateForm('full_name', e.target.value)} placeholder="ชื่อ นามสกุล" className="input-field" />
                            </div>
                        </div>
                        <div>
                            <label className="label">อีเมล *</label>
                            <input type="email" value={form.email} required onChange={e => updateForm('email', e.target.value)} placeholder="your@email.com" className="input-field" />
                        </div>
                        <div>
                            <label className="label">เบอร์โทร</label>
                            <input type="tel" value={form.phone} onChange={e => updateForm('phone', e.target.value)} placeholder="0812345678" className="input-field" />
                        </div>
                        <div>
                            <label className="label">รหัสผ่าน *</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPass ? 'text' : 'password'} value={form.password} required
                                    onChange={e => updateForm('password', e.target.value)}
                                    placeholder="อย่างน้อย 6 ตัวอักษร"
                                    className="input-field" style={{ paddingRight: '44px' }}
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {strength && (
                                <p style={{ fontSize: '12px', marginTop: '4px', color: strength.color }}>ความแข็งแกร่ง: {strength.label}</p>
                            )}
                        </div>
                        <div>
                            <label className="label">ยืนยันรหัสผ่าน *</label>
                            <input
                                type="password" value={form.confirm_password} required
                                onChange={e => updateForm('confirm_password', e.target.value)}
                                placeholder="ยืนยันรหัสผ่าน" className="input-field"
                            />
                            {form.confirm_password && form.password !== form.confirm_password && (
                                <p style={{ fontSize: '12px', color: 'var(--red)', marginTop: '4px' }}>รหัสผ่านไม่ตรงกัน</p>
                            )}
                        </div>

                        <button type="submit" disabled={isLoading} className="btn-primary" style={{ padding: '13px', fontSize: '15px', justifyContent: 'center', marginTop: '4px' }}>
                            {isLoading ? 'กำลังสมัคร...' : '🚀 สมัครสมาชิก'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
                            มีบัญชีแล้ว?{' '}
                            <Link href="/login" style={{ color: 'var(--accent)', fontWeight: '500' }}>เข้าสู่ระบบ</Link>
                        </p>
                    </div>
                </div>

                {/* Perks */}
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {['ช้อปได้สะดวก ติดตามคำสั่งซื้อได้', 'รับโค้ดส่วนลดพิเศษสำหรับสมาชิกใหม่', 'บันทึกรายการโปรดและข้อมูลจัดส่ง'].map((text, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                            <CheckCircle size={14} color="var(--green)" />
                            <span>{text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
