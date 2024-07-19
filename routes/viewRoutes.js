const express = require('express');
const viewsController = require('../contollers/viewsController');
const authController = require('../contollers/authController');
const bookingController = require('../contollers/bookingController');

const router = express.Router();

// router.get('/', (req, res) => {
//   res.status(200).render('base', {
//     title: 'Tours!!',
//   });
// });
router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewsController.getOverview
);

router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);

router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);

router.get('/me', authController.protect, viewsController.getAccount);

router.get('/my-tours', authController.protect, viewsController.getMyTours);

router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);

module.exports = router;
