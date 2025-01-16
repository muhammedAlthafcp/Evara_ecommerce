const express = require('express');
const router = express.Router();
const {  
    homepage,
    loginpage,
    login,
    logout,
    signuppage,
    signup,
    forgotPasswordEmail,
    forgotPasswordEmailsend,
    forgotPasswordOTPsend,
    NewPasswordsend,
    show_home_wishlist,
    show_shop_page,
    shop_product_id,
    shop_product_right,
    page_contact,
    page_privacy_policy,
    page_about,
    // shop_product_right_post,
    shop_right,
    edit_user_profile,
    edit_user_profile_data,
    search,

    // autocompletes,

    category,
    filter,
    wishlist,
    remove_from_wishlist,
    shop_carts,
     shop_cart,
    remove_from_cart,
    cart,
    CheckOut,
    add_new_address,
    Place_Order,
    change_product,
    shop_orders,
    contact_form,
    verify_payment,
    verify_otp,  
    sendEmail,
    Downlod,
    ApplyCouponCode,
    ReturnProduct,
    process_return,
    checkoutOne,
    
    

} = require("../controller/users");
const isAuth = require('../middleware/isAuth');
const back =require('../middleware/back')

router.get('/Downlod',Downlod)
router.get('/',back,homepage)
router.get('/login',back, loginpage);
router.post('/login', login);
router.get("/logout",logout);
router.post('/change-product',isAuth,change_product)
router.get('/signup',signuppage)
router.post('/signup', signup);
router.post('/verify-otp',verify_otp);
router.get('/forgotPasswordEmail',forgotPasswordEmail);
router.post('/forgotPasswordEmailsend',forgotPasswordEmailsend);
router.post('/forgotPasswordOTPsend',forgotPasswordOTPsend);
router.post('/NewPasswordsend',NewPasswordsend);
router.get('/category',category)
router.get('/search',search)
router.post('/filter',filter)
router.get('/wishlist',isAuth,wishlist);
router.post('/add-wishlist',isAuth,show_home_wishlist);
router.get('/shop-page-wishlist',isAuth,show_shop_page)
router.get('/delete-wishlist/:id',isAuth,remove_from_wishlist);
router.get('/shop-carts',isAuth,shop_carts)
router.get('/cart',isAuth,cart);
router.post('/shop-cart', isAuth, shop_cart);
router.get('/remove-from-cart',isAuth,remove_from_cart);
router.get('/shop-orders',isAuth,shop_orders)
router.post('/contact-form',isAuth,contact_form)

router.get('/shop-product-right', shop_product_right);
router.get('/page-contact', page_contact);
router.get('/page-privacy-policy', page_privacy_policy);
router.get('/page-about', page_about);
router.get('/shop-right',shop_right)

router.get('/sendEmail',sendEmail)
router.get('/edit-user-profile',isAuth,edit_user_profile)
router.post('/edit-user-profile-data',isAuth,edit_user_profile_data)
router.get('/CheckOut',isAuth,CheckOut)
router.get('/add-new-address',isAuth,add_new_address)
router.post('/Place-Order',isAuth,Place_Order)
router.post('/verify-payment',isAuth,verify_payment)
router.post('/ApplyCouponCode',isAuth,ApplyCouponCode)
router.get('/ReturnProduct/:id',isAuth,ReturnProduct)
router.post('/process-return',isAuth,process_return)
router.get('/checkoutOne',isAuth,checkoutOne)




module.exports = router;
