'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { QrCode, Upload, CheckCircle, Clock, AlertCircle, LayoutDashboard, ChevronRight } from 'lucide-react';

export default function OrderPaymentPage() {
    const { orderNumber } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<any>(null);
    const [paymentData, setPaymentData] = useState<any>(null);
    const [slip, setSlip] = useState<File | null>(null);
    const [slipPreview, setSlipPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

    useEffect(() => {
        fetchData();
        const timer = setInterval(() => setTimeLeft(prev => (prev > 0 ? prev - 1 : 0)), 1000);
        return () => clearInterval(timer);
    }, [orderNumber]);

    const fetchData = async () => {
        try {
            const orderRes = await api.get(`/orders/${orderNumber}`);
            setOrder(orderRes.data.data);

            if (orderRes.data.data.payment_status === 'paid') {
                router.push('/orders');
                return;
            }

            try {
                const paymentRes = await api.get(`/orders/${orderNumber}/payment`);
                setPaymentData(paymentRes.data.data);
            } catch (paymentErr) {
                console.error('Payment QR generation failed:', paymentErr);
                toast.error('ไม่สามารถสร้าง QR Code ได้ (เบอร์ PromptPay อาจไม่ถูกต้อง)');
            }
        } catch (err) {
            toast.error('ไม่พบข้อมูลคำสั่งซื้อ');
            router.push('/orders');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSlip(file);
            setSlipPreview(URL.createObjectURL(file));
        }
    };

    const handleUploadSlip = async () => {
        if (!slip) {
            toast.error('กรุณาเลือกไฟล์สลิป');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('slip', slip);

        try {
            await api.post(`/orders/${orderNumber}/slip`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('แจ้งชำระเงินสำเร็จ! สั่งซื้อคือกำลังถูกตรวจสอบ');
            router.push('/orders');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปโหลด');
        } finally {
            setUploading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>กำลังโหลดข้อมูล...</div>;

    return (
        <div style={{ padding: '32px 0 80px', background: 'var(--bg-primary)', minHeight: '100vh' }}>
            <div className="container" style={{ maxWidth: '900px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
                    <Link href="/orders" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>คำสั่งซื้อ</Link>
                    <ChevronRight size={14} />
                    <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>ชำระเงิน {orderNumber}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
                    {/* Left: QR Code Section */}
                    <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid var(--border)', padding: '40px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ marginBottom: '32px' }}>
                            <div style={{ width: '60px', height: '60px', background: 'var(--accent-light)', borderRadius: '15px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                                <QrCode size={30} color="var(--accent)" />
                            </div>
                            <h1 style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>Thai QR Payment</h1>
                            <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>สแกน QR Code ด้านล่างเพื่อชำระเงินผ่านแอปธนาคาร</p>
                        </div>

                        <div style={{
                            background: '#ffffff', border: '4px solid #004d9b', borderRadius: '24px',
                            padding: '24px', display: 'inline-block', position: 'relative',
                            boxShadow: '0 10px 30px rgba(0,77,155,0.1)'
                        }}>
                            {/* PromptPay Header */}
                            <div style={{ background: '#004d9b', color: 'white', padding: '10px 0', borderRadius: '12px 12px 0 0', position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '6px', alignItems: 'center' }}>
                                <img src="https://promptpay.io/static/brand/promptpay.png" style={{ height: '14px', filter: 'brightness(0) invert(1)' }} alt="PromptPay" />
                            </div>
                            <div style={{ marginTop: '20px' }}>
                                <img src={paymentData?.qr_code} alt="PromptPay QR" style={{ width: '240px', height: '240px' }} />
                            </div>
                            <div style={{ marginTop: '12px', textAlign: 'center' }}>
                                <p style={{ fontSize: '12px', color: '#004d9b', fontWeight: '700' }}>พร้อมเพย์ (PromptPay)</p>
                                <p style={{ fontSize: '16px', fontWeight: '800', letterSpacing: '1px', marginTop: '4px' }}>{paymentData?.promptpay_id}</p>
                            </div>
                        </div>

                        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ยอดที่ต้องชำระ</p>
                                <p style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent)', fontFamily: 'Space Grotesk' }}>฿{Number(order?.total).toLocaleString()}</p>
                            </div>
                            <div style={{ width: '1px', background: 'var(--border)' }} />
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ทำรายการภายใน</p>
                                <p style={{ fontSize: '24px', fontWeight: '800', color: timeLeft < 60 ? 'var(--red)' : 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>{formatTime(timeLeft)}</p>
                            </div>
                        </div>

                        <div style={{ marginTop: '40px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start', textAlign: 'left' }}>
                            <AlertCircle size={18} color="var(--text-muted)" style={{ marginTop: '2px', flexShrink: 0 }} />
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                <strong>คำแนะนำ:</strong> บันทึกรูป QR Code หรือสแกนจ่ายโดยตรงผ่านแอปพลิเคชันธนาคารของคุณ ยอดชำระต้องตรงตามที่ระบุเพื่อให้ระบบตรวจสอบได้อัตโนมัติ
                            </p>
                        </div>
                    </div>

                    {/* Right: Slip Upload Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid var(--border)', padding: '28px', boxShadow: 'var(--shadow-sm)' }}>
                            <h2 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Upload size={18} color="var(--accent)" /> แจ้งชำระเงิน
                            </h2>

                            <div
                                style={{
                                    border: '2px dashed var(--border)',
                                    borderRadius: '16px',
                                    padding: '24px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    background: slipPreview ? 'transparent' : 'var(--bg-secondary)',
                                    position: 'relative'
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                                onClick={() => document.getElementById('slip-upload')?.click()}
                            >
                                {slipPreview ? (
                                    <img src={slipPreview} style={{ width: '100%', borderRadius: '10px', display: 'block' }} alt="Slip Preview" />
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                                            <Upload size={18} color="var(--text-muted)" />
                                        </div>
                                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>อัปโหลดหลักฐานการโอนเงิน</p>
                                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>รองรับ JPG, PNG (ไม่เกิน 5MB)</p>
                                    </div>
                                )}
                                <input id="slip-upload" type="file" accept="image/*" hidden onChange={handleFileChange} />
                            </div>

                            <button
                                onClick={handleUploadSlip}
                                disabled={!slip || uploading}
                                className="btn-primary"
                                style={{ width: '100%', marginTop: '20px', height: '48px', justifyContent: 'center', fontSize: '15px' }}
                            >
                                {uploading ? 'กำลังอัพโหลด...' : 'ส่งหลักฐาน'}
                            </button>
                        </div>

                        <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid var(--border)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>รายละเอียดคำสั่งซื้อ</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>หมายเลข</span>
                                    <span style={{ fontWeight: '600' }}>{orderNumber}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>วันที่สั่งซื้อ</span>
                                    <span>{new Date(order?.created_at).toLocaleDateString('th-TH')}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>สถานะ</span>
                                    <span style={{ color: 'var(--accent)', fontWeight: '600' }}>รอดำเนินการ</span>
                                </div>
                                <div style={{ padding: '12px 0', borderTop: '1px dashed var(--border)', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '700', fontSize: '15px' }}>ยอดเงินสุทธิ</span>
                                    <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent)', fontFamily: 'Space Grotesk' }}>฿{Number(order?.total).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <Link href="/orders" style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', display: 'block' }}>
                            จ่ายทีหลังได้ที่เมนู "คำสั่งซื้อของฉัน"
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
