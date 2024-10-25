const productHelper = require('../helpers/productHelper');
const userHelpers = require('../helpers/userhelpers'); // Ensure the correct import path
const path = require('path');
const bcrypt = require('bcrypt');
const Handlebars = require('handlebars');

// Register the 'eq' helper
Handlebars.registerHelper('eq', function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this);
});
const fs = require('fs');
const adminHelpers = require('../helpers/adminHelpers');
module.exports = {
    Admin:(req,res)=>{
        res.redirect('/login')
    },
    admin_home_page:async (req, res) => {
        
        const productCount = await adminHelpers.productCount()
        const orderCount = await adminHelpers.orderCount()
        const totalRevenue = await adminHelpers.totalRevenue()
        const shopProducts = await adminHelpers.orderDatas();
        
        res.render('Admin/index',{productCount,orderCount,totalRevenue,shopProducts});
    },
    Dashboard:async (req, res) => {
        const productCount = await adminHelpers.productCount()       
        const orderCount = await adminHelpers.orderCount()
        const totalRevenue = await adminHelpers.totalRevenue()
        const shopProducts = await adminHelpers.orderDatas();
        res.render('Admin/index',{productCount,orderCount,totalRevenue,shopProducts});
    },
    search: async (req, res) => {
        try {
            const searchQuery = req.query.search || ''; // Default to an empty string if no query is provided
            const shopProducts = await productHelper.searchdata(searchQuery);
            console.log("Search Results:", shopProducts); // Debugging statement
            res.render('Admin/page-products-grid', { shopProducts });
        } catch (error) {
            console.error(error);
            res.render('Users/index', { errorMessage: "Error occurred during search" });
        }
    },
    page_products_grid: async (req, res) => {
        var shopProducts = await productHelper.shopProduct();
        res.render('Admin/page-products-grid', { shopProducts });
    },
    page_orders: async (req, res) => {
        try {
            const orderdata = await adminHelpers.orderDatas();
            console.log("hello man this is your datas", orderdata);
    
            res.render('Admin/page-orders', { orderdata });
        } catch (error) {
            console.error("Error fetching order data:", error);
            res.status(500).send("Internal Server Error");
        }
    },
    page_orders_detail: async (req, res) => {
        const orderId = req.params.id;
        console.log("Order ID:", orderId);
        try {
            const result = await adminHelpers.orders_detail(orderId);
            console.log("Order Details:", result);
            res.render('Admin/page-orders-detail', { result });
        } catch (error) {
            console.error("Error fetching order details:", error);
            res.status(500).send("Internal Server Error");
        }
    },
    Details_user:async(req,res)=>{
        const userId = req.params.id;
        const user = await adminHelpers.getUser(userId);
        res.render('Admin/user-datas',{user});
    console.log(user);
 },
 user_data_edit_Admin:async(req,res)=>{
    const userData = req.body;
    console.log(userData,"hello");
    const user = req.body
    const userdataas = await adminHelpers.edit_User_data(userData);
    console.log('aljkf;alf;',user);
    res.render('Admin/user-datas',{user});
 },
 New_user:async(req,res)=>{
    res.render('Admin/page-account-register') 
 },
 New_user_data: async (req, res) => {
    try {
        const { name, email, phonenumber, password } = req.body;
        // Check if the email already exists
        const existingUser = await adminHelpers.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).send('Email already exists');
        }
        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create the user object
        const user = { name, email, phonenumber, password: hashedPassword };
        // Save the user to the database
        const newUser = await adminHelpers.addUser(user);
        console.log(newUser);        
        if (newUser) {
            const productCount = await adminHelpers.productCount()
            const orderCount = await adminHelpers.orderCount()
            const totalRevenue = await adminHelpers.totalRevenue()
            const orderdata = await adminHelpers.orderDatas();
            console.log("hello man this is your datas", orderdata);
            res.render('Admin/index',{productCount,orderCount,totalRevenue,orderdata});
               } else {
            // Handle user creation failure
            res.status(400).send('Error creating user');
        }
    } catch (error) {
        console.error('Error processing user data:', error);
        res.status(500).send('Internal Server Error');
    }
},
  page_form_product: (req, res) => {
        res.render('Admin/page-form-product');
    },
    // add_product: async (req, res) => {
    //     try {
    //         if (!req.files || !req.files.image) {
    //             return res.status(400).send('No file uploaded');
    //         }
    //         console.log("hello man this is your datas", req.body);

    //         const image = req.files.image;
    //         console.log(req.files.image);

    //         const uploadDir = './public/products-images';
    //         if (!fs.existsSync(uploadDir)) {
    //             fs.mkdirSync(uploadDir, { recursive: true });
    //         }
    //         console.log(uploadDir);

    //         const imagePath = path.join(uploadDir, image.name);
    //         console.log(imagePath, 'image path');
    //         image.mv(imagePath, async (err) => {
    //             if (err) {
    //                 console.error(err);
    //                 return res.status(500).send('Error uploading file');
    //             }

    //             const productData = {
    //                 ...req.body,
    //                 imagePath: [image.name]
    //             };
    //             console.log(productData, "productDatas");
    //             const result = await productHelper.insertdata(productData);
    //             console.log(result, "result");

    //             res.render('Admin/page-form-product');
    //         });
    //     } catch (error) {
    //         console.error(error);
    //         res.status(400).send('Error processing request');
    //     }
    // },
   
    add_product: async (req, res) => {
        try {
            if (!req.files || !req.files.image) {
                return res.status(400).send('No files uploaded');
            }
            console.log("hello man this is your datas", req.body);
    
            const images = Array.isArray(req.files.image) ? req.files.image : [req.files.image];
            console.log(req.files.image);
    
            const uploadDir = './public/products-images';
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            console.log(uploadDir);
    
            const imagePaths = [];
            for (const image of images) {
                const imagePath = path.join(uploadDir, image.name);
                console.log(imagePath, 'image path');
                await image.mv(imagePath);
                imagePaths.push(image.name); // Store only the image name
            }
    
            const productData = {
                ...req.body,
                imagePath: imagePaths // Store array of image names
            };
            console.log(productData, "productDatas");
            const result = await productHelper.insertdata(productData);
            console.log(result, "result");
    
            res.render('Admin/page-form-product');
        } catch (error) {
            console.error(error);
            res.status(400).send('Error processing request');
        }
    },
    
   
   
   
    page_account_register: (req, res) => {
        res.render('Admin/page-account-register');
    },
    page_brands: (req, res) => {
        res.render('Admin/page-brands');
    },
    page_edit_product: async (req, res) => {
        const proid = req.params.id;
        const editProduct = await productHelper.findProductDatas(proid);
        res.render('Admin/page-edit-product', { editProduct });
    },
    edit_Product: async (req, res) => {
        const proid = req.params.id;
        const editProduct = await productHelper.findProductDatas(proid);

        try {
            if (!req.files || !req.files.image) {
                return res.status(400).send('No file uploaded');
            }
            console.log("hello man this is your datas", req.body);

            const image = req.files.image;
            console.log(req.files.image);

            const uploadDir = './public/products-images';
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const imagePath = path.join(uploadDir, image.name);
            image.mv(imagePath, async (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Error uploading file');
                }

                const productData = {
                    ...req.body,
                    imagePath: [image.name]
                };
                const result = await productHelper.editproduct(productData, proid);

                var shopProducts = await productHelper.shopProduct();
                res.render('Admin/page-products-grid', { shopProducts });
            });
        } catch (error) {
            console.error(error);
            res.status(400).send('Error processing request');
        }
    },
    delete_product: async (req, res) => {
        const proid = req.params.id;
        const deleteProduct = await productHelper.findProductDatas(proid);
        const imagePath = './public/products-images/' + deleteProduct.imagePath;
        fs.unlink(imagePath, (err) => {
            if (err && err.code !== 'ENOENT') {
                console.error('Error deleting existing image:', err);
            }
        });
        await productHelper.deleteproduct(proid);
        var shopProducts = await productHelper.shopProduct();
        res.render('Admin/page-products-grid', { shopProducts });
    },
    page_reviews: async (req, res) => {
        const userdata = await userHelpers.findOllusers();
        res.render('Admin/page-reviews', { userdata });
    },
    Delete_user_data:async (req,res)=>{
        const id = req.params.id;
        console.log(id);
        
        const deleteUserData = await adminHelpers.deleteUserData(id);
        const userdata = await userHelpers.findOllusers();
        res.render('Admin/page-reviews', { userdata });

    },
    SearchUser:async(req,res)=>{
        const search = req.body.search;
        const userdata = await adminHelpers.findUsersByName(search);
        console.log(userdata);
        
        res.render('Admin/page-reviews', { userdata });

    },

    blockUser: async (req, res) => {
        try {
            const userid = req.params.id;
            await userHelpers.blockUser(userid);
            res.redirect('/Admin/page-reviews');
        } catch (error) {
            console.error('Error blocking user:', error);
            res.redirect('/Admin/page-reviews');
        }
    },
    unblockUser: async (req, res) => {
        try {
            const userid = req.params.id;
            await userHelpers.unblockUser(userid);
            res.redirect('/Admin/page-reviews');
        } catch (error) {
            console.error('Error unblocking user:', error);
            res.redirect('/Admin/page-reviews');
        }
    },
    coupon:async(req,res)=>{
        const newCoupon = await adminHelpers.findCoupondata()
        console.log(newCoupon);
        res.render('Admin/coupons',{newCoupon})
     },
     createNewcoupon:async(req,res)=>{
        res.render('Admin/createNewcoupon')

     },
     Newcoupon: async (req, res) => {
        try {
            const { couponCode, discountAmount, expirationDate, minPurchaseAmount } = req.body;
    
            // Logging the values to verify they are being captured correctly
            console.log("Coupon Code:", couponCode);
            console.log("Discount Amount:", discountAmount);
            console.log("Expiration Date:", expirationDate);
            console.log("Minimum Purchase Amount:", minPurchaseAmount);
    
            // Creating a coupon object to be passed to the helper
            const coupon = {
                couponCode: couponCode,  // Coupon code
                discountAmount: discountAmount,  // Discount amount
                expirationDate: expirationDate,  // Expiration date
                minPurchaseAmount: minPurchaseAmount  // Minimum purchase amount
            };
    
            // Calling the helper function to create the coupon in the database
            const result = await adminHelpers.createCoupon(coupon);
            const newCoupon = await adminHelpers.findCoupondata()
            console.log(newCoupon);
            res.render('Admin/coupons',{newCoupon})
    
           
           
        } catch (error) {
            // Handling errors
            console.error("Error creating coupon:", error);
            res.status(500).json({ message: "An error occurred while creating the coupon" });
        }
    },
    couponedit:async(req,res)=>{
        const id=req.params.id
        console.log(id);
        const editCoupon=await adminHelpers.findCouponById(id)
        console.log(editCoupon);
        res.render('Admin/editCoupon',{editCoupon})   
    },
    Updatecoupon: async (req, res) => {
        try {
            const { couponCode, discountAmount, expirationDate, minPurchaseAmount } = req.body;
    
            // Logging the values to verify they are being captured correctly
            console.log("Coupon Code:", couponCode);
            console.log("Discount Amount:", discountAmount);
            console.log("Expiration Date:", expirationDate);
            console.log("Minimum Purchase Amount:", minPurchaseAmount);
    
            // Creating a coupon object to be passed to the helper
            const coupon = {
                couponCode,  // Coupon code
                discountAmount,  // Discount amount
                expirationDate,  // Expiration date
                minPurchaseAmount  // Minimum purchase amount
            };
            console.log(coupon);
    
            // Calling the helper function to update the coupon in the database
            const result = await adminHelpers.UpdateCouponcode(coupon);
            console.log(result);
    
            const newCoupon = await adminHelpers.findCoupondata()
            console.log(newCoupon);
            res.render('Admin/coupons',{newCoupon})
        } catch (error) {
            // Handling errors
            console.error("Error updating coupon:", error);
            res.status(500).json({ message: "An error occurred while updating the coupon" });
        }
    },
    coupondelete: async (req, res) => {
        try {
            const id = req.params.id;  // Extracting the coupon ID from the request parameters
            console.log("Coupon ID to delete:", id);
    
            // Calling the helper function to delete the coupon by ID
            const deleteCouponResult = await adminHelpers.deleteCoupon(id);
            console.log("Coupon deletion result:", deleteCouponResult);
    
            // Fetching the updated list of coupons after deletion
            const newCoupon = await adminHelpers.findCoupondata();
            console.log("Updated coupon list:", newCoupon);
    
            // Rendering the coupons page with the updated coupon data
            res.render('Admin/coupons', { newCoupon });
        } catch (error) {
            // Handling errors
            console.error("Error deleting coupon:", error);
            res.status(500).json({ message: "An error occurred while deleting the coupon" });
        }
    },
    returnproduct:async(req,res)=>{
      
      const returnData = await adminHelpers.returnProductData()
      console.log(returnData)

  
    res.render('Admin/returnproduct',{returnData})
    },
    update_return_status: async (req, res) => {
        const { id, status } = req.body;
        console.log(id, status);
    
        try {
            // Update the return status
            const updateStatus = await adminHelpers.updateReturnStatus(id, status);
            console.log("Updated Return Status:", updateStatus);
    
            // Find the related order using userId, productId, and the status
            const findOrder = await adminHelpers.findAndUpdateOrderStatus(updateStatus.userId._id, updateStatus.productId._id, status);
            console.log("Found Order:", findOrder);
    
            // Respond with success
            res.json({ success: true, order: findOrder });
        } catch (error) {
            console.error('Error updating return status:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    },
    
    delete_return:async(req,res)=>{
        try {
            const { id } = req.body;
    
            // Find the return product by ID and delete it
            const deletedReturn = await adminHelpers.findByIdAndDelete(id);
    
            if (deletedReturn) {
                // If successful, send a success response
                res.json({ success: true, message: 'Return product deleted successfully.' });
            } else {
                // If no product was found, send a failure response
                res.json({ success: false, message: 'Return product not found.' });
            }
        } catch (error) {
            console.error('Error deleting return product:', error);
            // If an error occurs, send a failure response
            res.json({ success: false, message: 'Failed to delete return product.' });
        }  
    },
        
}
