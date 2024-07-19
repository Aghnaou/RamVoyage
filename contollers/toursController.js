const fs = require('fs');
const Tour = require('./../models/tourmodel');
const catchAsync = require('./../utils/catchAsync');

const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

const sharp = require('sharp'); // image processing library in Nodejs

// for the image upload :
const multer = require('multer');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError('Not an image ! please upload only images !!!', 400),
      false
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // 1) Cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2) Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});

// a middleware :
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.addTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

// using the data from a JSON file
/*const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
);
*/

// thi middlware is used to check the id when we want to add or delete or get a tour BUT we will not use it anymore when we will work with the database in MongoDB

// exports.checkId = (req, res, next, value) => {
//   console.log(` heey you are in ${value} tour!!!!`);

//   if (value > tours.length) {
//     //if (!tour) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'invalid id',
//     });
//   }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   // if(!req.body.name ||!req.body.price){
//   if (!req.body.hasOwnProperty('name') || !req.body.hasOwnProperty('price')) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'invalid tour body !!!!',
//     });
//   }
//   next();
// };

// exports.getAllTours = catchAsync(async (req, res, next) => {
//   // before doing the error handling in the section 9 of the course
//   // try {
//   //   // EXECUTE QUERY
//   //   const features = new APIFeatures(Tour.find(), req.query)
//   //     .filter()
//   //     .sort()
//   //     .limitFields()
//   //     .paginate();
//   //   const tours = await features.query;

//   //   // SEND RESPONSE
//   //   res.status(200).json({
//   //     status: 'success',
//   //     results: tours.length,
//   //     data: {
//   //       tours,
//   //     },
//   //   });
//   // } catch (err) {
//   //   res.status(404).json({
//   //     status: 'fail',
//   //     message: err,
//   //   });
//   // }

//   // after doing the error handling in the section 9
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const tours = await features.query;

//   //   // SEND RESPONSE
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours,
//     },
//   });
// });

// // The fisrst version of getAllTours method handller without any Apifeatures like filtering , sorting , paginating ...
// // exports.getAllTours = async (req, res) => {
// //   try {
// //     const tours = await Tour.find();

// //     res.status(200).json({
// //       status: 'success',
// //       requestedAt: req.requestTime,
// //       results: tours.length,
// //       data: {
// //         tours,
// //       },
// //     });
// //   } catch (err) {
// //     res.status(404).json({
// //       status: 'fail',
// //       message: err,
// //     });
// //   }
// // };

// exports.getTour = catchAsync(async (req, res, next) => {
//   //const id = req.params.id * 1;
//   // const tour = tours.find((el) => el.id === id);

//   // if (id > tours.length) {
//   //   //if (!tour) {
//   //   return res.status(404).json({
//   //     status: 'fail',
//   //     message: 'invalid id',
//   //   });
//   // }

//   // res.status(200).json({
//   //   status: 'success',
//   //   data: {
//   //     tour,
//   //   },
//   // });

//   // try {
//   //   const id = req.params.id;
//   //   const tour = await Tour.findById(id); // tour.findOne({'_id' : id}) !!!!!!!!!!!!!!
//   //   res.status(200).json({
//   //     status: 'success',
//   //     data: {
//   //       tour,
//   //     },
//   //   });
//   // } catch (err) {
//   //   res.status(404).json({
//   //     status: 'fail',
//   //     message: 'invalid id',
//   //   });
//   // }

//   // after doing the error handling in the section 9
//   const id = req.params.id;
//   const tour = await Tour.findById(id).populate('review'); // tour.findOne({'_id' : id}) !!!!!!!!!!!!!!
//   //polpulate.('') : is used to populate reference fields in a document with actual data from other collections.
//   // the guides field is an array of ObjectIds referencing documents in the User collection. When you use .populate('guides'),
//   // Mongoose will replace the ObjectIds in the guides field with the actual User documents from the User collection.

//   // this handles every request error where we have a valid id tour but there is no tour with that id so instead of just returning null it's better to have a 404 error
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });

