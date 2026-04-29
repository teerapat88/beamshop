'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
    ShoppingCart, User, Search, Menu, X, ChevronDown,
    LogOut, Package, Heart, Settings, Cpu, Zap
} from 'lucide-react';
import { useAuthStore, useCartStore } from '@/store';
import toast from 'react-hot-toast';
import styles from './Navbar.module.css';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [scrolled, setScrolled] = useState(false);
    const { user, logout } = useAuthStore();
    const { getTotalItems, fetchCart } = useCartStore();
    const router = useRouter();
    const pathname = usePathname();
    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user) fetchCart();
    }, [user]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    const handleLogout = () => {
        logout();
        toast.success('ออกจากระบบแล้ว');
        router.push('/');
    };

    const cartCount = getTotalItems();

    return (
        <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
            <div className={`container ${styles.inner}`}>
                {/* Logo */}
                <Link href="/" className={styles.logo}>
                    <div className={styles.logoIcon}>
                        <Cpu size={20} />
                    </div>
                    <span>Beam<span className={styles.logoAccent}>Shop</span></span>
                </Link>

                {/* Search */}
                <form onSubmit={handleSearch} className={styles.searchForm}>
                    <Search size={16} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="ค้นหาสินค้า... GPU, CPU, RAM, SSD"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                    <button type="submit" className={styles.searchBtn}>ค้นหา</button>
                </form>

                {/* Nav Links */}
                <nav className={styles.nav}>
                    <Link href="/products" className={styles.navLink}>
                        สินค้าทั้งหมด
                    </Link>
                    <Link href="/products?condition=new" className={styles.navLink}>
                        มือ 1
                    </Link>
                    <Link href="/products?condition=used" className={styles.navLink}>
                        มือ 2
                    </Link>
                </nav>

                {/* Actions */}
                <div className={styles.actions}>
                    {/* Cart */}
                    <Link href="/cart" className={styles.iconBtn}>
                        <ShoppingCart size={20} />
                        {cartCount > 0 && (
                            <span className={styles.badge}>{cartCount > 99 ? '99+' : cartCount}</span>
                        )}
                    </Link>

                    {/* User */}
                    {user ? (
                        <div className={styles.userMenu} ref={userMenuRef}>
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className={styles.userBtn}
                            >
                                <div className={styles.avatar}>
                                    {user.full_name?.[0] || user.username[0]}
                                </div>
                                <ChevronDown size={14} className={isUserMenuOpen ? styles.chevronUp : ''} />
                            </button>
                            {isUserMenuOpen && (
                                <div className={styles.dropdown}>
                                    <div className={styles.dropdownHeader}>
                                        <div className={styles.dropdownAvatar}>
                                            {user.full_name?.[0] || user.username[0]}
                                        </div>
                                        <div>
                                            <p className={styles.dropdownName}>{user.full_name || user.username}</p>
                                            <p className={styles.dropdownEmail}>{user.email}</p>
                                        </div>
                                    </div>
                                    <div className={styles.dropdownDivider} />
                                    <Link href="/profile" className={styles.dropdownItem} onClick={() => setIsUserMenuOpen(false)}>
                                        <User size={15} /> โปรไฟล์
                                    </Link>
                                    <Link href="/orders" className={styles.dropdownItem} onClick={() => setIsUserMenuOpen(false)}>
                                        <Package size={15} /> คำสั่งซื้อ
                                    </Link>
                                    {user.role === 'admin' && (
                                        <>
                                            <div className={styles.dropdownDivider} />
                                            <Link href="/admin" className={styles.dropdownItem} onClick={() => setIsUserMenuOpen(false)}>
                                                <Settings size={15} /> Admin Dashboard
                                            </Link>
                                        </>
                                    )}
                                    <div className={styles.dropdownDivider} />
                                    <button onClick={() => { handleLogout(); setIsUserMenuOpen(false); }} className={`${styles.dropdownItem} ${styles.dropdownLogout}`}>
                                        <LogOut size={15} /> ออกจากระบบ
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className={styles.authBtns}>
                            <Link href="/login" className="btn-ghost" style={{ padding: '8px 14px', fontSize: '13px' }}>
                                เข้าสู่ระบบ
                            </Link>
                            <Link href="/register" className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                                สมัครสมาชิก
                            </Link>
                        </div>
                    )}

                    {/* Mobile menu toggle */}
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`${styles.iconBtn} ${styles.menuToggle}`}>
                        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className={styles.mobileMenu}>
                    <form onSubmit={handleSearch} className={styles.mobileSearch}>
                        <input
                            type="text"
                            placeholder="ค้นหาสินค้า..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field"
                        />
                    </form>
                    <Link href="/products" className={styles.mobileLink}>สินค้าทั้งหมด</Link>
                    <Link href="/products?condition=new" className={styles.mobileLink}>สินค้ามือ 1</Link>
                    <Link href="/products?condition=used" className={styles.mobileLink}>สินค้ามือ 2</Link>
                    <Link href="/cart" className={styles.mobileLink}>🛒 ตะกร้า ({cartCount})</Link>
                    {!user && (
                        <>
                            <Link href="/login" className={styles.mobileLink}>เข้าสู่ระบบ</Link>
                            <Link href="/register" className={styles.mobileLink}>สมัครสมาชิก</Link>
                        </>
                    )}
                </div>
            )}
        </header>
    );
}
