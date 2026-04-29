async function testCheckout() {
    try {
        const baseUrl = 'http://localhost:5000/api';

        // 1. Login
        console.log('Logging in...');
        const loginRes = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@beamshop.com',
                password: 'admin123'
            })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;
        if (!token) throw new Error('Login failed: ' + JSON.stringify(loginData));
        console.log('Login successful');

        // 2. Checkout
        console.log('Attempting checkout...');
        const checkoutRes = await fetch(`${baseUrl}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                shipping_name: 'Test Admin',
                shipping_phone: '0812345678',
                shipping_address: '123 Test St',
                shipping_province: 'Bangkok',
                shipping_district: 'Bang Rak',
                shipping_zipcode: '10500',
                payment_method: 'cash_on_delivery',
                items: [{ product_id: 1, quantity: 1 }]
            })
        });
        const checkoutData = await checkoutRes.json();
        if (!checkoutData.success) throw new Error('Checkout failed: ' + JSON.stringify(checkoutData));
        console.log('Checkout Success:', checkoutData.orderNumber);

        // 3. Get Orders
        console.log('Fetching orders...');
        const ordersRes = await fetch(`${baseUrl}/orders/admin/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const ordersData = await ordersRes.json();
        const firstOrder = ordersData.data[0];
        console.log('Found order:', firstOrder.id);

        // 4. Confirm Status
        console.log(`Attempting to confirm status for order ID ${firstOrder.id}...`);
        const confirmRes = await fetch(`${baseUrl}/orders/admin/${firstOrder.id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'confirmed' })
        });
        const confirmData = await confirmRes.json();
        if (!confirmData.success) throw new Error('Confirm failed: ' + JSON.stringify(confirmData));
        console.log('Confirm Success:', confirmData.message);

    } catch (err) {
        console.error('FAILED!');
        console.error(err.message);
    }
}

testCheckout();
