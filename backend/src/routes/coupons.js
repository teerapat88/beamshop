const express = require('express');
const pool = require('../config/db');
const { auth } = require('../middleware/auth');

const router = express.Router();

// POST /api/coupons/validate
router.post('/validate', auth, async (req, res) => {
    try {
        const { code, subtotal } = req.body;
        if (!code) return res.status(400).json({ success: false, message: 'กรุณากรอกโค้ดส่วนลด' });

        const [coupons] = await pool.execute(
            'SELECT * FROM coupons WHERE code = ? AND is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW())',
            [code]
        );

        if (coupons.length === 0) {
            return res.status(404).json({ success: false, message: 'โค้ดส่วนลดไม่ถูกต้องหรือหมดอายุ' });
        }

        const coupon = coupons[0];

        if (subtotal < coupon.min_order_amount) {
            return res.status(400).json({
                success: false,
                message: `ยอดซื้อขั้นต่ำสำหรับโค้ดนี้คือ ฿${coupon.min_order_amount.toLocaleString()}`
            });
        }

        if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
            return res.status(400).json({ success: false, message: 'โค้ดนี้ถูกใช้งานครบจำนวนจำกัดแล้ว' });
        }

        res.json({
            success: true,
            data: {
                id: coupon.id,
                code: coupon.code,
                discount_type: coupon.discount_type,
                discount_value: coupon.discount_value,
                max_discount: coupon.max_discount
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
