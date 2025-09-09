const mongoose = require('mongoose')
const Product = require('../modals/product');
const user = require('../modals/users')
const order = require('../modals/orderSchema')
const Wishlist = require('../modals/wishlistschema')
const Cart = require('../modals/cartschema')

module.exports = {

    insertdata: async (data) => {
        // Calculate the discounted promotional price
        const discountedPrice = data.promotionalPrice - (data.promotionalPrice * data.discount / 100);
        
        // Update the regularPrice field in the data with an integer value
        data.regularPrice = Math.round(discountedPrice);
        
        // Insert the product into the database
        const result = await Product.create(data);
        
        return result;
    },
    
findProduct: async () => {
    const result = await Product.find().limit(8)
    return result;
},

    shopProduct: async () => {
    const result = await Product.find()

    return result;
},

orderDatas:async()=>{
    const result = await order.find().lean()
    return result
},
findwishlistCount: async (userID) => {
    try {
      console.log("User ID:", userID);

      // Find all wishlists for the specified user
      const wishlists = await Wishlist.find({ user: userID });

      if (!wishlists || wishlists.length === 0) {
        console.log("No wishlists found for user:", userID);
        return 0;
      }

      // Use a Set to track unique product IDs
      const uniqueProducts = new Set();

      // Add each product ID to the Set
      wishlists.forEach(wishlist => {
        wishlist.items.forEach(item => {
          uniqueProducts.add(item.product.toString()); // Ensure IDs are strings
        });
      });

      // The number of unique products is the size of the Set
      const uniqueProductCount = uniqueProducts.size;

      console.log("Total unique products in wishlist:", uniqueProductCount);
      return uniqueProductCount;
    } catch (error) {
      console.error('Error finding unique product count in wishlist:', error);
      throw error;
    }
  },

// Helper function to find cart count
// findCartCount: async (userId) => {
//     try {
//       console.log("User ID:", userId);

//       // Find all carts for the specified user
//       const carts = await Cart.find({ user: userId });

//       if (!carts || carts.length === 0) {
//         console.log("No carts found for user:", userId);
//         return 0;
//       }

//       // Use a Set to track unique product IDs
//       const uniqueProducts = new Set();

//       // Add each product ID to the Set
//       carts.forEach(cart => {
//         cart.items.forEach(item => {
//           uniqueProducts.add(item.product.toString()); // Ensure IDs are strings
//         });
//       });

//       // The number of unique products is the size of the Set
//       const uniqueProductCount = uniqueProducts.size;

//       console.log("Total unique products in cart:", uniqueProductCount);
//       return uniqueProductCount;
//     } catch (error) {
//       console.error('Error finding unique product count in cart:', error);
//       throw error;
//     }
//   },

findCartCount: async (userId) => {
    try {
        if (!userId) {
            throw new Error("Invalid or missing userId");
        }

        console.log("Fetching carts for user ID:", userId);

        // Find the cart for the user
        const cart = await Cart.findOne({ user: userId });

        if (!cart || !cart.items || cart.items.length === 0) {
            console.log("No items found in cart for user:", userId);
            return 0;
        }

        // Use a Set to track unique product IDs
        const uniqueProducts = new Set();

        // Add each product ID to the Set
        cart.items.forEach(item => {
            console.log("Processing product ID:", item.product);
            uniqueProducts.add(item.product.toString()); // Ensure IDs are strings
        });

        // The number of unique products is the size of the Set
        const uniqueProductCount = uniqueProducts.size;

        console.log("Total unique products in cart:", uniqueProductCount);
        return uniqueProductCount;
    } catch (error) {
        console.error('Error finding unique product count in cart:', error);
        throw error;
    }
},

findProductDatas : async (data) => {
    const result = await Product.findOne({_id: data}).lean(8);
    return result;
},
editproduct: async (productData, proid) => {
    const result = await Product.updateOne({ _id: proid }, {
        $set:
        {
            name: productData.name,
            imagePath: productData.imagePath,
            description: productData.description,
            promotionalPrice: productData. promotionalPrice,
            regularPrice: productData. regularPrice,
            category: productData.category,
            qty: productData.qty,
        }
    });
},
deleteproduct: async (data) => {
    await Product.deleteOne({ _id: data });
},
searchdata: async (searchQuery) => {
    try {
        const regex = new RegExp(searchQuery, 'i');
        const results = await Product.find({ category: regex }).sort({ updatedAt: -1 }).limit(20);
        console.log("Search Results:", results);
        return results;
    } catch (error) {
        console.error("Error during product search:", error);
        throw error;
    }
},

//   
//       

    shopProducts: async (productIds) => {
        try {
            const objectIds = productIds.map(item => new mongoose.Types.ObjectId(item.id));
            const products = await Product.find({ _id: { $in: objectIds } });
            return products;
        } catch (err) {
            console.error(err);
        }
    },
 
    category: async (searchTerm) => {
        try {
            const regex = new RegExp(`^${searchTerm}`, 'i'); // Create a case-insensitive regex for the start of the string
            const products = await Product.find({ category: { $regex: regex } }) // Search by category
                .sort({ updatedAt: -1, createdAt: -1 }) // Sort by updatedAt and createdAt in descending order
                .limit(20);
     
            return products.map(product => ({
                id: product._id,
                name: product.name,
                imagePath: product.imagePath,
                promotionalPrice: product.promotionalPrice,
                regularPrice: product.regularPrice,
                qty: product.qty,
                description: product.description,
                category: product.category
            }));
        } catch (err) {
            console.error(err);
        }
    },
    filterByPrice: async (minPrice, maxPrice) => { 
        try {
            const products = await Product.find({
                regularPrice: {
                    $gte: minPrice,
                    $lte: maxPrice
                }
            });
            return products;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },
 // Updated function to get product by ID and return both product data and totalPrice
 getproductbyid:async (productId) => {
    try {
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        // Assuming `regularPrice` is a field in your product schema
        const totalPrice = product.regularPrice; // Adjust if necessary

        // Return both product data and totalPrice
        return {
            productData: product,
            totalPrice: totalPrice
        };
    } catch (err) {
        console.error(err);
        // Handle errors as needed, e.g., throw, return a default value, etc.
        throw err;
    }
},

}