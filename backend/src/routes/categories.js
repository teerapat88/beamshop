const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// GET /api/categories
router.get('/', async (req, res) => {
    try {
        const [categories] = await pool.execute(
            `SELECT c.*, COUNT(p.id) as product_count 
       FROM categories c 
       LEFT JOIN products p ON p.category_id = c.id AND p.is_active = TRUE
       WHERE c.is_active = TRUE 
       GROUP BY c.id 
       ORDER BY c.name`
        );
        res.json({ success: true, data: categories });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/categories/:slug
router.get('/:slug', async (req, res) => {
    try {
        const [categories] = await pool.execute(
            'SELECT * FROM categories WHERE slug = ? AND is_active = TRUE',
            [req.params.slug]
        );
        if (categories.length === 0) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.json({ success: true, data: categories[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
