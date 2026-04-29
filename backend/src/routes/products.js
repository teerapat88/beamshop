const express = require('express');
const pool = require('../config/db');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/products - List with filters
router.get('/', async (req, res, next) => {
    try {
        const {
            page = 1, limit = 12, category, condition, search,
            min_price, max_price, sort = 'created_at', order = 'DESC', featured
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        let whereConditions = ['p.is_active = TRUE'];
        let params = [];

        if (category) {
            whereConditions.push('c.slug = ?');
            params.push(category);
        }
        if (condition) {
            whereConditions.push('p.condition_type = ?');
            params.push(condition);
        }
        if (search) {
            whereConditions.push('(p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        if (min_price) {
            whereConditions.push('p.price >= ?');
            params.push(parseFloat(min_price));
        }
        if (max_price) {
            whereConditions.push('p.price <= ?');
            params.push(parseFloat(max_price));
        }
        if (featured === 'true') {
            whereConditions.push('p.is_featured = TRUE');
        }

        const whereClause = whereConditions.join(' AND ');
        const validSorts = ['price', 'created_at', 'sold_count', 'rating', 'name'];
        const validOrders = ['ASC', 'DESC'];
        const sortField = validSorts.includes(sort) ? `p.${sort}` : 'p.created_at';
        const sortOrder = validOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

        const [products] = await pool.execute(
            `SELECT p.*, c.name as category_name, c.slug as category_slug,
              pi.image_url as primary_image
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = TRUE
       WHERE ${whereClause}
       ORDER BY ${sortField} ${sortOrder}
       LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        const [countResult] = await pool.execute(
            `SELECT COUNT(*) as total
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE ${whereClause}`,
            params
        );

        const total = countResult[0].total;
        res.json({
            success: true,
            data: products,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        console.error('List Products Error:', err);
        next(err);
    }
});

// GET /api/products/:slug - Product detail
router.get('/:slug', async (req, res, next) => {
    try {
        const [products] = await pool.execute(
            `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ? AND p.is_active = TRUE`,
            [req.params.slug]
        );

        if (products.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const product = products[0];

        // Get images
        const [images] = await pool.execute(
            'SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC',
            [product.id]
        );

        // Get specs
        const [specs] = await pool.execute(
            'SELECT * FROM product_specs WHERE product_id = ? ORDER BY sort_order ASC',
            [product.id]
        );

        // Get reviews
        const [reviews] = await pool.execute(
            `SELECT r.*, u.username, u.avatar
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ? AND r.is_active = TRUE
       ORDER BY r.created_at DESC LIMIT 10`,
            [product.id]
        );

        // Increment view count
        await pool.execute('UPDATE products SET view_count = view_count + 1 WHERE id = ?', [product.id]);

        // Get related products
        const [related] = await pool.execute(
            `SELECT p.*, pi.image_url as primary_image
       FROM products p
       LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = TRUE
       WHERE p.category_id = ? AND p.id != ? AND p.is_active = TRUE
       LIMIT 4`,
            [product.category_id, product.id]
        );

        res.json({
            success: true,
            data: { ...product, images, specs, reviews, related }
        });
    } catch (err) {
        console.error('Fetch Product Error:', err);
        next(err);
    }
});

// POST /api/products - Admin create product
router.post('/', adminAuth, async (req, res, next) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        console.log('Incoming Product Data:', req.body);
        const {
            category_id, name, description, short_description, price, original_price,
            stock, condition_type, condition_detail, brand, model, sku, weight,
            warranty, is_featured, images, specs
        } = req.body;

        if (!name || !category_id || !price) {
            console.log('Validation Failed:', { name, category_id, price });
            return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (ชื่อ, หมวดหมู่, ราคา)' });
        }

        const slugify = require('slugify');
        // For Thai characters, slugify with strict:true might return empty. 
        // We'll fallback to a generic name or just timestamp if empty.
        let baseSlug = slugify(name, { lower: true, strict: true });
        if (!baseSlug) baseSlug = 'product';
        const slug = `${baseSlug}-${Date.now()}`;

        const [result] = await conn.execute(
            `INSERT INTO products (category_id, name, slug, description, short_description, price, original_price,
       stock, condition_type, condition_detail, brand, model, sku, weight, warranty, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                category_id,
                name,
                slug,
                description || null,
                short_description || null,
                price,
                original_price || null,
                stock || 0,
                condition_type || 'new',
                condition_detail || null,
                brand || null,
                model || null,
                sku || null,
                weight || null,
                warranty || null,
                is_featured || false
            ]
        );

        const productId = result.insertId;

        if (images && images.length > 0) {
            for (let i = 0; i < images.length; i++) {
                if (images[i].url) {
                    await conn.execute(
                        'INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?)',
                        [productId, images[i].url, i === 0, i]
                    );
                }
            }
        }

        if (specs && specs.length > 0) {
            for (let i = 0; i < specs.length; i++) {
                if (specs[i].key && specs[i].value) {
                    await conn.execute(
                        'INSERT INTO product_specs (product_id, spec_key, spec_value, sort_order) VALUES (?, ?, ?, ?)',
                        [productId, specs[i].key, specs[i].value, i]
                    );
                }
            }
        }

        await conn.commit();
        res.status(201).json({ success: true, message: 'Product created successfully', productId });
    } catch (err) {
        await conn.rollback();
        console.error('Create Product Error:', err);
        next(err);
    } finally {
        conn.release();
    }
});

// PUT /api/products/:id - Admin update product
router.put('/:id', adminAuth, async (req, res, next) => {
    try {
        const {
            category_id, name, description, short_description, price, original_price,
            stock, condition_type, condition_detail, brand, model, sku, weight, warranty, is_featured, is_active
        } = req.body;

        await pool.execute(
            `UPDATE products SET category_id=?, name=?, description=?, short_description=?, price=?,
       original_price=?, stock=?, condition_type=?, condition_detail=?, brand=?, model=?, sku=?,
       weight=?, warranty=?, is_featured=?, is_active=? WHERE id=?`,
            [
                category_id, name, description || null, short_description || null, price,
                original_price || null, stock || 0, condition_type, condition_detail || null,
                brand || null, model || null, sku || null, weight || null, warranty || null,
                is_featured || false, is_active !== undefined ? is_active : true, req.params.id
            ]
        );

        res.json({ success: true, message: 'Product updated successfully' });
    } catch (err) {
        console.error('Update Product Error:', err);
        next(err);
    }
});

// PATCH /api/products/:id/stock - Quick add stock
router.patch('/:id/stock', adminAuth, async (req, res, next) => {
    try {
        const { increment } = req.body;
        if (increment === undefined || isNaN(parseInt(increment))) {
            return res.status(400).json({ success: false, message: 'Invalid increment value' });
        }

        await pool.execute(
            'UPDATE products SET stock = stock + ? WHERE id = ?',
            [parseInt(increment), req.params.id]
        );

        res.json({ success: true, message: 'Stock updated successfully' });
    } catch (err) {
        console.error('Update Stock Error:', err);
        next(err);
    }
});

// DELETE /api/products/:id
router.delete('/:id', adminAuth, async (req, res, next) => {
    try {
        await pool.execute('UPDATE products SET is_active = FALSE WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (err) {
        console.error('Delete Product Error:', err);
        next(err);
    }
});

module.exports = router;
