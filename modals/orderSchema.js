const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    country: { type: String, required: true },
    billingAddress: { type: String, required: true },
    billingAddress2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    orderDate: { type: Date, required: true },
    zipcode: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], // Reference to products
    productStatuses: [{ // New field for tracking product statuses
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Shipped', 'Delivered', 'Cancelled'] }
    }],
    paymentMethod: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
