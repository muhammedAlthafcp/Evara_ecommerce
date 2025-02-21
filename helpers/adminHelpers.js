var Admin = require('../modals/admin')
const Order = require('../modals/orderSchema')
const Product = require('../modals/product')
const Cart = require('../modals/cartschema')
const User = require('../modals/users')
const Coupon = require('../modals/coupon')
const ReturnProduct = require('../modals/ReturnProduct')


module.exports = {
  insertuser: async (data) => {
    const result = await Admin.create(data);
    return result;
  },
  findAdmin: async (email) => {
    const result = await Admin.findOne({ email }).lean();
    return result;
  },
  productCount: async () => {
    try {
      const result = await Product.find().countDocuments();
      return result;
    } catch (error) {
      console.error('Error counting products:', error);
      throw error; // rethrow the error so the calling function knows something went wrong
    }
  },

  orderCount: async () => {
    try {
      const result = await Order.find().countDocuments();
      return result;
    } catch (error) {
      console.error('Error counting orders:', error);
      throw error; // rethrow the error so the calling function knows something went wrong
    }
  },
  totalRevenue: async () => {
    try {
      const result = await Order.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalPrice" }
          }
        }
      ]);

      // If the aggregation returns a result, extract the totalRevenue value.
      // Otherwise, return 0 (if there are no orders).
      return result.length > 0 ? result[0].totalRevenue : 0;
    } catch (error) {
      console.error('Error calculating total revenue:', error);
      throw error; // rethrow the error so the calling function knows something went wrong
    }
  },
  categoryName: async (searchTerm) => {
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

  orderDatas: async () => {
    const result = await Order.find().limit(10).lean();
    return result;
  },
  orders_detail: async (orderId) => {
    try {
      // Find the order by its ID and populate the 'productIds' field with product details
      const order = await Order.findById(orderId)
        .populate({
          path: 'productIds',
          model: 'products',  // Ensure this matches your product model name
          select: 'name promotionalPrice regularPrice imagePath' // Select specific fields if needed
        })
        .lean(); // Convert the Mongoose document to a plain JavaScript object

      if (!order) {
        throw new Error('Order not found');
      }

      // Find the user's cart to get quantities
      const cart = await Cart.findOne({ user: order.userId }).lean(); // Assuming 'order.userId' is used here

      let subtotal = 0;

      // For each product in the order, calculate total price and update quantities
      if (cart && cart.items) {
        order.productIds = order.productIds.map(product => {
          const cartItem = cart.items.find(item => item.product.toString() === product._id.toString());
          const quantity = cartItem ? cartItem.quantity : 1; // Default to 1 if not found in cart
          const totalPrice = product.regularPrice * quantity;
          subtotal += totalPrice;
          return {
            ...product,
            quantity,
            totalItemPrice: totalPrice
          };
        });
      }

      // Calculate grand total including shipping cost
      const shippingCost = 10.00;
      const grandTotal = subtotal + shippingCost;

      // Return all relevant details
      return {
        order,
        cart, // Include the entire cart for reference
        shippingCost,
        grandTotal
      };
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  },
  deleteUserData: async (userid) => {
    try {
      const result = await User.deleteOne({ _id: userid });
      if (result.deletedCount === 1) {
        console.log('User data successfully deleted');
        return { success: true, message: 'User data successfully deleted' };
      } else {
        console.log('User not found');
        return { success: false, message: 'User not found' };
      }
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw error;
    }
  },
  findUsersByName: async (name) => {
    try {
      // Check if name is provided and is not an empty string
      if (name) {
        // Create a regular expression to match any name that contains the search term, case-insensitive
        const regex = new RegExp(name, 'i');

        // Use the regex to find all matching users
        const users = await User.find({ name: { $regex: regex } });

        // Return the array of users, or an empty array if no users are found
        return users;
      } else {
        // If name is not provided, return an empty array
        return [];
      }
    } catch (error) {
      console.error('Error finding users by name:', error);
      throw error;
    }




    

  },
  getUser: async (userid) => {
    try {
      const user = await User.findById(userid);
      if (user) {
        return user;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }

  },
  edit_User_data: async (userData) => {
    try {
        if (!userData.email) {
            throw new Error('User email is required to update user data.');
        }
        
        // Update the user document
        const result = await User.updateOne(
            { email: userData.email },  // Find user by email
            {
                $set: {
                    name: userData.name,
                    phonenumber: userData.phonenumber,
                },
            }
        );
        
        // Check if the update was successful
        if (result.nModified === 0) {
            throw new Error('No documents were updated.');
        }
        
        // Fetch the updated user document to get the `updatedAt` field
        const updatedUser = await User.findOne({ email: userData.email });

        // Return the updated user document with the updated date
        return {
            updatedUser
        };
    } catch (error) {
        throw new Error('Failed to update user data: ' + error.message);
    }
},
addUser: async (user) => {
  try {
      const newUser = await User.create(user);
      return newUser;
  } catch (error) {
      console.error("Error adding user:", error);
      return null;
  }
},

findUserByEmail: async (email) => {
  try {
      const user = await User.findOne({ email });
      return user;
  } catch (error) {
      console.error("Error finding user by email:", error);
      return null;
  }
},
createCoupon:async(coupon)=>{
  const result = await Coupon.create(coupon)
  return result

},
findCoupondata:async()=>{
  const result = await Coupon.find()
  return result
},
findCouponById:async(productid)=>{
  const result = await Coupon.findById(productid)
  return result
},
UpdateCouponcode: async (coupon) => {
  try {
      const { couponCode, discountAmount, expirationDate, minPurchaseAmount } = coupon;

      // Find the coupon by its code and update it with the new values
      const updatedCoupon = await Coupon.findOneAndUpdate(
          { couponCode },  // Filter by coupon code
          {
              $set: {
                  discountAmount,  // Update discount amount
                  expirationDate,  // Update expiration date
                  minPurchaseAmount  // Update minimum purchase amount
              }
          },
          { new: true }  // Return the updated document
      );

      // Return the updated coupon or throw an error if not found
      if (updatedCoupon) {
          return updatedCoupon;
      } else {
          throw new Error("Coupon not found");
      }

  } catch (error) {
      // Log and rethrow the error for the calling function to handle
      console.error("Error updating coupon:", error);
      throw error;
  }   
},
deleteCoupon: async (id) => {
  try {
      // Assuming you're using Mongoose to manage your MongoDB
      const result = await Coupon.findByIdAndDelete(id);

      // Return a success message or the result of the deletion
      if (result) {
          return { success: true, message: "Coupon deleted successfully", coupon: result };
      } else {
          throw new Error("Coupon not found");
      }
  } catch (error) {
      // Log and rethrow the error for the calling function to handle
      console.error("Error deleting coupon:", error);
      throw error;
  }
},
CouponCode: async () => {
  const currentDate = new Date();
  const coupons = await Coupon.find();
  const validCoupons = [];
  const expiredCoupons = [];
  coupons.forEach(coupon => {
      if (coupon.expirationDate >= currentDate) {
          validCoupons.push({ ...coupon._doc, isExpired: false });
      } else {
          expiredCoupons.push({ ...coupon._doc, isExpired: true });
      }
  });
  return { validCoupons, expiredCoupons };
},
returnProductData: async () => {
  const result = await ReturnProduct.find()
    .populate({
      path: 'productId',
      select: 'name',  // Assuming 'name' is the field for product name
    })
    .populate({
      path: 'userId',
      select: 'name',  // Assuming 'name' is the field for user name
    });
  // Format the results to include desired fields
  return result.map(returnProduct => ({
    _id: returnProduct._id,  // Include the ID for actions
    productName: returnProduct.productId ? returnProduct.productId.name : 'Unknown Product',  // Check if productId exists
    quantity: returnProduct.quantity,
    returnStatus: returnProduct.returnStatus,
    returnDate: returnProduct.returnDate,
    returnReason: returnProduct.returnReason,
    userName: returnProduct.userId ? returnProduct.userId.name : 'Unknown User',  // Check if userId exists
  }));
},
//  updateOrderStatus : async (id) => {
//   try {
//       const result = await ReturnProduct.find(
          
//       );

//       if (!result) {
//           throw new Error('Order not found');
//       }

//       return result;
//   } catch (error) {
//       console.error('Error in updateOrderStatus helper:', error.message);
//       throw error; // Re-throw the error to be handled by the controller
//   }
// },
updateReturnStatus: async (id, status) => {
  try {
      const result = await ReturnProduct.findByIdAndUpdate(
          id,
          { returnStatus: status },
          { new: true, select: 'userId productId returnStatus' } // Select the fields you want to return
      ).populate({
          path: 'userId',
          select: 'name email' // Specify the fields you want from the user document
      }).populate({
          path: 'productId',
          select: 'name price' // Specify the fields you want from the product document
      });

      if (!result) {
          throw new Error('Return product not found');
      }

      return {
          userId: result.userId, // This will now contain only the specified fields
          productId: result.productId,
          returnStatus: result.returnStatus
      };
  } catch (error) {
      console.error('Error in updateReturnStatus helper:', error.message);
      throw error;
  }
},
findAndUpdateOrderStatus: async (userId, productId, returnStatus) => {
  try {
      const order = await Order.findOne({
          userId: userId,
          productIds: productId
      });

      if (order) {
          // Map the return status to an appropriate order status
          let newStatus;
          if (returnStatus === 'Approved') {
              newStatus = 'Processing'; // Mapping approved return to processing order
          } else if (returnStatus === 'Rejected') {
              newStatus = 'Cancelled'; // Mapping rejected return to cancelled order
          } else if (returnStatus === 'cancelled') {
              newStatus = 'Cancelled'; // Additional mapping if necessary
          }
          if (newStatus) {
              order.status = newStatus;
              await order.save();
              return { success: true, message: 'Order status updated successfully', order };
          } else {
              return { success: false, message: 'Invalid return status provided' };
          }
      } else {
          return { success: false, message: 'Product not found in any order for this user' };
      }
  } catch (error) {
      console.error('Error finding and updating order status:', error.message);
      throw new Error('Internal server error');
  }
},
findByIdAndDelete:async(id)=>{
    const result = await ReturnProduct.findByIdAndDelete(id);
    return result
}
}

