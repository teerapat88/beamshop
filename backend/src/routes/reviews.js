const express = require('express');
const pool = require('../config/db');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/reviews/product/:productId
router.get('/product/:productId', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const [reviews] = await pool.execute(
            `SELECT r.*, u.username, u.avatar FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ? AND r.is_active = TRUE
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
            [req.params.productId, parseInt(limit), offset]
        );

        const [stats] = await pool.execute(
            'SELECT AVG(rating) as avg_rating, COUNT(*) as total FROM reviews WHERE product_id = ? AND is_active = TRUE',
            [req.params.productId]
        );

        res.json({ success: true, data: reviews, stats: stats[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST /api/reviews
router.post('/', auth, async (req, res) => {
    try {
        const { product_id, order_id, rating, title, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
        }

        await pool.execute(
            'INSERT INTO reviews (product_id, user_id, order_id, rating, title, comment, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [product_id, req.user.id, order_id || null, rating, title || null, comment || null, !!order_id]
        );

        await pool.execute(
            'UPDATE products SET rating = (SELECT AVG(rating) FROM reviews WHERE product_id = ?), review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = ?) WHERE id = ?',
            [product_id, product_id, product_id]
        );

        res.status(201).json({ success: true, message: 'Review submitted successfully' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'You have already reviewed this product' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
