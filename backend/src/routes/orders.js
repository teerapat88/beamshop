const express = require('express');
const pool = require('../config/db');
const { auth, adminAuth } = require('../middleware/auth');
const generatePayload = require('promptpay-qr');
const qrcode = require('qrcode');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const router = express.Router();

// Multer config for slip upload
const slipDir = 'uploads/slips';
if (!fs.existsSync(slipDir)) {
    fs.mkdirSync(slipDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, slipDir);
    },
    filename: (req, file, cb) => {
        cb(null, `slip-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mime = allowedTypes.test(file.mimetype);
        if (ext && mime) return cb(null, true);
        cb(new Error('Only JPEG, JPG, and PNG are allowed'));
    }
});

function generateOrderNumber() {
    const now = new Date();
    const ts = now.getFullYear().toString().slice(2) +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0') +
        String(now.getHours()).padStart(2, '0') +
        String(now.getMinutes()).padStart(2, '0');
    const rand = crypto.randomBytes(2).toString('hex').toUpperCase();
    return `BS${ts}${rand}`;
}

// GET /api/orders - User orders
router.get('/', auth, async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        let where = 'WHERE o.user_id = ?';
        const params = [req.user.id];

        if (status) {
            where += ' AND o.status = ?';
            params.push(status);
        }

        const [orders] = await pool.execute(
            `SELECT o.*, COUNT(oi.id) as item_count
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       ${where} GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        const [countResult] = await pool.execute(
            `SELECT COUNT(*) as total FROM orders o ${where}`, params
        );

        res.json({
            success: true,
            data: orders,
            pagination: {
                total: countResult[0].total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(countResult[0].total / parseInt(limit))
            }
        });
    } catch (err) {
        console.error('Fetch Orders Error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/orders/:orderNumber
router.get('/:orderNumber', auth, async (req, res) => {
    try {
        const [orders] = await pool.execute(
            'SELECT * FROM orders WHERE order_number = ? AND user_id = ?',
            [req.params.orderNumber, req.user.id]
        );

        if (orders.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const order = orders[0];
        const [items] = await pool.execute(
            'SELECT * FROM order_items WHERE order_id = ?',
            [order.id]
        );

        res.json({ success: true, data: { ...order, items } });
    } catch (err) {
        console.error('Fetch Order Details Error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/orders/:orderNumber/payment
router.get('/:orderNumber/payment', auth, async (req, res) => {
    try {
        const [orders] = await pool.execute(
            'SELECT total, status, payment_method FROM orders WHERE order_number = ? AND user_id = ?',
            [req.params.orderNumber, req.user.id]
        );

        if (orders.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const order = orders[0];

        // Generate PromptPay Payload
        const promptpayId = process.env.PROMPTPAY_ID;
        if (!promptpayId) {
            throw new Error('PROMPTPAY_ID is not configured in the environment variables');
        }
        const amount = parseFloat(order.total);
        const payload = generatePayload(promptpayId, { amount });

        // Convert payload to QR Code Data URL
        const qrCodeUrl = await qrcode.toDataURL(payload);

        res.json({
            success: true,
            data: {
                payment_method: 'promptpay',
                amount,
                promptpay_id: promptpayId,
                qr_code: qrCodeUrl,
                payload: payload
            }
        });
    } catch (err) {
        console.error('Payment Generation Error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST /api/orders/:orderNumber/slip
router.post('/:orderNumber/slip', auth, upload.single('slip'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a slip' });
        }

        const slipUrl = `/uploads/slips/${req.file.filename}`;

        const [result] = await pool.execute(
            'UPDATE orders SET payment_slip = ?, payment_status = "paid", status = "confirmed", confirmed_at = NOW() WHERE order_number = ? AND user_id = ?',
            [slipUrl, req.params.orderNumber, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({
            success: true,
            message: 'Slip uploaded successfully. Payment is being verified.',
            slip_url: slipUrl
        });
    } catch (err) {
        console.error('Slip Upload Error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


// POST /api/orders - Create order
router.post('/', auth, async (req, res) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const {
            shipping_name, shipping_phone, shipping_address,
            shipping_province, shipping_district, shipping_subdistrict, shipping_zipcode,
            payment_method, notes, coupon_code, items
        } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'No items in order' });
        }

        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const [products] = await conn.execute(
                'SELECT * FROM products WHERE id = ? AND is_active = TRUE FOR UPDATE',
                [item.product_id]
            );

            if (products.length === 0) {
                await conn.rollback();
                return res.status(400).json({ success: false, message: `Product ${item.product_id} not found` });
            }

            const product = products[0];
            if (product.stock < item.quantity) {
                await conn.rollback();
                return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
            }

            const [primaryImg] = await conn.execute(
                'SELECT image_url FROM product_images WHERE product_id = ? AND is_primary = TRUE LIMIT 1',
                [product.id]
            );

            const itemSubtotal = parseFloat(product.price) * item.quantity;
            subtotal += itemSubtotal;

            orderItems.push({
                product_id: product.id,
                product_name: product.name,
                product_image: primaryImg.length > 0 ? primaryImg[0].image_url : null,
                price: product.price,
                quantity: item.quantity,
                subtotal: itemSubtotal,
                condition_type: product.condition_type,
            });
        }

        // Coupon
        let discountAmount = 0;
        let isFreeShipping = false;
        if (coupon_code) {
            const [coupons] = await conn.execute(
                'SELECT * FROM coupons WHERE code = ? AND is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW()) FOR UPDATE',
                [coupon_code]
            );
            if (coupons.length > 0) {
                const coupon = coupons[0];
                if (subtotal >= coupon.min_order_amount && (!coupon.usage_limit || coupon.used_count < coupon.usage_limit)) {
                    if (coupon.discount_type === 'percentage') {
                        discountAmount = (subtotal * coupon.discount_value) / 100;
                        if (coupon.max_discount) discountAmount = Math.min(discountAmount, coupon.max_discount);
                    } else if (coupon.discount_type === 'fixed') {
                        discountAmount = coupon.discount_value;
                    } else if (coupon.discount_type === 'free_shipping') {
                        isFreeShipping = true;
                    }
                    await conn.execute('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?', [coupon.id]);
                }
            }
        }

        const baseShippingFee = subtotal >= 3000 ? 0 : 80;
        const shippingFee = isFreeShipping ? 0 : baseShippingFee;
        const total = subtotal + shippingFee - discountAmount;
        const orderNumber = generateOrderNumber();

        const [orderResult] = await conn.execute(
            `INSERT INTO orders (order_number, user_id, status, subtotal, shipping_fee, discount_amount, total,
       payment_method, shipping_name, shipping_phone, shipping_address,
       shipping_province, shipping_district, shipping_subdistrict, shipping_zipcode, notes)
       VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                orderNumber, req.user.id, subtotal, shippingFee, discountAmount, total,
                payment_method, shipping_name, shipping_phone, shipping_address,
                shipping_province || null, shipping_district || null, shipping_subdistrict || null,
                shipping_zipcode || null, notes || null
            ]
        );

        const orderId = orderResult.insertId;

        for (const item of orderItems) {
            await conn.execute(
                'INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity, subtotal, condition_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [orderId, item.product_id, item.product_name, item.product_image, item.price, item.quantity, item.subtotal, item.condition_type]
            );
            await conn.execute(
                'UPDATE products SET stock = stock - ?, sold_count = sold_count + ? WHERE id = ?',
                [item.quantity, item.quantity, item.product_id]
            );
        }

        // Clear cart
        await conn.execute('DELETE FROM cart WHERE user_id = ?', [req.user.id]);

        await conn.commit();
        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            orderNumber,
            total
        });
    } catch (err) {
        await conn.rollback();
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    } finally {
        conn.release();
    }
});

// ===================== ADMIN ROUTES =====================

// GET /api/orders/admin/all
router.get('/admin/all', adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 20, status, search } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        let where = 'WHERE 1=1';
        const params = [];

        if (status) { where += ' AND o.status = ?'; params.push(status); }
        if (search) {
            where += ' AND (o.order_number LIKE ? OR u.username LIKE ? OR u.email LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const [orders] = await pool.execute(
            `SELECT o.*, u.username, u.email, u.full_name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ${where}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        const [countResult] = await pool.execute(
            `SELECT COUNT(*) as total FROM orders o JOIN users u ON o.user_id = u.id ${where}`, params
        );

        res.json({
            success: true,
            data: orders,
            pagination: {
                total: countResult[0].total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(countResult[0].total / parseInt(limit))
            }
        });
    } catch (err) {
        console.error('Admin Fetch Orders Error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/orders/admin/:orderNumber
router.get('/admin/details/:orderNumber', adminAuth, async (req, res) => {
    try {
        const [orders] = await pool.execute(
            `SELECT o.*, u.username, u.email, u.full_name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.order_number = ?`,
            [req.params.orderNumber]
        );

        if (orders.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const order = orders[0];
        const [items] = await pool.execute(
            'SELECT * FROM order_items WHERE order_id = ?',
            [order.id]
        );

        res.json({ success: true, data: { ...order, items } });
    } catch (err) {
        console.error('Admin Order Details Error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PUT /api/orders/admin/:id/status
router.put('/admin/:id/status', adminAuth, async (req, res) => {
    try {
        const { status, tracking_number } = req.body;
        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        let timestampField = '';
        if (status === 'confirmed') timestampField = ', confirmed_at = NOW()';
        else if (status === 'shipped') timestampField = ', shipped_at = NOW()';
        else if (status === 'delivered') timestampField = ', delivered_at = NOW()';
        else if (status === 'cancelled') timestampField = ', cancelled_at = NOW()';

        await pool.execute(
            `UPDATE orders SET status = ?${timestampField}${tracking_number ? ', tracking_number = ?' : ''} WHERE id = ?`,
            tracking_number ? [status, tracking_number, req.params.id] : [status, req.params.id]
        );

        res.json({ success: true, message: 'Order status updated' });
    } catch (err) {
        console.error('Update Order Status Error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/orders/admin/stats
router.get('/admin/stats', adminAuth, async (req, res) => {
    try {
        const [totalOrders] = await pool.execute('SELECT COUNT(*) as count, SUM(total) as revenue FROM orders WHERE status != "cancelled"');
        const [pendingOrders] = await pool.execute('SELECT COUNT(*) as count FROM orders WHERE status = "pending"');
        const [todayOrders] = await pool.execute('SELECT COUNT(*) as count, SUM(total) as revenue FROM orders WHERE DATE(created_at) = CURDATE() AND status != "cancelled"');
        const [totalUsers] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role = "user"');
        const [totalProducts] = await pool.execute('SELECT COUNT(*) as count FROM products WHERE is_active = TRUE');

        res.json({
            success: true,
            data: {
                totalOrders: totalOrders[0].count,
                totalRevenue: totalOrders[0].revenue || 0,
                pendingOrders: pendingOrders[0].count,
                todayOrders: todayOrders[0].count,
                todayRevenue: todayOrders[0].revenue || 0,
                totalUsers: totalUsers[0].count,
                totalProducts: totalProducts[0].count
            }
        });
    } catch (err) {
        console.error('Fetch Admin Stats Error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