// exports.updateTour = catchAsync(async (req, res, next) => {
//   // const id = req.params.id * 1;
//   // if (id > tours.length) {
//   //   return res.status(404).json({
//   //     status: 'fail',
//   //     message: 'invalid id',
//   //   });
//   // }
//   // try {
//   //   const id = req.params.id;
//   //   const tour = await Tour.findByIdAndUpdate(id, req.body, {
//   //     new: true,
//   //     runValidators: true,
//   //   });

//   //   res.status(200).json({
//   //     status: 'success',
//   //     data: {
//   //       tour,
//   //     },
//   //   });
//   // } catch (err) {
//   //   res.status(404).json({
//   //     status: 'fail',
//   //     message: err,
//   //   });
//   // }

//   // after section 9
//   const id = req.params.id;
//   const tour = await Tour.findByIdAndUpdate(id, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   // this handles every request error where we have a valid id tour but there is no tour with that id so instead of just returning null it's better to have a 404 error
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });

// //After refactoring :
// exports.deleteTour = factory.deleteOne(Tour);
// // Before refactoring :

// // exports.deleteTour = catchAsync(async (req, res, next) => {
// //   // const id = req.params.id * 1;
// //   // if (id > tours.length) {
// //   //   return res.status(404).json({
// //   //     status: 'fail',
// //   //     message: 'invalid id',
// //   //   });
// //   // }
// //   // try {
// //   //   const id = req.params.id;
// //   //   await Tour.findByIdAndDelete(id);
// //   //   res.status(204).json({
// //   //     status: 'success',
// //   //     data: null,
// //   //   });
// //   // } catch (err) {
// //   //   res.status(404).json({
// //   //     status: 'fail',
// //   //     message: err,
// //   //   });
// //   // }

// //   // after section 9
// //   const id = req.params.id;
// //   const tour = await Tour.findByIdAndDelete(id);

// //   // this handles every request error where we have a valid id tour but there is no tour with that id so instead of just returning null it's better to have a 404 error
// //   if (!tour) {
// //     return next(new AppError('No tour found with that ID', 404));
// //   }

// //   res.status(204).json({
// //     status: 'success',
// //     data: null,
// //   });
// // });

// exports.addTour = catchAsync(async (req, res, next) => {
//   // ------------- 1------------------ in the first if the course when we are not dealing with a database in mongodb
//   // const newId = tours[tours.length - 1].id + 1;
//   // const newTour = Object.assign({ id: newId }, req.body);
//   // tours.push(newTour);
//   // fs.writeFile(
//   //   `${__dirname}/../dev-data/data/tours-simple.json`,
//   //   JSON.stringify(tours),
//   //   (err) => {
//   //     res.status(201).json({
//   //       status: 'success',
//   //       data: {
//   //         tour: newTour,
//   //       },
//   //     });
//   //   }
//   // );
//   // ---------------------------------2-----------------------------------------------------------

//   // 1--->
//   //  const newTour=new Tour({});
//   //  newTour.save().then();
//   // 2---->

//   // try {
//   //   const newTour = await Tour.create(req.body); //  So it will create a new document for the req.body element that we will write in the postman app
//   //   res.status(201).json({
//   //     status: 'success',
//   //     data: {
//   //       tour: newTour,
//   //     },
//   //   });
//   // } catch (err) {
//   //   res.status(400).json({
//   //     status: 'fail',
//   //     message: 'ivalid data sent !!!!!!',
//   //   });
//   // }

//   // after section 9
//   const newTour = await Tour.create(req.body); //  So it will create a new document for the req.body element that we will write in the postman app

//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// });

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } }
    // }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // 2021

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }, //PUSH IS FOR RETURNING AN ARRAY OF THE PROPERTY WHICH IS IN THIS CASE THE NAME OF THE TOURS
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    // {
    //   $limit: 1, // it gives you just 12 first documents
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/34.111745,-118.113491/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
