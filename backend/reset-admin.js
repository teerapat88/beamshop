const pool = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function resetAdmin() {
    try {
        const password = await bcrypt.hash('admin123', 10);
        await pool.execute(
            'UPDATE users SET password = ?, role = "admin" WHERE email = "admin@beamshop.com"',
            [password]
        );
        console.log('Admin password reset to: admin123');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

resetAdmin();
