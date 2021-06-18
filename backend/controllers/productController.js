const { listeners } = require('../models/product')
const Product = require('../models/product')
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors')
const APIFeatures = require('../utils/apiFeatures')

//Create new Product
exports.newProduct = catchAsyncErrors(async (req, res, next) => {
  req.body.user = req.user.id

  const product = await Product.create(req.body)

  res.status(201).json({
    success: true,
    product,
  })
})

//Get all products
exports.getProducts = catchAsyncErrors(async (req, res, next) => {
  const resultPerPage = 4
  const productCount = await Product.countDocuments()

  const apiFeatures = new APIFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage)

  const products = await apiFeatures.query

  res.status(200).json({
    success: true,
    count: products.length,
    products,
  })
})

//Get Single Product
exports.getSingleProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    return next(new ErrorHandler('Product Not Found', 404))
  }

  res.status(200).json({
    success: true,
    product,
  })
})

//Update Product
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id)

  if (!product) {
    return next(new ErrorHandler('Product Not Found', 404))
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  })

  res.status(200).json({
    success: true,
    product,
  })
})

//Delete Product
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id)

  if (!product) {
    return next(new ErrorHandler('Product Not Found', 404))
  }

  // product = await Product.findByIdAndDelete(req.params.id)
  await product.remove()

  res.status(200).json({
    success: true,
    message: `Product ${product.id} Deleted`,
  })
})

//Create/Update Review

exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, productId } = req.body

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  }

  const product = await Product.findById(productId)

  const isReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  )

  if (isReviewed) {
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user._id.toString()) {
        review.comment = comment
        review.rating = rating
      }
    })
  } else {
    product.reviews.push(review)
    product.numOfReviews = product.reviews.length
  }

  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length

  await product.save({ validateBeforeSave: false })

  res.status(200).json({
    success: true,
  })
})
