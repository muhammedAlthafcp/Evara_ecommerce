var express = require('express');
var router = express.Router();


const {
  Admin,
  admin_home_page,
  Dashboard,
  page_products_grid,
  page_orders,
  page_orders_detail,
  page_form_product,
  page_account_register,
  page_brands,
  add_product,
  page_edit_product,
  edit_Product,
  delete_product,
  page_reviews,
  Delete_user_data,
  Details_user,
  user_data_edit_Admin,
  New_user,
  New_user_data,
  SearchUser,
  blockUser,
  unblockUser,
  search,
  coupon,
  createNewcoupon,
  Newcoupon,
  couponedit,
  Updatecoupon,
  coupondelete,
  returnproduct,
  update_return_status,
  delete_return


} = require('../controller/admin')
const isAdmin = require('../middleware/isAdmin')
const upload = require('../config/multer')
const back = require('../middleware/back')
const isAuth = require('../middleware/isAuth')
router.get('/Admin',back,Admin)
router.get('/Adminpage',isAdmin,back,admin_home_page);
router.get('/Dashboard',Dashboard)
router.get('/search',search)
router.get('/page-products-grid',page_products_grid)
router.get('/page-orders',page_orders)
router.get('/page-orders-detail/:id',page_orders_detail)
router.get('/Details-user/:id',Details_user)
router.post('/user-data-edit-Admin',user_data_edit_Admin)
router.get('/New-user',New_user)
router.post('/New-user-data',New_user_data)
router.get('/page-form-product',page_form_product)
router.post('/product',add_product)
router.get('/page-account-register',page_account_register)
router.get('/page-brands',page_brands) 
router.get('/page-edit-product/:id',page_edit_product)
router.post('/editProduct/:id',edit_Product)
router.get('/page-delete-product/:id',delete_product)
router.get('/page-reviews',page_reviews)
router.get('/Delete-user-data/:id',Delete_user_data)
router.get('/SearchUser',SearchUser)
router.get('/block/:id', blockUser);
router.get('/unblock/:id', unblockUser);
router.get('/coupon',coupon)
router.get('/createNewcoupon',createNewcoupon)
router.post('/Newcoupon',Newcoupon)
router.get('/couponedit/:id',couponedit)
router.post('/Updatecoupon',Updatecoupon)
router.get('/coupondelete/:id',coupondelete)
router.get('/returnproduct',returnproduct)
router.post('/update-return-status',update_return_status)
router.post('/delete-return',delete_return)


module.exports = router;
