import Link from 'next/link';
import {
  Cpu, Zap, Shield, Truck, ArrowRight, Star, TrendingUp,
  ChevronRight, Package, Headphones, RotateCcw
} from 'lucide-react';
import api from '@/lib/api';
import { Product, Category } from '@/types';
import ProductCard from '@/components/products/ProductCard';
import styles from './page.module.css';

const CATEGORY_ICONS: Record<string, string> = {
  'cpu-processors': '🔲', 'motherboards': '🖥️', 'ram-memory': '⚡',
  'graphics-cards': '🎮', 'storage': '💾', 'power-supply': '⚡',
  'pc-cases': '📦', 'cooling': '❄️', 'monitors': '🖥️',
  'keyboards-mice': '⌨️', 'laptops': '💻', 'networking': '🌐',
};

export default async function HomePage() {
  let featuredProducts: Product[] = [];
  let newProducts: Product[] = [];
  let usedProducts: Product[] = [];
  let categories: Category[] = [];

  try {
    const [featRes, newRes, usedRes, catRes] = await Promise.all([
      api.get('/products?featured=true&limit=8'),
      api.get('/products?condition=new&limit=4&sort=created_at'),
      api.get('/products?condition=used&limit=4&sort=created_at'),
      api.get('/categories'),
    ]);
    featuredProducts = featRes.data.data || [];
    newProducts = newRes.data.data || [];
    usedProducts = usedRes.data.data || [];
    categories = catRes.data.data || [];
  } catch (err) {
    console.error('Failed to fetch homepage data:', err);
  }

  return (
    <div>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.heroOrb1} />
          <div className={styles.heroOrb2} />
          <div className={styles.heroGrid} />
        </div>
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroBadge}>
            <Zap size={12} />
            <span>อุปกรณ์คอมพิวเตอร์ครบวงจร มือ1-มือ2</span>
          </div>
          <h1 className={styles.heroTitle}>
            อัพเกรดพีซีของคุณ
            <br />
            <span className={styles.heroAccent}>ด้วยราคาที่ดีที่สุด</span>
          </h1>
          <p className={styles.heroDesc}>
            GPU, CPU, RAM, SSD และอุปกรณ์คอมพิวเตอร์ครบทุกชนิด
            <br />ทั้งมือ1 และมือ2 คุณภาพเยี่ยม ราคาคุ้มค่า จัดส่งทั่วไทย
          </p>
          <div className={styles.heroCtas}>
            <Link href="/products" className="btn-primary" style={{ fontSize: '15px', padding: '14px 28px' }}>
              ดูสินค้าทั้งหมด <ArrowRight size={16} />
            </Link>
            <Link href="/products?condition=used" className="btn-secondary" style={{ fontSize: '15px', padding: '14px 28px' }}>
              สินค้ามือสอง
            </Link>
          </div>
          <div className={styles.heroStats}>
            {[
              { num: '500+', label: 'สินค้า' },
              { num: '10,000+', label: 'ลูกค้า' },
              { num: '4.9', label: 'คะแนน', icon: <Star size={12} fill="#ca8a04" color="#ca8a04" /> },
            ].map((stat, i) => (
              <div key={i} className={styles.heroStat}>
                <div className={styles.heroStatNum}>
                  {stat.icon}{stat.num}
                </div>
                <div className={styles.heroStatLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '40px 0', background: '#ffffff', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {[
              { icon: Truck, title: 'ส่งฟรี', desc: 'เมื่อซื้อครบ ฿3,000', color: '#16a34a' },
              { icon: Shield, title: 'สินค้ารับประกัน', desc: 'ทุกชิ้น มีใบรับประกัน', color: '#4f46e5' },
              { icon: RotateCcw, title: 'คืนสินค้าได้', desc: 'ภายใน 7 วัน', color: '#ea580c' },
              { icon: Headphones, title: 'ซัปพอร์ต 24/7', desc: 'ทีมงานพร้อมช่วยเหลือ', color: '#2563eb' },
            ].map(({ icon: Icon, title, desc, color }, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '16px 20px', background: 'var(--bg-secondary)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius)',
              }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${color}12`, flexShrink: 0,
                }}>
                  <Icon size={20} color={color} />
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{title}</p>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
            <div>
              <h2 className="section-title">หมวดหมู่สินค้า</h2>
              <p className="section-subtitle">เลือกดูสินค้าตามประเภทที่คุณต้องการ</p>
            </div>
            <Link href="/products" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', color: 'var(--accent)' }}>
              ดูทั้งหมด <ChevronRight size={14} />
            </Link>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '12px',
          }}>
            {categories.slice(0, 12).map((cat) => (
              <Link key={cat.id} href={`/products?category=${cat.slug}`} className={styles.categoryCard}>
                <span className={styles.categoryEmoji}>
                  {CATEGORY_ICONS[cat.slug] || '🔧'}
                </span>
                <p className={styles.categoryName}>{cat.name}</p>
                <p className={styles.categoryCount}>{cat.product_count} ชิ้น</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <TrendingUp size={18} color="var(--accent)" />
                <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: '600' }}>FEATURED</span>
              </div>
              <h2 className="section-title">สินค้าแนะนำ</h2>
              <p className="section-subtitle">สินค้าคัดพิเศษ ราคาดี คุณภาพเยี่ยม</p>
            </div>
            <Link href="/products?featured=true" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', color: 'var(--accent)' }}>
              ดูทั้งหมด <ChevronRight size={14} />
            </Link>
          </div>
          <div className="product-grid">
            {featuredProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* New vs Used Split */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            {/* New */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <span className="badge badge-new" style={{ marginBottom: '6px' }}>มือ 1</span>
                  <h2 className="section-title" style={{ fontSize: '22px' }}>สินค้าใหม่</h2>
                </div>
                <Link href="/products?condition=new" style={{ fontSize: '13px', color: 'var(--accent)' }}>
                  ดูทั้งหมด →
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {newProducts.map((p) => <MiniProductCard key={p.id} product={p} />)}
              </div>
            </div>
            {/* Used */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <span className="badge badge-used" style={{ marginBottom: '6px' }}>มือ 2</span>
                  <h2 className="section-title" style={{ fontSize: '22px' }}>สินค้ามือสอง</h2>
                </div>
                <Link href="/products?condition=used" style={{ fontSize: '13px', color: 'var(--accent)' }}>
                  ดูทั้งหมด →
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {usedProducts.map((p) => <MiniProductCard key={p.id} product={p} />)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: '60px 0', background: 'linear-gradient(135deg, rgba(79,70,229,0.06), rgba(124,58,237,0.04), rgba(22,163,74,0.04))', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '32px', fontWeight: '700', marginBottom: '12px', color: 'var(--text-primary)' }}>
            พร้อมอัพเกรดหรือยัง? 🚀
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '15px' }}>
            พบกับอุปกรณ์คอมพิวเตอร์กว่า 500 รายการ ราคาพิเศษสำหรับคุณ
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/products" className="btn-primary" style={{ fontSize: '15px', padding: '14px 32px' }}>
              เริ่มช้อปเลย <ArrowRight size={16} />
            </Link>
            <Link href="/register" className="btn-secondary" style={{ fontSize: '15px', padding: '14px 32px' }}>
              สมัครสมาชิกฟรี
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function MiniProductCard({ product }: { product: Product }) {
  const imageUrl = getProductImage(product);
  return (
    <Link href={`/products/${product.slug}`} className={styles.miniCard}>
      <img src={imageUrl} alt={product.name} style={{
        width: '60px', height: '60px', objectFit: 'cover',
        borderRadius: '8px', flexShrink: 0, background: 'var(--bg-secondary)',
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {product.name}
        </p>
        <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{product.brand}</p>
        <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--accent)', fontFamily: 'Space Grotesk' }}>
          ฿{product.price.toLocaleString()}
        </p>
      </div>
      <ChevronRight size={16} color="var(--text-muted)" />
    </Link>
  );
}

// Helper function to map product names/slugs to real product images
function getProductImage(product: Product): string {
  if (product.primary_image && !product.primary_image.includes('picsum.photos')) {
    return product.primary_image;
  }

  const slug = product.slug?.toLowerCase() || '';
  const name = product.name?.toLowerCase() || '';

  if (slug.includes('rtx-4090') || name.includes('rtx 4090')) {
    return 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&h=600&fit=crop';
  }
  if (slug.includes('ryzen') || name.includes('ryzen')) {
    return 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=600&h=600&fit=crop';
  }
  if (slug.includes('i9-14900') || slug.includes('i9') || name.includes('core i9')) {
    return 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&h=600&fit=crop';
  }
  if (slug.includes('ddr5') || slug.includes('ram') || name.includes('ram') || name.includes('ddr')) {
    return 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&h=600&fit=crop';
  }
  if (slug.includes('ssd') || slug.includes('nvme') || slug.includes('samsung-990') || name.includes('ssd')) {
    return 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&h=600&fit=crop';
  }
  if (slug.includes('monitor') || slug.includes('ultragear') || name.includes('monitor') || name.includes('จอ')) {
    return 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&h=600&fit=crop';
  }
  if (slug.includes('rx-6800') || slug.includes('radeon') || name.includes('radeon')) {
    return 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&h=600&fit=crop';
  }
  if (slug.includes('i5-12600') || name.includes('i5')) {
    return 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=600&h=600&fit=crop';
  }
  if (slug.includes('zephyrus') || slug.includes('laptop') || name.includes('laptop') || name.includes('โน้ตบุ๊ก')) {
    return 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&h=600&fit=crop';
  }
  if (slug.includes('keychron') || slug.includes('keyboard') || name.includes('keyboard') || name.includes('คีย์บอร์ด')) {
    return 'https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?w=600&h=600&fit=crop';
  }
  if (slug.includes('psu') || slug.includes('rm1000') || slug.includes('power') || name.includes('psu') || name.includes('power')) {
    return 'https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=600&h=600&fit=crop';
  }
  if (slug.includes('motherboard') || slug.includes('b650') || name.includes('motherboard') || name.includes('เมนบอร์ด')) {
    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=600&fit=crop';
  }
  if (slug.includes('gpu') || slug.includes('graphics') || name.includes('การ์ดจอ')) {
    return 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&h=600&fit=crop';
  }

  // Generic fallback - computer components
  return 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=600&fit=crop';
}
