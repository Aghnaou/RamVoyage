const mongoose = require('mongoose');
const slugify = require('slugify');
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'the tour should have a name !!'], // a must have attribute
    unique: true, // the attribute should be unique
    trim: true,
    maxlength: [40, 'A tour name must have less or equal then 40 characters'],
    minlength: [10, 'A tour name must have more or equal then 10 characters'],
    // validate: [validator.isAlpha, 'Tour name must only contain characters']
  },
  slug: String,
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a groupe size'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty is either: easy, medium, difficult',
    },
  },
  ratingsAverage: {
    type: Number,
    default: 4.5, // the default value if we didn't set the value of rating
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating must be below 5.0'],
    set: (val) => Math.round(val * 10) / 10, // 4.666666, 46.6666, 47, 4.7
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, 'the tour should have a price!!'],
  },
  priceDiscount: Number,
  summary: {
    type: String,
    trim: true, // it works only on string -------> it will remove all the whitespace at the beginning and the end of the string !!!
    required: [true, 'the tour should have a description!!'],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, 'the tour should have a cover image!!'],
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  startDates: [Date],
  secretTour: {
    type: Boolean,
    default: false,
  },
  secretTour: {
    type: Boolean,
    default: false,
  },
  startLocation: {
    // GeoJSON
    type: {
      type: String,
      default: 'Point',
      enum: ['Point'],
    },
    coordinates: [Number],
    address: String,
    description: String,
  },
  locations: [
    {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number,
    },
  ],
  guides: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  ],
});

// i didn't inderstand this indexes !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//Think of a database index to be similar to that of a book index (usually at the end of the book).
// Each keyword is mentioned in an alphabetical order along with the page numbers where the word is used,
// enabling users to search for the word quickly. Database indexes work in the same way.

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });

// We used a regular function instead of an arrow function because an arrow function does not have its own this keyword
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Virtual populate !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// A DOCUMENT MIDLLWARE FOR EMBADING DATA :
// tourSchema.pre('save', async function(next) {
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.pre('save', function(next) {
//   console.log('Will save document...');
//   next();
// });

// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE
// tourSchema.pre('find', function(next) {
// /^find/ refers to all the strings that starts with find ----------> we did that to use this middllware not just withe the find methode but alse when we are using the findById and the findOne findOneandupdate ....
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } }); // ne refers to not equal

  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });

  next();
});

// docs : refers to the documents that were returned from the query
tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); // unshift() is used to add at the beginning of the array

  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

/*const testTour = new Tour({
  name: 'the park camper',
  price: 997,
});

testTour
  .save()
  .then((doc) => {
    console.log('the tour is added !! ');
    console.log(doc);
  })
  .catch((err) => {
    console.log('there is an error !!!!! ');
  }); 
*/
