const express = require('express');
const pool = require('../config/db');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/cart
router.get('/', auth, async (req, res) => {
    try {
        const [items] = await pool.execute(
            `SELECT c.id, c.quantity, p.id as product_id, p.name, p.price, p.stock,
              p.condition_type, pi.image_url as image
       FROM cart c
       JOIN products p ON c.product_id = p.id
       LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = TRUE
       WHERE c.user_id = ?`,
            [req.user.id]
        );
        res.json({ success: true, data: items });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST /api/cart
router.post('/', auth, async (req, res) => {
    try {
        const { product_id, quantity = 1 } = req.body;

        const [products] = await pool.execute('SELECT * FROM products WHERE id = ? AND is_active = TRUE', [product_id]);
        if (products.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        if (products[0].stock < quantity) {
            return res.status(400).json({ success: false, message: 'Insufficient stock' });
        }

        await pool.execute(
            `INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
            [req.user.id, product_id, quantity, quantity]
        );

        res.json({ success: true, message: 'Added to cart' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PUT /api/cart/:id
router.put('/:id', auth, async (req, res) => {
    try {
        const { quantity } = req.body;
        if (quantity <= 0) {
            await pool.execute('DELETE FROM cart WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        } else {
            await pool.execute('UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?', [quantity, req.params.id, req.user.id]);
        }
        res.json({ success: true, message: 'Cart updated' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// DELETE /api/cart/:id
router.delete('/:id', auth, async (req, res) => {
    try {
        await pool.execute('DELETE FROM cart WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ success: true, message: 'Item removed from cart' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
