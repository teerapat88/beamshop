'use client';

import Link from 'next/link';
import { ShoppingCart, Star, Zap } from 'lucide-react';
import { Product } from '@/types';
import { useAuthStore, useCartStore } from '@/store';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import styles from './ProductCard.module.css';

interface Props {
    product: Product;
}

// Map product slugs/names to real product images
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

    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=600&fit=crop';
}

export default function ProductCard({ product }: Props) {
    const { user } = useAuthStore();
    const { addToCart } = useCartStore();
    const router = useRouter();

    const discountPercent = product.original_price
        ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
        : 0;

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            toast.error('กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้า');
            router.push('/login');
            return;
        }
        try {
            await addToCart(product.id, 1);
            toast.success('เพิ่มลงตะกร้าแล้ว!');
        } catch {
            toast.error('ไม่สามารถเพิ่มสินค้าได้');
        }
    };

    const imageUrl = getProductImage(product);

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                size={11}
                fill={i < Math.round(rating) ? '#ca8a04' : 'none'}
                color={i < Math.round(rating) ? '#ca8a04' : '#d0d5dd'}
            />
        ));
    };

    return (
        <Link href={`/products/${product.slug}`} className={styles.card}>
            {/* Image */}
            <div className={styles.imageWrap}>
                <img
                    src={imageUrl}
                    alt={product.name}
                    className={styles.image}
                    loading="lazy"
                />
                {/* Badges */}
                <div className={styles.badges}>
                    <span className={`badge ${product.condition_type === 'new' ? 'badge-new' : 'badge-used'}`}>
                        {product.condition_type === 'new' ? 'มือ 1' : 'มือ 2'}
                    </span>
                    {discountPercent > 0 && (
                        <span className={`badge ${styles.discountBadge}`}>-{discountPercent}%</span>
                    )}
                </div>
                {product.stock === 0 && (
                    <div className={styles.outOfStock}>หมด</div>
                )}
                {product.is_featured && (
                    <div className={styles.featuredBadge}>
                        <Zap size={10} /> แนะนำ
                    </div>
                )}
            </div>

            {/* Info */}
            <div className={styles.info}>
                {product.brand && (
                    <p className={styles.brand}>{product.brand}</p>
                )}
                <h3 className={styles.name}>{product.name}</h3>
                <p className={styles.category}>{product.category_name}</p>

                {/* Rating */}
                {product.review_count > 0 && (
                    <div className={styles.rating}>
                        <div style={{ display: 'flex', gap: '1px' }}>{renderStars(product.rating)}</div>
                        <span className={styles.ratingText}>({product.review_count})</span>
                    </div>
                )}

                {/* Price */}
                <div className={styles.priceRow}>
                    <div>
                        <p className={styles.price}>฿{product.price.toLocaleString()}</p>
                        {product.original_price && (
                            <p className={styles.originalPrice}>฿{product.original_price.toLocaleString()}</p>
                        )}
                    </div>
                    <button
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                        className={styles.addBtn}
                        aria-label="เพิ่มลงตะกร้า"
                    >
                        <ShoppingCart size={16} />
                    </button>
                </div>

                {product.sold_count > 0 && (
                    <p className={styles.sold}>ขายแล้ว {product.sold_count} ชิ้น</p>
                )}
            </div>
        </Link>
    );
}
