const express = require('express');
const fs = require('fs');
const toursController = require('./../contollers/toursController');
const authController = require('./../contollers/authController');
const reviewRouter = require('./../routes/reviewRoutes');
const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

// pram middlware :

//router.param('id', (req, res, next, value) => {
//console.log(` heey you are in ${value} tour!!!!`);
// next();
//});
// a middleware to chek if the tour exists of not in the first place

//router.param('id', toursController.checkId);

// we ca do it like this :

// get all tours
//app.get('/api/v1/tours', getAllTours);
// get one tour
//app.get('/api/v1/tours/:id', getTour);

// Patch request
//app.patch('/api/v1/tours/:id', updateTour);

// delete request
//app.delete('/api/v1/tours/:id', deleteTour);
// add a tour
//app.post('/api/v1/tours', addTour);

// or like this :
router
  .route('/top-5-cheap')
  .get(toursController.aliasTopTours, toursController.getAllTours);

router.route('/tours-stats').get(toursController.getTourStats);

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    toursController.getMonthlyPlan
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(toursController.getToursWithin);
// /tours-within?distance=233&center=-40,45&unit=mi
// /tours-within/233/center/-40,45/unit/mi

router.route('/distances/:latlng/unit/:unit').get(toursController.getDistances);

router
  .route('/')
  .get(toursController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    toursController.addTour
  );

router
  .route('/:id')
  .get(toursController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    toursController.uploadTourImages,
    toursController.resizeTourImages,
    toursController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    toursController.deleteTour
  );

module.exports = router;
