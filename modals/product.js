const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    imagePath: [{ type: String, required: true }], // Array of image paths
    promotionalPrice: { type: Number, required: true }, // Ensure this field is required
    regularPrice: { type: Number, required: true }, // Ensure this field is required
    discount : { type: Number, required: true }, // 
    description: { type: String }, // Optional field
    category: { type: String, required: true } // Made required to match the form
    
});

const productData = mongoose.model('products', productSchema);

module.exports = productData;
