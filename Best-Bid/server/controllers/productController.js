const Product = require("../model/productModel");
const ErrorHander = require("../utils/errorHander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");
const cloudinary = require("cloudinary");
const admin = require('firebase-admin');
const serviceAccount = require("../credentials.json");
const jwt = require("jsonwebtoken");
const User = require("../model/userSchema");


exports.createProduct = catchAsyncErrors(async (req, res) => {
    console.log(`Create Product Function from Route Called`);
  
    try {
  
      // Continue with your code to create the product
      let images = [];
  
      if (typeof req.body.images === 'string') {
        // Single Image received
        images.push(req.body.images);
      } else {
        images = req.body.images;
      }
  
      const imagesLink = [];
  
      for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
          folder: 'products',
        });
  
        imagesLink.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }
  
      // Uploaded on Cloudinary, and links of those images added to the database
      req.body.images = imagesLink;
  
      // Create the product with the authenticated user as the seller
      let product = new Product(req.body);
      product.seller = req.userID;
      await product.save();
  
      res.status(201).json({
        success: true,
        product,
      });
    } catch (err) {
      console.error('Error verifying Firebase ID token:', err);
      res.status(401).send('Unauthorized: No valid token provided');
    }
  });



// GET ALL PRODUCT ->> WORKING 
exports.getAllProducts = catchAsyncErrors(async (req,res) => {
// API FEATURE TAKES -> QUERY & QUERYSTR
    const resultPerPage = 9;
const productCount = await Product.countDocuments({ 'bidEnd': { $gt: new Date() }});
// find({ 'bidEnd': { $gt: new Date() }}) -> IF BID ENDED -> NOT SHOWN IN RESULT
    const apiFeature = new ApiFeatures(Product.find({ 'bidEnd': { $gt: new Date() }}).populate('seller', '_id name phone email').populate('bids.bidder', '_id name ') , req.query)
    .search()
    .filter()
    .pagination(resultPerPage);
    const products = await apiFeature.query;

res.status(200).json({
    success:true,
    products,
    productCount,
    resultPerPage,
    });

});

// UPDATE PRODUCTS  ->> WORKING 
exports.updateProduct = catchAsyncErrors(async (req , res , next) =>{
    let product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHander("Product Not Found" , 404));
     }

// AFTER PRODUCT FOUND -> IMAGES START HERE 


let images = [];

if (typeof req.body.images === "string") {
    // Single Image recived

    images.push(req.body.images);

}
else {

    images = req.body.images;

}


if( images !== undefined){

for(let i = 0 ; i<product.images.length ; i++){
    await cloudinary.v2.uploader.destroy(product.images[i].public_id);

}

const imagesLink = [];

for (let i = 0; i < images.length; i++) {
    
    const result = await cloudinary.v2.uploader.upload( images[i], {
        folder:"products",
    } );

imagesLink.push({
    public_id:result.public_id,
        url: result.secure_url,
});

}

req.body.images = imagesLink;

}

    product = await Product.findByIdAndUpdate(req.params.id , req.body , {
        new:true,
        runValidators:true,
        useFindAndModify:false
    });

    res.status(200).json({
        success:true,
        product
    });
});


// TO DELETE PRODUCT -->> WORKING
exports.deleteProduct = catchAsyncErrors(async (req , res , next) => {

    const product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHander("Product Not Found" , 404));
     }

    await product.remove();

    res.status(200).json({
        success:true,
        message:"Product Deleted"
    });
});


exports.getMyProducts = catchAsyncErrors(async (req, res) => {
    try {
      
      // Continue with your code to fetch seller products
      let sellerproducts = await Product.find({ seller: req.userID })
        .populate('seller', '_id name phone')
        .populate('bids.bidder', '_id name phone');
  
      console.log('myProduct page Called');
      res.status(200).json({
        success: true,
        sellerproducts,
      });
    } catch (err) {
      console.error('Error verifying Firebase ID token:', err);
      res.status(401).send('Unauthorized: No valid token provided');
    }
  });

  exports.getBiddedProduct = catchAsyncErrors(async (req, res) => {
        try {
        
          
          // Continue with your code to fetch bidded products
          let myproducts = await Product.find({ 'bids.bidder': req.userID })
            .populate('seller', '_id name phone')
            .populate('bids.bidder', '_id name phone');
      
          res.status(200).json({
            success: true,
            myproducts,
          });
        } catch (err) {
          console.error('Error verifying Firebase ID token:', err);
          res.status(401).send('Unauthorized: No valid token provided');
        }
      });

// GET PRODUCT DETAILS
exports.getProductDetails = catchAsyncErrors(async (req , res , next) => {

    const product = await Product.findById(req.params.id).populate('seller', ' _id name phone email').populate('bids.bidder', '_id name phone email');
    const sellerDetails = product.seller;


// Bid Winner
// // const bidWinnner = await Product.find({_id : req.params.id}).sort({"bids.bid" : -1}).limit(1).populate('bids.bidder', '_id name phone');
// var countdownDate = new Date(product.bidEnd).getTime();
//       var now = new Date().getTime();

var winStatus;

    const bidWinnner = product.bids;

    var maxWin = Math.max.apply(Math, bidWinnner.map(function(o) { return o.bid; }));
    
    console.log(maxWin);
    
    
    var result;
    bidWinnner.forEach(function (arrayItem) {
        if(arrayItem.bid === maxWin){
        // console.log(arrayItem);
        // console.log(JSON.stringify(arrayItem));
        // let userObj = JSON.parse(arrayItem);
        result =  arrayItem;
        return;
        }
    });
    
     winStatus = result;

    // console.log(result.bidder);
    // console.log(result.bidder.phone);
    // console.log(result.bidder.email);
    console.log(winStatus);
    
    



    if(!product){
       return next(new ErrorHander("Product Not Found" , 404));
    }

    res.status(200).json({
        success:true,
        product,
        sellerDetails,
        winStatus,
    });

});





// PLACE BID ON PRODUCTS
// placeBidOnProduct

exports.placeBidOnProduct = catchAsyncErrors(async  (req ,res) => {
    console.log(`Place Bid  On Product Function from Route Called`);


    try {
      const bid = {
        bidder: req.userID,
        bid: req.body.bidAmmount,
        time: Date.now(),
      };
    
      
    
      let product = await Product.findById(req.body.productId);
    
      if (!product) {
        return next(new ErrorHander('Product Not Found', 404));
      }
    
      // UPDATE BID ON PRODUCTS
      product = await Product.findByIdAndUpdate(
        req.body.productId,
        {
          $push: { bids: bid },
        },
        {
          new: true,
          runValidators: true,
          useFindAndModify: false,
        }
      );
    
      res.status(201).json({
        success: true,
        product,
      });
    } catch (err) {
      console.error('Error verifying Firebase ID token:', err);
      res.status(401).send('Unauthorized: No valid token provided');
    }

});