const pool = require('./src/config/db');

async function test() {
    try {
        console.log('Testing product insertion...');
        const name = 'Test Product ' + Date.now();
        const category_id = 1;
        const price = 1000;
        const slug = 'test-product-' + Date.now();

        const [result] = await pool.execute(
            `INSERT INTO products (category_id, name, slug, description, short_description, price, original_price,
       stock, condition_type, condition_detail, brand, model, sku, weight, warranty, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                category_id,
                name,
                slug,
                'Test description',
                null,
                price,
                null,
                10,
                'new',
                null,
                'Test Brand',
                null,
                null,
                null,
                null,
                false
            ]
        );

        console.log('SUCCESS! Product ID:', result.insertId);
        process.exit(0);
    } catch (err) {
        console.error('FAILED!');
        console.error('Error Code:', err.code);
        console.error('Error Message:', err.message);
        process.exit(1);
    }
}

test();
