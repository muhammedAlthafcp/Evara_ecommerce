// const mongoose = require('mongoose');

// const wishlistItemSchema = new mongoose.Schema({
//   product: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'products'  // Use the correct model name for your producta
//   },
// });

// const wishlistSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'users',  // Use the correct model name for your user
//     required: true
//   },
//   items: [wishlistItemSchema],
// });

// const Wishlist = mongoose.model('Wishlist', wishlistSchema);

// module.exports = Wishlist;

const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'products',  // Use the correct model name for your products
    required: true
  },
  quantity: {
    type: Number,
    default: 1  // Set a default quantity of 1 for each product
  }
});

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',  // Use the correct model name for your users
    required: true
  },
  items: [wishlistItemSchema],
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
