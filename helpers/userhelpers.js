// helpers/userhelpers.js
const User = require('../modals/users');
const Wishlist = require('../modals/wishlistschema');
const Product = require('../modals/product'); // Correct path to product model
const Cart = require('../modals/cartschema');
const Order = require('../modals/orderSchema');
const Coupon = require('../modals/coupon')
const ReturnProduct = require('../modals/ReturnProduct')
const Razorpay = require('razorpay')
var instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
module.exports = {
    insertuser: async (data) => {
        const result = await User.create(data);
        return result;
    },
    updatePassword: async (email, newPassword) => {
        return await User.findOneAndUpdate(
            { email: email },  // Find the user by their email
            { password: newPassword },  // Update the password field
            { new: true }  // Return the updated document
        );
    },

    findOllusers: async () => {
        const result = await User.find();
        return result;
    },
    findexistuser: async (email) => {
        const result = await User.findOne({ email }).lean();
        return result;
    },
    findUsertDatas: async (userid) => {
        const result = await User.findOne({ _id: userid }).lean();
        return result;
    },
    edituserdata: async (userupdate, userid) => {
        const result = await User.updateOne({ _id: userid }, {
            $set: {
                name: userupdate.name,
                phonenumber: userupdate.phonenumber
            }
        });
        return result;
    },
    deleteuser: async (data) => {
        await User.deleteOne({ _id: data });
    },
    // pushWishlist: async (userid) => {
    //     const result = await User.findOne({ _id: userid }).lean();
    //     return result;
    // },

    wishlistdata: async (userdata, productid) => {
        try {
            let wishlist = await Wishlist.findOne({ user: userdata });

            if (!wishlist) {
                // Create a new wishlist if one doesn't exist
                wishlist = new Wishlist({ user: userdata, items: [] });
            }

            // Check if the product is already in the wishlist
            const existingProduct = wishlist.items.find(item => item.product.toString() === productid);

            if (existingProduct) {
                // If the product exists, increment its quantity
                existingProduct.quantity += 1;
            } else {
                // If the product doesn't exist, add it with a quantity of 1
                wishlist.items.push({ product: productid, quantity: 1 });
            }

            const result = await wishlist.save();
            return result;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },


    findWishlist: async (userid) => {
        try {
            const result = await Wishlist.find({ user: userid }).lean();
            return result;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    wishlist: async (userid) => {
        try {
            const wishlistResult = await Wishlist.findOne({ user: userid }).lean();
            if (!wishlistResult || !wishlistResult.items || wishlistResult.items.length === 0) {
                console.log('No wishlist found or no items in the wishlist');
                return [];
            }

            // Get the product IDs and quantities from the wishlist
            const productDetails = wishlistResult.items.map(item => {
                return {
                    productId: item.product,
                    quantity: item.quantity
                };
            });

            const productIds = productDetails.map(detail => detail.productId);
            const products = await Product.find({ _id: { $in: productIds } }).lean();

            // Attach the quantity to the corresponding product
            const productsWithQuantities = products.map(product => {
                const detail = productDetails.find(detail => detail.productId.toString() === product._id.toString());
                return {
                    ...product,
                    quantity: detail ? detail.quantity : 1 // Default to 1 if quantity is not found
                };
            });

            return productsWithQuantities;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },



    removeItemFromWishlist: async (userid, productid) => {
        try {
            // Find the wishlist and populate the product field
            const wishlist = await Wishlist.findOne({ user: userid }).populate('items.product');
            if (!wishlist) {
                return null;
            }

            // Find the index of the item to be removed
            const itemIndex = wishlist.items.findIndex(item => item.product && item.product._id.toString() === productid);
            if (itemIndex === -1) {
                return null;
            }

            // Remove the item from the wishlist
            wishlist.items.splice(itemIndex, 1);

            // Save the updated wishlist
            await wishlist.save();
            return wishlist;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },


    cartdata: async (userid, productid) => {
        try {
            console.log(productid);

            const productToAdd = await Product.findById(productid);

            if (!productToAdd) {
                throw new Error('Product not found');
            }

            let cart = await Cart.findOne({ user: userid });

            if (!cart) {
                cart = new Cart({
                    user: userid,
                    items: [{ product: productid, quantity: 1 }],
                    totalPrice: productToAdd.price || 0
                });
            } else {
                const itemIndex = cart.items.findIndex(item => item.product.toString() === productid);
                if (itemIndex > -1) {
                    cart.items[itemIndex].quantity += 1;
                } else {
                    cart.items.push({ product: productid, quantity: 1 });
                }

                const productIds = cart.items.map(item => item.product);
                const cartProducts = await Product.find({ _id: { $in: productIds } });

                cart.totalPrice = cart.items.reduce((acc, item) => {
                    const itemProduct = cartProducts.find(product => product._id.toString() === item.product.toString());
                    return acc + (item.quantity * (itemProduct?.price || 0));
                }, 0);
            }

            if (isNaN(cart.totalPrice) || cart.totalPrice < 0) {
                cart.totalPrice = 0;
            }

            await cart.save();
            return cart;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    finddata: async (userid) => {
        try {
            const cart = await Cart.findOne({ user: userid }).populate('items.product').exec();
            console.log(cart);
            if (!cart) {
                return null;
            }
    
            // Check if cart.items exists and is an array
            if (!Array.isArray(cart.items)) {
                return null;
            }
    
            const cartItems = cart.items.map(item => {
                // Ensure item.product is not null
                if (!item.product) {
                    console.warn(`Product for item ${item._id} is null`);
                    return null;
                }
                
                return {
                    _id: item.product._id,
                    name: item.product.name,
                    imagePath: item.product.imagePath,
                    promotionalPrice: item.product.promotionalPrice,
                    regularPrice: item.product.regularPrice,
                    discount: item.product.discount,
                    description: item.product.description,
                    category: item.product.category,
                    quantity: item.quantity,
                    Subtotal: item.quantity * item.product.regularPrice
                };
            }).filter(item => item !== null); // Filter out null items
    
            const totalPrice = cartItems.reduce((total, item) => total + item.Subtotal, 0);
    
            return {
                user: cart.user,
                items: cartItems,
                totalPrice: totalPrice
            };
        } catch (error) {
            console.error(error);
            throw error;
        }
    },
    
    getOrderByUserId : async (userId) => {
        try {
            const sameUserOrder = await Order.findOne({ userId: userId });
            console.log(sameUserOrder, "Fetched Order");
            return sameUserOrder;
        } catch (error) {
            console.error("Error fetching order:", error);
            return null; // Return null or handle error as needed
        }
    },
    removeItemFromCart: async (userid, productid) => {
        try {
            // Find the cart and populate the product field
            const cart = await Cart.findOne({ user: userid }).populate('items.product');
            if (!cart) {
                return null;
            }

            // Find the index of the item to be removed
            const itemIndex = cart.items.findIndex(item => item.product && item.product._id.toString() === productid);
            if (itemIndex === -1) {
                return null;
            }

            // Remove the item from the cart
            cart.items.splice(itemIndex, 1);

            // Recalculate the total price
            cart.totalPrice = cart.items.reduce((acc, item) => {
                if (item.product) {
                    return acc + item.quantity * item.product.regularPrice; // Use regularPrice or promotionalPrice as needed
                }
                return acc;
            }, 0);

            // Save the updated cart
            await cart.save();
            return cart;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },
    removeData: async (userid) => {
        try {
            const cart = await Cart.findOne({ user: userid }).populate('items.product').exec();
            console.log(cart);
            if (!cart) {
                return null;
            }

            const cartItems = cart.items.map(item => ({
                // product: item.product,
                _id: item.product._id,
                name: item.product.name,
                imagePath: item.product.imagePath,
                promotionalPrice: item.product.promotionalPrice,
                regularPrice: item.product.regularPrice,
                discount: item.product.discount,
                description: item.product.description,
                category: item.product.category,
                quantity: item.quantity,
                Subtotal: item.quantity * (item.product.regularPrice)

            }));

            return {
                user: cart.user,
                items: cartItems,
                totalPrice: cart.totalPrice
            };
        } catch (error) {
            console.error(error);
            throw error;
        }
    },
    orderDatas: async (userid, orderData) => {
        try {
            // Combine userId with orderData
            const order = {
                userId: userid,
                ...orderData
            };

            // Save the order to the database
            const result = await Order.create(order);


            return result;
        } catch (error) {
            // Log the error and re-throw it for handling at a higher level
            console.error('Error saving order data:', error);
            throw error;
        }
    },
    blockUser: async (userid) => {
        try {

            const result = await User.findByIdAndUpdate(userid, { isBlocked: true }, { new: true });
            if (!result) {
                throw new Error('User not found');
            }
            return result;
        } catch (error) {
            console.error('Error blocking user:', error);
            throw error;
        }
    },

    unblockUser: async (userid) => {
        try {

            const result = await User.findByIdAndUpdate(userid, { isBlocked: false }, { new: true });
            if (!result) {
                throw new Error('User not found');
            }
            return result;
        } catch (error) {
            console.error('Error unblocking user:', error);
            throw error;
        }
    },
    // updateQuantity: async (userid, productid, quantityChange) => {
    //     try {
    //         let cart = await Cart.findOne({ user: userid });
    //         if (!cart) throw new Error('Cart not found');

    //         const itemIndex = cart.items.findIndex(item => item.product.toString() === productid);

    //         if (itemIndex > -1) {
    //             // Update the quantity
    //             cart.items[itemIndex].quantity += quantityChange;

    //             // If the quantity is zero or less, remove the item
    //             if (cart.items[itemIndex].quantity <= 0) {
    //                 cart.items.splice(itemIndex, 1);
    //             }
    //         }

    //         // Calculate the new total price
    //         const productIds = cart.items.map(item => item.product);
    //         const cartProducts = await Product.find({ _id: { $in: productIds } });

    //         cart.totalPrice = cart.items.reduce((acc, item) => {
    //             const itemProduct = cartProducts.find(product => product._id.toString() === item.product.toString());
    //             return acc + (item.quantity * (itemProduct?.regularPrice || 0));
    //         }, 0);

    //         await cart.save();
    //         return cart;
    //     } catch (error) {
    //         console.error(error);
    //         throw error;
    //     }
    // },


    // Example of updateQuantity function
    // updateQuantity: async (userId, productId, change) => {
    //     try {
    //         console.log(`Received updateQuantity request for userId: ${userId}, productId: ${productId}, change: ${change}`);

    //         // Find the user's cart
    //         let cart = await Cart.findOne({ user: userId })
    //             .populate({
    //                 path: 'items.product',  // Populate the product field inside items
    //                 model: 'Product',       // Ensure this matches your Product model name
    //                 select: 'name promotionalPrice regularPrice imagePath'
    //             })
    //             .lean();

    //         if (!cart) {
    //             console.log('Cart not found for user:', userId);
    //             return { result: false, message: 'Cart not found' };
    //         }

    //         console.log('Cart found:', cart);

    //         // Find the cart item
    //         let cartItem = cart.items.find(item => item.product._id.toString() === productId);
    //         if (!cartItem) {
    //             console.log('Product not found in cart for productId:', productId);
    //             return { result: false, message: 'Product not found in cart' };
    //         }

    //         console.log('Cart item found:', cartItem);

    //         // Update the quantity
    //         cartItem.quantity += change;

    //         // Ensure quantity doesn't go below 1
    //         if (cartItem.quantity < 1) {
    //             cartItem.quantity = 1;
    //         }

    //         console.log('Updated quantity:', cartItem.quantity);

    //         // Calculate the new subtotal
    //         const product = cartItem.product;
    //         const subtotal = cartItem.quantity * product.regularPrice;

    //         console.log('Calculated subtotal:', subtotal);

    //         // Recalculate the total price of the cart
    //         let totalPrice = 0;
    //         cart.items.forEach(item => {
    //             totalPrice += item.quantity * item.product.regularPrice;
    //         });

    //         console.log('Recalculated total price:', totalPrice);

    //         // Save the cart
    //         await Cart.findByIdAndUpdate(cart._id, {
    //             $set: {
    //                 totalPrice: totalPrice,
    //                 'items.$[elem].quantity': cartItem.quantity
    //             }
    //         }, {
    //             arrayFilters: [{ 'elem.product': productId }],
    //             new: true
    //         });

    //         console.log('Cart saved successfully:', cart);

    //         return {
    //             result: true,
    //             subtotal: subtotal,
    //             totalPrice: totalPrice
    //         };
    //     } catch (error) {
    //         console.error('Error updating quantity:', error);
    //         return { result: false, message: 'Error updating quantity' };
    //     }
    // },

    orderdata: async (userId) => {
        try {
            // Step 1: Find orders for the given userId
            const orders = await Order.find({ user: userId }).select('items');

            // Step 2: Extract and flatten items from each order
            const allItems = orders.flatMap(order => order.items);

            // Step 3: Group items by product and calculate quantity and total
            const productQuantities = {};
            allItems.forEach(item => {
                if (!productQuantities[item.product]) {
                    productQuantities[item.product] = 0;
                }
                productQuantities[item.product] += item.quantity;
            });

            // Step 4: Lookup products in the Product collection
            const productIds = Object.keys(productQuantities);
            const products = await Product.find({ _id: { $in: productIds } });

            // Step 5: Calculate total price for each product
            const productsWithTotal = products.map(product => {
                const quantity = productQuantities[product._id];
                const total = quantity * product.price;
                return {
                    ...product.toObject(),
                    quantity,
                    total
                };
            });

            return productsWithTotal;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },



    //     orders_detail: async (userid) => {
    //         try {
    //             // Find all orders for the user
    //             const orders = await Order.find({ userId: userid })
    //                 .populate({
    //                     path: 'productIds',
    //                     model: 'products',  // Ensure this matches your product model name
    //                     select: 'name promotionalPrice regularPrice imagePath' // Select specific fields if needed
    //                 })
    //                 .lean();

    //             // Find the user's cart to get quantities
    //             const cart = await Cart.findOne({ user: userid }).lean();

    //             // For each order, find the corresponding product in the cart and add the quantity
    //             if (cart && cart.items) {
    //                // Inside orders_detail function
    // orders.forEach(order => {
    //     let subtotal = 0;
    //     order.productIds = order.productIds.map(product => {
    //         const cartItem = cart.items.find(item => item.product.toString() === product._id.toString());
    //         const quantity = cartItem ? cartItem.quantity : 1;
    //         const totalPrice = product.regularPrice * quantity;
    //         subtotal += totalPrice;
    //         return {
    //             ...product,
    //             quantity,
    //             totalPrice
    //         };
    //     });
    //     order.subtotal = subtotal;
    // });

    // // Calculate grand total including shipping cost
    // const shippingCost = 10.00;
    // const grandTotal = orders.reduce((acc, order) => acc + order.subtotal, 0) + shippingCost;

    // // Return all relevant details
    // return {
    //     orders,
    //     cart,
    //     userId: userid,
    //     shippingCost,
    //     grandTotal
    // };

    //             }

    //             // Return all relevant details
    //             return {
    //                 orders,
    //                 cart, // Include the entire cart for reference
    //                 userId: userid // Include user ID for context if needed
    //             };
    //         } catch (error) {
    //             console.error('Error fetching order details:', error);
    //             throw error;
    //         }
    //     },

    // orders_detail: async (userid) => {
    //     try {
    //         // Find all orders for the user
    //         const orders = await Order.find({ userId: userid })
    //             .populate({
    //                 path: 'productIds',
    //                 model: 'products',  // Ensure this matches your product model name
    //                 select: 'name promotionalPrice regularPrice imagePath' // Select specific fields if needed
    //             })
    //             .lean();

    //         // Find the user's cart to get quantities
    //         const cart = await Cart.findOne({ user: userid }).lean();

    //         if (cart && cart.items) {
    //             // Initialize a map to store products by imagePath
    //             const productMap = new Map();

    //             // Iterate over each order
    //             orders.forEach(order => {
    //                 order.productIds.forEach(product => {
    //                     const cartItem = cart.items.find(item => item.product.toString() === product._id.toString());
    //                     const quantity = cartItem ? cartItem.quantity : 1;
    //                     const totalPrice = product.regularPrice * quantity;

    //                     if (productMap.has(product.imagePath)) {
    //                         // If a product with the same image already exists, update the quantity and totalPrice
    //                         const existingProduct = productMap.get(product.imagePath);
    //                         existingProduct.quantity += quantity;
    //                         existingProduct.totalPrice += totalPrice;
    //                     } else {
    //                         // If it's a new product image, add it to the map
    //                         productMap.set(product.imagePath, {
    //                             ...product,
    //                             quantity,
    //                             totalPrice
    //                         });
    //                     }
    //                 });
    //             });

    //             // After processing all orders, calculate the subtotals
    //             const uniqueProducts = Array.from(productMap.values());
    //             const subtotal = uniqueProducts.reduce((acc, product) => acc + product.totalPrice, 0);

    //             // Calculate grand total including shipping cost
    //             const shippingCost = 10.00;
    //             const grandTotal = subtotal + shippingCost;

    //             // Return all relevant details
    //             return {
    //                 orders: [{ productIds: uniqueProducts, subtotal }], // One order containing unique products
    //                 cart,
    //                 userId: userid,
    //                 shippingCost,
    //                 grandTotal
    //             };
    //         }

    //         // Return all relevant details if no cart found
    //         return {
    //             orders,
    //             cart, // Include the entire cart for reference
    //             userId: userid // Include user ID for context if needed
    //         };
    //     } catch (error) {
    //         console.error('Error fetching order details:', error);
    //         throw error;
    //     }
    // },


            orders_detail: async (userid) => {
        try {
            // Find all orders for the user
            const orders = await Order.find({ userId: userid })
                .populate({
                    path: 'productIds',
                    model: 'products', // Ensure this matches your product model name
                    select: 'name promotionalPrice regularPrice imagePath' // Select specific fields if needed
                })
                .lean();
    
            // Find the user's cart to get quantities
            const cart = await Cart.findOne({ user: userid }).lean();
    
            if (cart && cart.items) {
                // Initialize a map to store products by imagePath
                const productMap = new Map();
    
                // Iterate over each order
                orders.forEach(order => {
                    order.productIds.forEach(product => {
                        const cartItem = cart.items.find(item => item.product.toString() === product._id.toString());
                        const quantity = cartItem ? cartItem.quantity : 1;
                        const totalPrice = product.regularPrice * quantity;
    
                        if (productMap.has(product.imagePath)) {
                            // If a product with the same image already exists, update the quantity and totalPrice
                            const existingProduct = productMap.get(product.imagePath);
                            existingProduct.quantity += quantity;
                            existingProduct.totalPrice += totalPrice;
                        } else {
                            // If it's a new product image, add it to the map
                            productMap.set(product.imagePath, {
                                ...product,
                                quantity,
                                totalPrice
                            });
                        }
                    });
                });
    
                // After processing all orders, calculate the subtotals
                const uniqueProducts = Array.from(productMap.values());
                const subtotal = uniqueProducts.reduce((acc, product) => acc + product.totalPrice, 0);
    
                // Calculate grand total including shipping cost
                const shippingCost = 10.00;
                const grandTotal = subtotal + shippingCost;
    
                // Return all relevant details including the order status
                return {
                    orders: [{ productIds: uniqueProducts, subtotal, status: orders[0].status }], // Assuming all orders have the same status
                    cart,
                    userId: userid,
                    shippingCost,
                    grandTotal
                };
            }
    
            // Return all relevant details if no cart found
            return {
                orders,
                cart, // Include the entire cart for reference
                userId: userid // Include user ID for context if needed
            };
        } catch (error) {
            console.error('Error fetching order details:', error);
            throw error;
        }
    },
    
    


    findAjexdata: async (userid) => {
        try {
            const cart = await Cart.findOne({ user: userid }).populate('items.product').exec();

            // Debug: Check if cart is retrieved and populated correctly
            console.log("Retrieved cart:", cart);

            if (!cart) {
                return null;
            }

            const cartItems = cart.items.map(item => {
                // Debug: Check if each item is populated with a product
                console.log("Cart item:", item);

                if (!item.product) {
                    console.error("Product not found for item:", item);
                    return null; // Skip this item if product is not found
                }

                return {
                    _id: item.product._id,
                    name: item.product.name,
                    imagePath: item.product.imagePath,
                    promotionalPrice: item.product.promotionalPrice,
                    regularPrice: item.product.regularPrice,
                    discount: item.product.discount,
                    description: item.product.description,
                    category: item.product.category,
                    quantity: item.quantity,
                    Subtotal: item.quantity * item.product.regularPrice
                };
            }).filter(item => item !== null); // Remove any null items from the array

            const totalPrice = cartItems.reduce((total, item) => total + item.Subtotal, 0);

            return {
                user: cart.user,
                items: cartItems,
                totalPrice: totalPrice
            };
        } catch (error) {
            console.error("Error retrieving cart data:", error);
            throw error;
        }
    },


    // ajexdata : async (userid, productid) => {
    //     try {
    //         console.log("Fetching product with ID:", productid);
    //         const productToAdd = await Product.findById(productid);

    //         if (!productToAdd) {
    //             throw new Error('Product not found');
    //         }
    //         console.log("Product found:", productToAdd);

    //         const productPrice = productToAdd.regularPrice;
    //         console.log("Product price used:", productPrice);

    //         // Fetch or create the cart
    //         let cart = await Cart.findOne({ user: userid });
    //         console.log("Cart fetched:", cart);

    //         if (!cart) {
    //             console.log("No cart found, creating a new one");
    //             // Create a new cart if it doesn't exist
    //             cart = new Cart({
    //                 user: userid,
    //                 items: [{ product: productid, quantity: 1, subtotal: productPrice }],
    //                 totalPrice: productPrice
    //             });
    //         } else {
    //             console.log("Cart found, checking if product is already in the cart");
    //             const itemIndex = cart.items.findIndex(item => item.product.toString() === productid);

    //             if (itemIndex > -1) {
    //                 console.log("Product is already in the cart, updating quantity and subtotal");
    //                 // Update the quantity and subtotal if the product is already in the cart
    //                 cart.items[itemIndex].quantity += 1;
    //                 cart.items[itemIndex].subtotal = cart.items[itemIndex].quantity * productPrice;
    //             } else {
    //                 console.log("Product is not in the cart, adding it");
    //                 // Add the new product to the cart
    //                 cart.items.push({ product: productid, quantity: 1, subtotal: productPrice });
    //             }
    //         }

    //         // Recalculate the total price by summing up all subtotals
    //         console.log("Recalculating total price",cart.items.subtotal);
    //         cart.totalPrice = cart.items.reduce((total, item) => {
    //             console.log("Adding subtotal for item:", item.subtotal);
    //             return total + (item.subtotal || 0); // Ensure subtotal is not undefined
    //         }, 0);
    //         console.log("Total price calculated:", cart.totalPrice,);

    //         // Save the updated cart
    //         console.log("Saving cart:", cart);
    //         await cart.save();

    //         // Find the subtotal for the added or updated product
    //         const addedProduct = cart.items.find(item => item.product.toString() === productid);
    //         const subtotal = addedProduct ? addedProduct.subtotal : 0;

    //         // Return the cart, subtotal for the added or updated product, and totalPrice
    //         console.log("Returning cart details:", {
    //             cart,
    //             subtotal,
    //             totalPrice: cart.totalPrice
    //         });
    //         return {
    //             cart,
    //             subtotal,
    //             totalPrice: cart.totalPrice
    //         };
    //     } catch (error) {
    //         console.error("Error in ajexdata function:", error);
    //         throw error;
    //     }
    // },

    ajexdata: async (userid, productid, increment) => {
        try {
            console.log("Fetching product with ID:", productid);
            const productToUpdate = await Product.findById(productid);

            if (!productToUpdate) {
                throw new Error('Product not found');
            }
            console.log("Product found:", productToUpdate);

            const productPrice = productToUpdate.regularPrice;

            // Fetch or create the cart
            let cart = await Cart.findOne({ user: userid });
            if (!cart) {
                throw new Error('Cart not found');
            }

            const itemIndex = cart.items.findIndex(item => item.product.toString() === productid);

            if (itemIndex > -1) {
                // Update the quantity and subtotal
                cart.items[itemIndex].quantity += increment;
                if (cart.items[itemIndex].quantity <= 0) {
                    // If quantity is 0 or less, remove the product from the cart
                    cart.items.splice(itemIndex, 1);
                } else {
                    cart.items[itemIndex].subtotal = cart.items[itemIndex].quantity * productPrice;
                }
            } else if (increment > 0) {
                // Add the product to the cart if it's not already there and increment is positive
                cart.items.push({ product: productid, quantity: increment, subtotal: increment * productPrice });
            } else {
                throw new Error('Product not in cart and cannot decrement');
            }

            // Recalculate the total price
            cart.totalPrice = cart.items.reduce((total, item) => total + (item.subtotal || 0), 0);

            // Save the updated cart
            await cart.save();

            // Find the subtotal for the updated product
            const updatedProduct = cart.items.find(item => item.product.toString() === productid);
            const subtotal = updatedProduct ? updatedProduct.subtotal : 0;

            return {
                cart,
                subtotal,
                newQuantity: updatedProduct ? updatedProduct.quantity : 0,
                totalPrice: cart.totalPrice
            };
        } catch (error) {
            console.error("Error in ajexdata function:", error);
            throw error;
        }
    },





    createRazorpay: async (result) => {
        try {
            // Define the options for creating the Razorpay order
            const options = {
                amount: result.totalPrice * 100, // Amount in paise (Razorpay expects amount in paise)
                currency: "INR",
                receipt: result._id
            };

            // Create the Razorpay order
            const instancedata = await instance.orders.create(options);

            // Return the created order data
            return instancedata;
        } catch (error) {
            console.error('Error creating Razorpay order:', error);
            throw new Error('Failed to create Razorpay order.');
        }
    },
    sendCouponCode: async (couponCode) => {
        // Example database query (replace with your actual query)
        const coupon = await Coupon.findOne({ couponCode });

        if (!coupon) {
            throw new Error("Coupon not found.");
        } else {
            if (couponCode === coupon.couponCode) {

            }
        }

        return {
            discountAmount: coupon.discountAmount,
            // Other properties
        };
    },
    ReturnProduct: async (returnProductData, userid) => {
        try {
            // Find the product by its ID
            const product = await Product.findOne({ _id: returnProductData.productId });
            if (!product) {
                throw new Error('Product not found');
            }
    
            // Find the user by their ID
            const user = await User.findOne({ _id: userid });
            if (!user) {
                throw new Error('User not found');
            }
    
            // Create the ReturnProduct document
            const returnProduct = await ReturnProduct.create({
                userId: user._id,
                productId: product._id,
                returnDate: returnProductData.returnDate || new Date(),  // Default to current date if not provided
                returnStatus: returnProductData.returnStatus || 'pending', // Ensure this matches the enum values
                returnReason: returnProductData.returnReason, // This field is required
            });
    
            // Delete the product from the database
            await Order.deleteOne({ _id: product._id });
    
            // Optionally remove the product from any orders that include it
            await Order.updateMany(
                { "products.productId": product._id },
                { $pull: { products: { productId: product._id } } }
            );
    
            return returnProduct;
        } catch (error) {
            console.error('Error creating return product:', error);
            throw new Error('Failed to create return product.');
        }
    },
    balance: async (userId, status, grandTotal) => {
        try {
            if (status === 'Cancelled') {
                // Update the user's balance by adding the grandTotal to the current balance
                await User.updateOne(
                    { _id: userId }, 
                    { $inc: { balance: grandTotal } }
                );
            }
    
            // Return the current balance
            const updatedUser = await User.findById(userId);
            return updatedUser.balance;
        } catch (error) {
            console.error('Error updating balance:', error);
            throw error; // Re-throw the error to be handled by the caller
        }
    },
    Wallet: async (userid) => {
        try {
            const user = await User.findById(userid);
            if (!user) {
                throw new Error('User not found');
            }
            return user.balance;
        } catch (error) {
            console.error('Error retrieving wallet balance:', error.message);
            throw error;
        }
    },
}   



