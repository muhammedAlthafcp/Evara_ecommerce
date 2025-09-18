const mongoose = require('mongoose');

// Define the Cart Item Schema
const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'products',  // Ensure this matches the model name for your products
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  }
});

// Define the Cart Schema
const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',  // Ensure this matches the model name for your users
    required: true
  },
  items: [cartItemSchema],
  totalPrice: {
    type: Number,
    required: true,
    default: 0
  }
});

// Create the Cart model
const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;

