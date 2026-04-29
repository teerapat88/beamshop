import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'BeamShop - อุปกรณ์คอมพิวเตอร์ มือ1-มือ2 ราคาดี',
  description: 'ร้านขายอุปกรณ์คอมพิวเตอร์ CPU GPU RAM SSD มือ1 และมือ2 ราคาดี คุ้มค่า จัดส่งทั่วไทย',
  keywords: 'คอมพิวเตอร์, CPU, GPU, RAM, SSD, มือสอง, อุปกรณ์คอมพิวเตอร์',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>
        <Navbar />
        <main style={{ minHeight: '80vh' }}>
          {children}
        </main>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#ffffff',
              color: '#1a1d23',
              border: '1px solid #e2e5e9',
              borderRadius: '10px',
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            },
            success: { iconTheme: { primary: '#16a34a', secondary: '#ffffff' } },
            error: { iconTheme: { primary: '#dc2626', secondary: '#ffffff' } },
          }}
        />
      </body>
    </html>
  );
}
