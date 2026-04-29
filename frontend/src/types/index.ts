export interface User {
    id: number;
    username: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    address: string | null;
    avatar: string | null;
    role: 'user' | 'admin';
    created_at: string;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    image: string | null;
    product_count: number;
}

export interface Product {
    id: number;
    category_id: number;
    name: string;
    slug: string;
    description: string | null;
    short_description: string | null;
    price: number;
    original_price: number | null;
    stock: number;
    condition_type: 'new' | 'used';
    condition_detail: 'like_new' | 'good' | 'fair' | 'poor' | null;
    brand: string | null;
    model: string | null;
    sku: string | null;
    warranty: string | null;
    sold_count: number;
    view_count: number;
    rating: number;
    review_count: number;
    is_featured: boolean;
    category_name: string;
    category_slug: string;
    primary_image: string | null;
    images?: ProductImage[];
    specs?: ProductSpec[];
    reviews?: Review[];
    related?: Product[];
}

export interface ProductImage {
    id: number;
    product_id: number;
    image_url: string;
    is_primary: boolean;
}

export interface ProductSpec {
    id: number;
    spec_key: string;
    spec_value: string;
    sort_order: number;
}

export interface CartItem {
    id: number;
    quantity: number;
    product_id: number;
    name: string;
    price: number;
    stock: number;
    condition_type: 'new' | 'used';
    image: string | null;
}

export interface Order {
    id: number;
    order_number: string;
    user_id: number;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
    subtotal: number;
    shipping_fee: number;
    discount_amount: number;
    total: number;
    payment_method: string;
    payment_status: string;
    payment_slip?: string | null;
    shipping_name: string;
    shipping_phone: string;
    shipping_address: string;
    shipping_province: string;
    shipping_district: string;
    shipping_subdistrict: string;
    shipping_zipcode: string;
    tracking_number: string | null;
    notes: string | null;
    created_at: string;
    items?: OrderItem[];
    item_count?: number;
}

export interface OrderItem {
    id: number;
    product_id: number;
    product_name: string;
    product_image: string | null;
    price: number;
    quantity: number;
    subtotal: number;
    condition_type: 'new' | 'used';
}

export interface Review {
    id: number;
    product_id: number;
    user_id: number;
    rating: number;
    title: string | null;
    comment: string | null;
    is_verified: boolean;
    username: string;
    avatar: string | null;
    created_at: string;
}

export interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ProductsResponse {
    success: boolean;
    data: Product[];
    pagination: Pagination;
}
