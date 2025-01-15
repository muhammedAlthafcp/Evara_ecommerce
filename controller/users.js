const userHelpers = require('../helpers/userhelpers')
const adminHelpers = require("../helpers/adminHelpers");
const productHelper = require('../helpers/productHelper')
const contactForm = require("../helpers/contactForm")
const otpGenerator = require('otp-generator');
const path = require('path');



const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const admin = require("./admin");
const User = require("../modals/users");
const userhelpers = require('../helpers/userhelpers');

const Razorpay = require('razorpay')
const crypto = require('crypto')
const PDFDocument = require('pdfkit');
const { dir } = require('console');

module.exports = {
    loginpage: async (req, res) => {
        if (req.session.admin) {
            return res.redirect('Admin/Adminpage')
        } else if (req.session.loggedIn || req.session.user) {
            return res.redirect('/')
        } else {
            res.render('Users/page-login-register')
        }
    },

    login: async (req, res) => {
        console.log(req.body);
        const { email, password } = req.body;
        try {
            const admin = await adminHelpers.findAdmin(email);
            const user = await userHelpers.findexistuser(email);

            if (user) {
                const isMatch = await bcrypt.compare(password, user.password);
                if (isMatch) {
                    req.session.loggedIn = true;
                    req.session.user = user;
                    res.redirect("/");
                } else {
                    res.render('Users/page-login-register', { invalid: "Invalid email or password" });
                }
            } else if (admin) {
                const isAdmin = await bcrypt.compare(password, admin.password);
                if (isAdmin) {
                    req.session.loggedIn = true;
                    req.session.admin = admin;
                    res.redirect('Admin/Adminpage');
                } else {
                    res.send("Invalid email or password");
                }
            } else {
                res.send("User not found");
            }
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    },
    logout: (req, res) => {
        try {
            req.session.destroy((err) => {
                if (err) {
                    res.send(err);
                } else {
                    res.redirect("/login");
                }
            });
        } catch (error) {
            console.log(error);
            res.send('hello');
        }
    },
    // signup: async (req, res) => {
    //     try {
    //         const { name, email, password, phonenumber } = req.body;

    //         const data = {
    //             name,
    //             email,
    //             password,
    //             phonenumber,
    //         };

    //         console.log(data);

    //         const existuser = await userHelpers.findexistuser(data.email);

    //         console.log("hello", existuser);
    //         console.log(existuser);

    //         const generateOTP = () => {
    //             return otpGenerator.generate(6, { upperCase: false, specialChars: false });
    //         };
    //         var OTP = generateOTP();
    //         console.log(OTP,"hi muhammed");


    //         const sendEmail = async (email) => {
    //             const transporter = nodemailer.createTransport({
    //                 host: "smtp.gmail.com",
    //                 port: 465,
    //                 secure: true,
    //                 auth: {
    //                     user: process.env.NODEMAILER_EMAIL,
    //                     pass: process.env.NODEMAILER_PASSWORD,
    //                 },
    //             });
    //             console.log(OTP);

    //             await transporter.sendMail({
    //                 from: process.env.NODEMAILER_EMAIL,
    //                 to: email,
    //                 subject: "Welcome to Our Platform",
    //                 text: "Hello, welcome to our platform!",
    //                 html: '<b>Hello world?</b><br>Visit  ${OTP}',
    //             });

    //             console.log("Email sent successfully");
    //         };

    //         if (existuser && existuser.email) {
    //             res.render('Users/page-login-register', { existMessage: "User already exists" });
    //         } else if (password.length !== 5) {
    //             res.render('Users/page-login-register', { passwordMessage: "Password must be exactly 5 characters long" });
    //         } else if (phonenumber.length !== 10) {
    //             res.render('Users/page-login-register', { phonenumberMessag: "Phone number must be exactly 10 digits long" });
    //         } else {
    //             const saltRounds = 10;
    //             const hashpassword = await bcrypt.hash(password, saltRounds);
    //             data.password = hashpassword;
    //             const user = await userHelpers.insertuser(data);

    //             console.log(req.session);
    //             console.log(req.session.user);

    //             await sendEmail(data.email);

    //             req.session.loggedIn = true;
    //             req.session.user = user;

    //             res.render("Users/otp")
    //         }
    //     } catch (error) {
    //         console.error(error);
    //         res.render('Users/page-login-register', { errorMessage: "Error occurred during registration" });
    //     }
    // },



    signup: async (req, res) => {
        try {
            const { name, email, password, phonenumber } = req.body;

            const data = {
                name,
                email,
                password,
                phonenumber,
            };

            console.log(data);

            const existuser = await userHelpers.findexistuser(data.email);

            console.log("User check:", existuser);
 
            // OTP generation function
            const generateOTP = () => {
                return otpGenerator.generate(6, { upperCase: false, specialChars: false });
            };

            var OTP = generateOTP();
            console.log("Generated OTP:", OTP);
        
            

            // Email sending function
            const sendEmail = async (email, OTP) => {
                const transporter = nodemailer.createTransport({
                    service: "gmail", // 'service' can simplify setup for Gmail
                    auth: {
                        user: process.env.NODEMAILER_EMAIL,
                        pass: process.env.NODEMAILER_PASSWORD, // Use app-specific password if 2FA is enabled
                    },
                });
            
                console.log("Sending OTP via email...");
            
                await transporter.sendMail({
                    from: process.env.NODEMAILER_EMAIL,
                    to: email,
                    subject: "Your OTP Code",
                    text: `Hello, welcome to our platform! Your OTP code is: ${OTP}`,
                    html: `<b>Hello, welcome to our platform!</b><br>Your OTP code is: <strong>${OTP}</strong>`,
                });
            
                console.log("Email sent successfully");
                
            };
            

            // Validation checks
            if (existuser && existuser.email) {
                res.render('Users/page-login-register', { existMessage: "User already exists" });
            } else if (password.length < 5) {
                res.render('Users/page-login-register', { passwordMessage: "Password must be at least 5 characters long" });
            } else if (phonenumber.length !== 10) {
                res.render('Users/page-login-register', { phonenumberMessage: "Phone number must be exactly 10 digits long" });
            } else {
                const saltRounds = 10;
                const hashpassword = await bcrypt.hash(password, saltRounds);
                data.password = hashpassword;
                const user = await userHelpers.insertuser(data);

                console.log("User session before OTP:", req.session);

                // Send OTP email
                await sendEmail(data.email, OTP);

                // Store OTP and user in session
                req.session.loggedIn = true;
                req.session.user = user;
                req.session.OTP = OTP;  // Store OTP in session for later verification

                res.render("Users/otp");  // Render OTP page
            }
        } catch (error) {
            console.error("Error during signup:", error);
            res.render('Users/page-login-register', { errorMessage: "Error occurred during registration" });
        }
    },
    verify_otp: async (req, res) => {
        try {
            const { otp: userOTP } = req.body;  // Extract OTP entered by the user
            const sessionOTP = req.session.OTP;  // Get the OTP stored in the session

            console.log("Stored OTP:", sessionOTP, "User OTP:", userOTP);

            // Check if the OTPs match
            if (userOTP === sessionOTP) {
                // OTP is correct, clear the OTP from the session and redirect to the homepage
                delete req.session.OTP;
                res.redirect("/");
            } else {
                // OTP is incorrect, re-render the OTP page with an error message
                res.render("Users/otp", { error: "Invalid OTP" });
            }
        } catch (error) {
            // Handle any unexpected errors
            console.error("Error during OTP verification:", error);
            res.render("Users/otp", { error: "An error occurred during OTP verification. Please try again." });
        }
    },



    signuppage: async (req, res) => {
        const userid = req.params.id
        const wishlistCount = await productHelper.findwishlistCount(userId)
        console.log(wishlistCount);
        const cartCount = await productHelper.findCartCount(userId)

        res.render('Users/page-login-register', { wishlistCount, cartCount });
    },
    forgotPasswordEmail: async (req, res) => {
        res.render('Users/forgotPasswordEmail')
    },
    forgotPasswordEmailsend: async (req, res) => {
        const { email } = req.body;
        const user = await userHelpers.findexistuser(email);

        if (user) {
            const generateOTP = () => {
                return otpGenerator.generate(6, { upperCase: false, specialChars: false });
            };

            const OTPDATA = generateOTP();  // Generate OTP
            req.session.OTPDATA = OTPDATA;  // Store OTP in session
            console.log('Generated OTP:', OTPDATA);

            const sendEmail = async (email, OTPDATA) => {
                const transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 465,
                    secure: true,
                    auth: {
                        user: process.env.NODEMAILER_EMAIL,
                        pass: process.env.NODEMAILER_PASSWORD,
                    },
                });

                console.log("Sending OTP via email...");

                await transporter.sendMail({
                    from: process.env.NODEMAILER_EMAIL,
                    to: email,
                    subject: "Your OTP Code",
                    text: `Hello, welcome to our platform! Your OTP code is: ${OTPDATA}`,
                    html: `<b>Hello, welcome to our platform!</b><br>Your OTP code is: <strong>${OTPDATA}</strong>`,
                });
            };
            req.session.email = email
            await sendEmail(email, OTPDATA);
            console.log("Email sent successfully");

            res.render('Users/forgotPasswordOTP');
        } else {
            // Handle the case where the user is not found
            res.status(404).send("User not found");
        }
    },

    forgotPasswordOTPsend: async (req, res) => {
        const { otp } = req.body;  // Extract the OTP from the request body
        // const OTPDATA = req.session.OTPDATA;
        var otpdata = req.session.OTPDATA
        // Get the OTP data stored in the session

        console.log('Session OTP:', otpdata);
        console.log('Received OTP:', otp);

        if (otp === otpdata) {  // Compare the received OTP with the one in the session
            res.render("Users/NewPassword");  // If they match, render the New Password page
        } else {
            res.render('Users/forgotPasswordOTP');

        }
    },
    NewPasswordsend: async (req, res) => {
        const { password, confirmPassword } = req.body;

        if (password === confirmPassword) {
            const hashpassword = await bcrypt.hash(password, 5);

            try {
                await userHelpers.updatePassword(req.session.email, hashpassword);  // Update the password using the user's email
                res.redirect('/')
            } catch (error) {
                console.error("Error updating password:", error);
                res.status(500).send("Error updating password");
            }
        } else {
            res.status(400).send("Passwords do not match");
        }
    },

    search: async (req, res) => {
        if (!req.session.user) {
            const searchQuery = req.query.search || ''; // Default to an empty string if no query is provided
            const shopProducts = await productHelper.searchdata(searchQuery);
            console.log("Search Results:", shopProducts); // Debugging statement
            res.render('Users/shop-grid-right', { shopProducts });
           }else{
            const sessiondata = req.session.user
            const proid = sessiondata._id
            const searchQuery = req.query.search || ''; // Default to an empty string if no query is provided
            const shopProducts = await productHelper.searchdata(searchQuery);
            const wishlistCount = await productHelper.findwishlistCount(proid)
            const cartCount = await productHelper.findCartCount(proid)

           
           }

    },


    category: async (req, res) => {
        if (!req.session.user) {
            const categoryName = req.query.id;
            const shopProducts = await productHelper.category(categoryName);
            console.log(shopProducts);
            res.render("Users/shop-grid-right", { shopProducts});

        }else{
            const sessiondata = req.session.user
            const proid = sessiondata._id
            const categoryName = req.query.id;
            const shopProducts = await productHelper.category(categoryName);
            const wishlistCount = await productHelper.findwishlistCount(proid)
            console.log(wishlistCount);
            const cartCount = await productHelper.findCartCount(proid)
            res.render("Users/shop-grid-right", { shopProducts, wishlistCount, cartCount });

        }
          
    
    },
    filter: async (req, res) => {
        console.log(req.body);
        const userId = req.params._id
        const wishlistCount = await productHelper.findwishlistCount(userId)
        console.log(wishlistCount);
        const cartCount = await productHelper.findCartCount(userId)

        try {
            const minPrice = parseFloat(req.body['min-price']);
            const maxPrice = parseFloat(req.body['max-price']);

            if (isNaN(minPrice) || isNaN(maxPrice)) {
                return res.status(400).send("Invalid price range");
            }

            const shopProducts = await productHelper.filterByPrice(minPrice, maxPrice);
            console.log(shopProducts);
            res.render("Users/shop-grid-right", { shopProducts, wishlistCount, cartCount })
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    },
    homepage: async (req, res) => {
        if (!req.session.user) {
            const editProduct = await productHelper.findProductDatas()
            var productDatas = await productHelper.findProduct();
            res.render('Users/index', { productDatas });
        } else {
            const sessiondata = req.session.user
            console.log(sessiondata);
            const proid = sessiondata._id
            console.log(proid);


            const editProduct = await productHelper.findProductDatas(proid)
            var productDatas = await productHelper.findProduct();
            console.log(productDatas);

            const wishlistCount = await productHelper.findwishlistCount(proid)
            console.log(wishlistCount);
            const cartCount = await productHelper.findCartCount(proid)
            console.log(cartCount);

            const balance = await userHelpers.Wallet(sessiondata)
            console.log(balance);


            res.render('Users/index', { productDatas, sessiondata, wishlistCount, cartCount, balance });

        }

    },
    shop_product_id: async (req, res) => {
        const userdata = req.user._id;
        const productid = req.params.id;
        console.log(productid);

    },

    shop_product_right: async (req, res) => {
        if (!req.session.user){
            const proid = req.query.id
            console.log(proid ,"product id");
            
            const editProduct = await productHelper.findProductDatas(proid)
            console.log(editProduct,"editproduct");
            
            var shopProducts = await productHelper.shopProduct();
            console.log(shopProducts,'shopProduc');
            res.render('Users/shop-product-right', { editProduct, shopProducts});
        }else{
            const sessiondata = req.session.user
            const userId = sessiondata._id
            const proid = req.query.id
            const editProduct = await productHelper.findProductDatas(proid)
            var shopProducts = await productHelper.shopProduct();
            const wishlistCount = await productHelper.findwishlistCount(userId)
            const cartCount = await productHelper.findCartCount(userId)
            res.render('Users/shop-product-right', { editProduct, shopProducts, cartCount, wishlistCount });
        }},
    page_contact: async (req, res) => {
        if (!req.session.user) {
            res.render('Users/page-contact');

        } else {
            const sessiondata = req.session.user
            const userId = sessiondata._id
            const wishlistCount = await productHelper.findwishlistCount(userId)
            const cartCount = await productHelper.findCartCount(userId)
            res.render('Users/page-contact',{wishlistCount,cartCount});

        }

    },
    page_privacy_policy: async (req, res) => {
        const userId = req.params._id

        const wishlistCount = await productHelper.findwishlistCount(userId)
        console.log(wishlistCount);
        const cartCount = await productHelper.findCartCount(userId)
        res.render('Users/page-privacy-policy', { wishlistCount, cartCount });
    },
    page_about: async (req, res) => {
        if (!req.session.user) {
            res.render('Users/page-about');

        } else {
            const sessiondata = req.session.user
            const userId = sessiondata._id

            const wishlistCount = await productHelper.findwishlistCount(userId)
            console.log(wishlistCount);
            const cartCount = await productHelper.findCartCount(userId)

            res.render('Users/page-about', { wishlistCount, cartCount });
        }



    },
    shop_right: async (req, res) => {
        if (!req.session.user) {
            var shopProducts = await productHelper.shopProduct();
            console.log(shopProducts);
            res.render('Users/shop-grid-right', { shopProducts })
        } else {
            const sessiondata = req.session.user
            const userId = sessiondata._id
            var shopProducts = await productHelper.shopProduct();
            console.log(shopProducts);

            const wishlistCount = await productHelper.findwishlistCount(userId)
            console.log(wishlistCount);
            const cartCount = await productHelper.findCartCount(userId)

            res.render('Users/shop-grid-right', { shopProducts, cartCount, wishlistCount })

        }

    },
    edit_user_profile: async (req, res) => {
        const userid = req.user._id
        console.log(userid);
        const userdata = await userHelpers.findUsertDatas(userid)
        res.render('Users/edit-user-profile', { userdata })
    },

    edit_user_profile_data: async (req, res) => {
        const userid = req.user._id
        console.log(userid);
        const userupdate = req.body
        const userdatas = await userHelpers.edituserdata(userupdate, userid)
        res.redirect('/edit-user-profile')
    },

    show_home_wishlist: async (req, res) => {
        try {
            const userId = req.user._id;
            const productId = req.body.id;

            // Ensure both userId and productId exist
            if (!userId || !productId) {
                return res.status(400).json({ success: false, message: 'Missing user ID or product ID.' });
            }

            // Call the helper function to add the product to the wishlist
            const wishlistData = await userHelpers.wishlistdata(userId, productId);

            // Fetch updated wishlist count after adding the product
            const wishlistCount = await productHelper.findwishlistCount(userId);

            // Debugging log (optional)
            console.log(wishlistData, 'Wishlist data after adding the product');

            // Return success response with updated wishlist count
            return res.json({ success: true, wishlistCount });
        } catch (error) {
            console.error('Error adding product to wishlist:', error);

            // Handle server errors and return a 500 response
            return res.status(500).json({ success: false, message: 'Server error' });
        }
    },



    show_shop_page: async (req, res) => {
        const userdata = req.user._id;
        const productid = req.query.id; // Correct way to fetch the product ID from the URL params
        const wishlists = await userHelpers.wishlistdata(userdata, productid);
        res.redirect('/shop-right')
    },

    wishlist: async (req, res) => {
        const userid = req.user._id
        const userId = req.params._id
        const wishlistCount = await productHelper.findwishlistCount(userid);

        const cartCount = await productHelper.findCartCount(userid);
        const wishlist = await userHelpers.wishlist(userid)
        console.log(wishlist);
        

        console.log(cartCount);


        res.render('Users/shop-wishlist', { wishlist, wishlistCount, cartCount, })
    },
    remove_from_wishlist: async (req, res) => {
        try {
            const userid = req.user._id;
            const productid = req.params.id;

            var wishlist = await userHelpers.removeItemFromWishlist(userid, productid)
            console.log(wishlist);

            res.render('Users/shop-wishlist', { wishlist })
            // Redirect to the wishlist page with the updated data
            res.redirect('/wishlist'); // Adjust the path as necessary
        } catch (error) {
            console.error('Error removing product from wishlist:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while removing the product from the wishlist'
            });
        }
    }, 

        shop_carts: async (req, res) => {
        const userid = req.user._id
        // console.log(userid);
        const produdctid = req.query.id
        // console.log(produdctid);

        const cartdata = await userHelpers.cartdata(userid, produdctid)
        const wishlistCount = await productHelper.findwishlistCount(userid);
        const cartCount = await productHelper.findCartCount(userid);
        var shopProducts = await productHelper.shopProduct();
        res.render('Users/shop-grid-right', { shopProducts,cartCount,wishlistCount})
    },
    cart: async (req, res) => {
        const userid = req.user._id;
        console.log("UserID:", userid);
        const userId = req.params._id;
        const wishlistCount = await productHelper.findwishlistCount(userid);
        const cartCount = await productHelper.findCartCount(userid);
        const finddata = await userHelpers.finddata(userid);
        console.log("Finddata:", finddata);
        // Initialize req.session.finddata if it does not exist
        if (!req.session.finddata) {
            req.session.finddata = {};
        }
        // Set the totalPrice in session
        // req.session.finddata.totalPrice = finddata.totalPrice;
        console.log("TotalPrice:", req.session.finddata.totalPrice);

        res.render('Users/shop-cart', { finddata, cartCount, wishlistCount });
    },
    shop_cart: async (req, res) => {
        try {
            const userid = req.user._id;
            console.log(userid);
            const productid = req.params.id;  // Updated to get the product ID from the URL
            console.log(productid);
            // Add product to the cart
            await userHelpers.cartdata(userid, productid);
            // Fetch updated cart count
            const cartCount = await productHelper.findCartCount(userid);
            // Respond with success and updated cart count
            res.redirect('/cart')
        } catch (error) {
            console.error(error);
            return res.json({ success: false, error: 'Error adding product to cart.' });
        }
    },

    shop_orders: async (req, res) => {
        try {
            const userid = req.user._id;
            console.log('User ID:', userid);

            // Fetch order details
            const result = await userHelpers.orders_detail(userid);
            console.log('Order Details:', result);

            // Ensure result contains the orders array
            if (result.orders && result.orders.length > 0) {
                const order = result.orders[0];
                const status = order.status;
                const grandTotal = result.grandTotal;

                // Calculate balance based on order status
                const balance = await userHelpers.balance(userid, status, grandTotal);
                console.log('Balance:', balance);

                // Assign result to session
                req.session.result = result;

                // Fetch wishlist and cart counts
                const wishlistCount = await productHelper.findwishlistCount(userid);
                const cartCount = await productHelper.findCartCount(userid);

                // Render the order page
                res.render('Users/order', { result, wishlistCount, cartCount });
            } else {
                res.status(404).send('No orders found');
            }
        } catch (error) {
            res.render('Users/order');

        }
    },

    Downlod: async (req, res) => {
        try {
            console.log("Retrieving session results...");
            const results = req.session.result;

            console.log("Checking if order data is available...");
            if (!results || !results.orders) {
                console.log("No order data available.");
                return res.status(400).send('No order data available to generate PDF.');
            }
            console.log("Retrieving the first order...");
            const order = results.orders[0];
            console.log("Order retrieved:", order);

            console.log("Creating new PDF document...");
            const doc = new PDFDocument({ margin: 50 });

            console.log("Setting response headers...");
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=product_sales_report.pdf');

            console.log("Piping PDF document to response...");
            doc.pipe(res);

            // Header
            doc.fontSize(24).fillColor('#2E86C1').text('Product Sales Report', { align: 'center' }).moveDown(1);

            // Order Details
            doc.fontSize(16)
                .text('User Details', { underline: true, bold: true })
                .moveDown(0.5);

            doc.fontSize(12)
                .text(`Customer: ${order.firstName} ${order.lastName}`)
                .text(`Address: ${order.billingAddress}, ${order.billingAddress2}`)
                .text(`City: ${order.city}`)
                .text(`State: ${order.state}`)
                .text(`Zipcode: ${order.zipcode}`)
                .text(`Phone: ${order.phone}`)
                .text(`Email: ${order.email}`)
                .text(`Total Price: $${order.totalPrice}`, { bold: true })
                .text(`Payment Method: ${order.paymentMethod}`)
                .moveDown(1);

            // Product Details
            if (order.productIds && order.productIds.length > 0) {
                doc.fontSize(16).text('Products', { underline: true, bold: true }).moveDown(0.5);

                order.productIds.forEach((product, index) => {
                    const yPosition = doc.y;
                    doc.fontSize(12)
                        .text(`Name: ${product.name}`)
                        .text(`Promotional Price: $${product.promotionalPrice}`)
                        .text(`Regular Price: $${product.regularPrice}`)
                        .text(`Quantity: ${product.quantity}`);

                    // Add Product Image
                    if (Array.isArray(product.imagePath) && product.imagePath.length > 0) {
                        const imagePath = path.join('C:\\Users\\muham\\OneDrive\\Desktop\\mini-project 2.0\\mini-project\\public\\products-images', product.imagePath[0]);
                        console.log("Adding Product Image Path to PDF:", imagePath);

                        try {
                            // Set image size and position
                            const imageWidth = 150;
                            const imageHeight = 150;
                            const xPosition = doc.page.width - imageWidth - doc.options.margin; // Right side
                            const yPositionForImage = yPosition + 40; // Adjust to fit below the text

                            doc.image(imagePath, {
                                fit: [imageWidth, imageHeight],
                                align: 'center',
                                valign: 'center',
                                x: xPosition,
                                y: yPositionForImage
                            }).moveDown(1);

                            console.log("Image added to PDF.");
                        } catch (err) {
                            console.error("Failed to load image, adding placeholder text...");
                            doc.text(`Image not available`, 50, yPosition + 80);
                        }
                    } else {
                        console.error("Invalid imagePath, adding placeholder text...");
                        doc.text(`No image available`, 50, yPosition + 80);
                    }

                    doc.moveDown(1); // Move down to avoid overlap
                });
            } else {
                doc.fontSize(12).text('No products found in this order.', { italic: true }).moveDown(1);
            }

            console.log("Finalizing PDF document...");
            doc.end();
        } catch (error) {
            console.error("An error occurred while generating the PDF:", error);
            res.status(500).send('An error occurred while generating the PDF.');
        }
    },



    contact_form: async (req, res) => {
        const userid = req.user._id;
        const data = req.body;

        // Basic validation
        if (!data.name || !data.email || !data.subject || !data.telephone || !data.message) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        try {
            const result = await contactForm.contactform(userid, data);
            res.redirect('/')
            console.log('Contact saved:', result);
        } catch (error) {
            console.error('Error submitting contact form:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    remove_from_cart: async (req, res) => {
        try {

            const userid = req.user._id;
            const productid = req.query.id;
            const userId = req.params._id
            const cartdata = await userHelpers.removeItemFromCart(userid, productid);
            console.log(cartdata);
            const finddata = await userHelpers.removeData(userid)
            console.log(finddata);
            const wishlistCount = await productHelper.findwishlistCount(userid)
            console.log(wishlistCount);
            const cartCount = await productHelper.findCartCount(userid)

            res.render('Users/shop-cart', { finddata, wishlistCount, cartCount });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },
    CheckOut: async (req, res) => {
        try {
            const userid = req.user._id;
            const Address = await userHelpers.getOrderByUserId(userid);
            const wishlistCount = await productHelper.findwishlistCount(userid);
            const cartCount = await productHelper.findCartCount(userid);
            const CouponCodeData = await adminHelpers.CouponCode(); // Assuming this returns valid and expired coupons
            const username = await userHelpers.username(userid);
            const finddata = await userHelpers.finddata(userid);
    
            console.log("User Name:", username);
            console.log(CouponCodeData, 'CouponCode debug');
    
            // Filter valid and expired coupons
            const validCoupons = CouponCodeData.validCoupons;
            const expiredCoupons = CouponCodeData.expiredCoupons;
    
            res.render("Users/shop-checkout", { 
                finddata, 
                wishlistCount, 
                cartCount, 
                validCoupons, // Pass valid coupons
                expiredCoupons, // Pass expired coupons
                Address, 
                username
            });
    
        } catch (error) {
            console.error("Checkout Error:", error);
            res.status(500).send("Internal Server Error");
        }
    },
    
    
    add_new_address: async (req, res) => {
        const userid = req.user._id;
        console.log(userid);
        
        const userId = req.params._id;

        // const Address = await userHelpers.getOrderByUserId(userid)
        // console.log(Address);
        const wishlistCount = await productHelper.findwishlistCount(userid);
        const cartCount = await productHelper.findCartCount(userid);
        const CouponCode = await adminHelpers.CouponCode(); // Assuming this returns an array
        const username = await userhelpers.username(userid)
        console.log("user Name :",username);
        
        console.log(CouponCode);

        const finddata = await userHelpers.finddata(userid);
        console.log(finddata);


        console.log(CouponCode, 'CouponCode debug');

        res.render("Users/shop-checkout", { finddata, wishlistCount, cartCount, CouponCode: CouponCode[0] ,username});
    },


    // Update_Cart:async
    // Place_Order: async (req, res) => {
    //     const userid = req.user._id;
    //     try {
    //         // Extract additional data from the request body
    //         const { 
    //             fname, lname, country, billing_address, billing_address2, city, order_date, 
    //             state, zipcode, phone, email, totalPrice, productIds, payment_option 
    //         } = req.body;

    //         // Basic validation
    //         if (!fname || !lname || !country || !billing_address || !city || !order_date ||
    //             !state || !zipcode || !phone || !email || !totalPrice || !productIds || !payment_option) {
    //             return res.status(400).json({ message: 'Missing required fields' });
    //         }

    //         // Convert productIds from string to array of IDs
    //         const productIdsArray = productIds.split(',').map(id => id.trim());

    //         // Construct the order data
    //         const orderData = {
    //             firstName: fname,
    //             lastName: lname,
    //             country: country,
    //             billingAddress: billing_address,
    //             billingAddress2: billing_address2,
    //             city: city,
    //             orderDate: order_date,
    //             state: state,
    //             zipcode: zipcode,
    //             phone: phone,
    //             email: email,
    //             totalPrice: parseFloat(totalPrice), // Convert to number
    //             productIds: productIdsArray,
    //             paymentMethod: payment_option // Include payment method
    //         };

    //         console.log('Order             Data:', orderData);

    //         // Save order data using a helper function
    //         const result = await userHelpers.orderDatas(userid, orderData);
    //         if(result.paymentMethod==='Razorpay'){
    //             const Razorpay = await userHelpers.createRazorpay(result)
    //             console.log("hello",Razorpay);


    //             res.json({ 
    //                 success: true, 
    //                 razorpayOrder 
    //             });

    //      }


    //         // Optional: Send a confirmation email to the user here

    //         // Respond with success message
    //         res.render('Users/page-sendemail');
    //     } catch (error) {
    //         console.error('Error placing order:', error);
    //         res.status(500).json({ message: 'Internal server error' });
    //     }
    // },
    Place_Order: async (req, res) => {
        try {
            const {
                fname, lname, country, billing_address, billing_address2, city, order_date,
                state, zipcode, phone, email, totalPrice, productIds, payment_option
            } = req.body;

            // Basic validation and order creation logic
            const productIdsArray = productIds.split(',').map(id => id.trim());
            const orderData = {
                firstName: fname,
                lastName: lname,
                country: country,
                billingAddress: billing_address,
                billingAddress2: billing_address2,
                city: city,
                orderDate: order_date,
                state: state,
                zipcode: zipcode,
                phone: phone,
                email: email,
                totalPrice: parseFloat(totalPrice),
                productIds: productIdsArray,
                paymentMethod: payment_option
            };


            const result = await userHelpers.orderDatas(req.user._id, orderData);


            if (payment_option === 'Razorpay') {
                // Create a Razorpay order
                const razorpayOrder = await userHelpers.createRazorpay(result);

                if (!razorpayOrder) {
                    throw new Error('Failed to create Razorpay order.');
                }
                return res.json({
                    success: true,
                    paymentMethod: 'Razorpay',
                    razorpayOrder,
                    razorpayKey: process.env.RAZORPAY_KEY_ID // Pass the Razorpay key
                });
            } else if (payment_option === 'Cash on Delivery') {
                return res.json({
                    success: true,
                    paymentMethod: 'Cash on Delivery'
                });
            }
        } catch (error) {
            console.error('Error placing order:', error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Handle non-AJAX (regular form submission)
        res.redirect('/shop-orders');
    },


    verify_payment: async (req, res) => {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

        // Verify payment using Razorpay's SDK
        const generated_signature = crypto.createHmac('sha256', 'YOUR_RAZORPAY_KEY_SECRET')
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generated_signature === razorpay_signature) {
            // Payment is verified
            // Update order status in the database, send a confirmation email, etc.
            res.json({ success: true, message: 'Payment verified successfully.' });
        } else {
            // Payment verification failed
        }
    },




    // change_product: async (req, res) => {
    //     try {
    //         const userid = req.user._id;
    //         const productid = req.body.productid;

    //         console.log('Extracted values:', { userid, productid });

    //         // Call your helper function to get updated cart data
    //         const cartdata = await userHelpers.ajexdata(userid, productid);
    //         console.log(cartdata, 'hello');

    //         res.json({ success: true, subtotal: cartdata.subtotal, totalPrice: cartdata.totalPrice });
    //     } catch (error) {
    //         console.error(error);
    //         res.status(500).json({ success: false, message: 'An error occurred' });
    //     }
    // },



    // var shopProducts = await productHelper.shopProduct();
    // console.log(shopProducts);
    sendEmail: (req, res) => {
        res.render("Users/page-sendemail")
    },
    change_product: async (req, res) => {
        try {
            const userid = req.user._id;
            const { productid, increment } = req.body;

            console.log('Extracted values:', { userid, productid, increment });

            // Call your helper function to get updated cart data
            const cartdata = await userHelpers.ajexdata(userid, productid, parseInt(increment));
            console.log(cartdata, 'Cart data after update');

            res.json({
                success: true,
                subtotal: cartdata.subtotal,
                newQuantity: cartdata.newQuantity,
                totalPrice: cartdata.totalPrice
            });
        } catch (error) {
            console.error('Error in change_product:', error);
            res.status(500).json({
                success: false,
                message: 'An error '
            });
        }
    },
    ApplyCouponCode: async (req, res) => {
        console.log("Received request to apply coupon code");
        
        const couponCode = req.body.applyCoupon; // Get the coupon code from the request body
    
        const userId = req.user._id; // Get the user ID from the session
    
        try {
            // Fetch coupon details from userHelpers
            console.log("Fetching coupon details...");
            const coupon = await userHelpers.sendCouponCode(couponCode);
            console.log("Coupon details fetched:", coupon);
    
            // Check if the coupon is expired
            console.log(new Date);
            console.log(coupon.expirationDate);
            
            const isExpired = new Date(coupon.expirationDate) < new Date();
            console.log(`Is the coupon expired? ${isExpired}`);
    
            if (isExpired) {
                return res.status(200).json({
                    success: false,
                    message: "You can't use this coupon code because it has expired.",
                    coupon // Send coupon details even if it's expired
                });
            }
    
            // Assuming the total price is stored in the session data
            const TotalPrice = req.session.finddata.totalPrice;
            console.log(`Total price from session: $${TotalPrice}`);
    
            // Check if the total price is valid before applying the discount
            if (TotalPrice < coupon.minPurchaseAmount) {
                console.log(`Minimum purchase amount required: $${coupon.minPurchaseAmount}`);
                return res.status(400).json({
                    success: false,
                    message: `This coupon requires a minimum purchase of $${coupon.minPurchaseAmount}.`
                });
            }
    
            // Calculate the new total price after applying the discount
            const totalPrice = TotalPrice - coupon.discountAmount;
            console.log(`Total price after discount: $${totalPrice}`);
    
            // Ensure the total price does not go below zero
            const finalPrice = totalPrice < 0 ? 0 : totalPrice;
            console.log(`Final price after adjustment: $${finalPrice}`);
    
            // Send success response with coupon code and updated total price
            res.status(200).json({
                success: true,
                couponCode: coupon.couponCode,
                totalPrice: finalPrice
            });
        } catch (error) {
            console.error("Error applying coupon:", error);
            // Send a generic error message to avoid revealing sensitive information
            res.status(500).json({ success: false, message: "An error occurred while applying the coupon code." });
        }
    },
    
    
    

    ReturnProduct: async (req, res) => {
        const userid = req.user._id
        const wishlistCount = await productHelper.findwishlistCount(userid);
        const cartCount = await productHelper.findCartCount(userid);
        const productId = req.params.id;
        res.render('Users/returnProduct', { productId ,wishlistCount,cartCount})


    },
    process_return: async (req, res) => {
        try {
            // Get the user ID from the authenticated user's session or token
            const userid = req.user._id;
            console.log('User ID:', userid);

            // Convert the incoming data to a normal JavaScript object
            const returnProductData = { ...req.body };
            console.log('Return Product Data:', returnProductData);

            // Call the helper function to process the return
            const result = await userHelpers.ReturnProduct(returnProductData, userid);
            console.log('Return Product Result:', result);
            res.redirect('/')

        } catch (error) {
            // Handle errors and send an error response
            console.error('Error processing return:', error);
            res.status(500).json({ success: false, message: 'Failed to process product return', error: error.message });
        }
    },
    checkoutOne: async (req, res) => {
        const userid = req.user._id;
        const produdctid = req.query.id
        console.log(produdctid);
        const wishlistCount = await productHelper.findwishlistCount(userid);
        const cartCount = await productHelper.findCartCount(userid);
        const CouponCode = await adminHelpers.CouponCode();
        const finddata = await productHelper.getproductbyid(produdctid)
        console.log("hello", finddata);


        console.log(CouponCode, 'CouponCode debug');

        res.render("Users/shop-checkout", { finddata, wishlistCount, cartCount, CouponCode: CouponCode[0] });
    }


}
