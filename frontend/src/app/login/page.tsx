'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { Eye, EyeOff, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const { login, isLoading } = useAuthStore();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password);
            toast.success('เข้าสู่ระบบสำเร็จ!');
            router.push('/');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        }
    };

    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--bg-secondary)' }}>
            <div style={{ width: '100%', maxWidth: '420px' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '16px' }}>
                        <div style={{ background: 'var(--accent)', borderRadius: '10px', padding: '8px', display: 'flex' }}>
                            <Cpu size={22} color="white" />
                        </div>
                        <span style={{ fontFamily: 'Space Grotesk', fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)' }}>
                            Beam<span style={{ color: 'var(--accent)' }}>Shop</span>
                        </span>
                    </Link>
                    <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)' }}>เข้าสู่ระบบ</h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>ยินดีต้อนรับกลับมา!</p>
                </div>

                {/* Form */}
                <div style={{
                    background: '#ffffff', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)', padding: '32px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        <div>
                            <label className="label">อีเมล</label>
                            <input
                                type="email" value={email} required
                                onChange={e => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="label">รหัสผ่าน</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPass ? 'text' : 'password'} value={password} required
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-field"
                                    style={{ paddingRight: '44px' }}
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                                }}>
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading} className="btn-primary" style={{ padding: '13px', fontSize: '15px', justifyContent: 'center', marginTop: '4px' }}>
                            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
                            ยังไม่มีบัญชี?{' '}
                            <Link href="/register" style={{ color: 'var(--accent)', fontWeight: '500' }}>สมัครสมาชิก</Link>
                        </p>
                    </div>
                </div>

                {/* Demo Hint */}
                <div style={{
                    marginTop: '16px', padding: '12px 16px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--accent-light)', border: '1px solid rgba(79,70,229,0.15)',
                    fontSize: '12.5px', color: 'var(--accent)',
                }}>
                    <strong>Admin Demo:</strong> admin@beamshop.com / password: admin123
                </div>
            </div>
        </div>
    );
}
