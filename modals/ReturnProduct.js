const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const returnProductSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', // Ensure this matches the model name for User
        required: true,
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products', // Ensure this matches the model name for Product
        required: true,
    },
    returnDate: {
        type: Date,
        default: Date.now,
    },
    returnStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'], // Customize statuses if needed
        default: 'pending',
    },
    returnReason: {
        type: String,
        required: true,
    }
});



const ReturnProduct = mongoose.model('ReturnProduct', returnProductSchema);

module.exports = ReturnProduct;
