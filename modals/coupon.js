const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    couponCode: { type: String, required: true, unique: true }, // Unique coupon code
    discountAmount: { type: Number, required: true }, // Discount percentage
    expirationDate: { type: Date, required: true }, // Expiration date for the coupon
    minPurchaseAmount: { type: Number, required: true }, // Minimum purchase amount required to use the coupon
    createdAt: { type: Date, default: Date.now } // Automatically set the creation date
});
const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
