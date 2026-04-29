'use client';
import Link from 'next/link';
import { Cpu, Mail, Phone, MapPin, Globe, Video } from 'lucide-react';

export default function Footer() {
    return (
        <footer style={{
            background: '#ffffff',
            borderTop: '1px solid var(--border)',
            padding: '60px 0 24px',
            marginTop: 'auto',
        }}>
            <div className="container">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '40px',
                    marginBottom: '40px',
                }}>
                    {/* Brand */}
                    <div>
                        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', textDecoration: 'none' }}>
                            <div style={{ background: 'var(--accent)', borderRadius: '8px', padding: '6px 8px', display: 'flex' }}>
                                <Cpu size={18} color="white" />
                            </div>
                            <span style={{ fontFamily: 'Space Grotesk', fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                Beam<span style={{ color: 'var(--accent)' }}>Shop</span>
                            </span>
                        </Link>
                        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '16px' }}>
                            ร้านขายอุปกรณ์คอมพิวเตอร์ครบวงจร ทั้งมือ1 และมือ2 ราคายุติธรรม คุ้มค่าทุกชิ้น
                        </p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {[Globe, Video].map((Icon, i) => (
                                <a key={i} href="#" style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    width: '34px', height: '34px', background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-secondary)',
                                    transition: 'all 0.2s',
                                }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; (e.currentTarget as HTMLElement).style.background = 'var(--accent-light)'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)'; }}
                                >
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>สินค้า</h4>
                        {[
                            { label: 'สินค้าทั้งหมด', href: '/products' },
                            { label: 'สินค้ามือ 1', href: '/products?condition=new' },
                            { label: 'สินค้ามือ 2', href: '/products?condition=used' },
                            { label: 'GPU & การ์ดจอ', href: '/products?category=graphics-cards' },
                            { label: 'CPU & โปรเซสเซอร์', href: '/products?category=cpu-processors' },
                            { label: 'RAM & หน่วยความจำ', href: '/products?category=ram-memory' },
                        ].map((item) => (
                            <Link key={item.href} href={item.href} style={{
                                display: 'block', fontSize: '13.5px', color: 'var(--text-muted)',
                                marginBottom: '8px', transition: 'color 0.2s',
                            }}
                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--accent)'}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Account */}
                    <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>บัญชีผู้ใช้</h4>
                        {[
                            { label: 'เข้าสู่ระบบ', href: '/login' },
                            { label: 'สมัครสมาชิก', href: '/register' },
                            { label: 'ตะกร้าสินค้า', href: '/cart' },
                            { label: 'ประวัติการสั่งซื้อ', href: '/orders' },
                            { label: 'โปรไฟล์', href: '/profile' },
                        ].map((item) => (
                            <Link key={item.href} href={item.href} style={{
                                display: 'block', fontSize: '13.5px', color: 'var(--text-muted)',
                                marginBottom: '8px', transition: 'color 0.2s',
                            }}
                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--accent)'}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>ติดต่อเรา</h4>
                        {[
                            { Icon: Phone, text: '02-XXX-XXXX' },
                            { Icon: Mail, text: 'support@beamshop.com' },
                            { Icon: MapPin, text: 'กรุงเทพมหานคร, ประเทศไทย' },
                        ].map(({ Icon, text }, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                <Icon size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                                <span style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>{text}</span>
                            </div>
                        ))}
                        <div style={{
                            marginTop: '16px', padding: '12px 16px',
                            background: 'var(--green-light)', border: '1px solid rgba(22,163,74,0.15)',
                            borderRadius: '8px',
                        }}>
                            <p style={{ fontSize: '12px', color: 'var(--green)', fontWeight: '600' }}>
                                🚚 ส่งฟรี เมื่อซื้อครบ 3,000 บาท
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div style={{
                    paddingTop: '24px', borderTop: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: '12px',
                }}>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                        © 2024 BeamShop. All rights reserved.
                    </p>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                        รับชำระ: โอนเงิน | PromptPay | บัตรเครดิต | เก็บปลายทาง
                    </p>
                </div>
            </div>
        </footer>
    );
}
