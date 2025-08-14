import mongoose from "mongoose";
import Review from "../models/Review.js";
import { StatusCodes } from "http-status-codes";


//  Site Reviews
export const getSiteReviews = async (req, res,next) => {
    try {
        const reviews = await Review.find({type: "site"}).sort({date: -1});
        res.status(StatusCodes.OK).json(reviews);
    } catch (error) {
        console.log("Error fetching site reviews");
        next(error);
    }
}

// Add Site Review
export const addSiteReview = async (req, res, next) => {
    const userId = req.user.id;
    try {
        const newReview = new Review({type: "site", user: userId , ...req.body });
        await newReview.save();
        res.status(StatusCodes.CREATED).json(newReview);
    } catch (error) {
        console.log("Error adding site review");
        next(error);
    }
}



//  Product Reviews
export const getProductReviews = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const reviews = await Review.find({product:productId}).sort({date: -1});
        res.status(StatusCodes.OK).json(reviews);
    } catch (error) {
        console.log("Error fetching product reviews");
        next(error);
    }
}

// Add Product Review
export const addProductReview = async (req, res, next) => {
    const userId = req.user.id;
    const { productId } = req.params;
    try {
        const newReview = new Review({type: "product", user: userId, product: productId, ...req.body });
        await newReview.save();
        res.status(StatusCodes.CREATED).json(newReview);
    } catch (error) {
        console.log("Error adding product review");
        next(error);
    }
}

// update Review
 // only user who created the review can update it
export const updateReview = async (req, res, next) => {
    const { reviewId } = req.params;
    try {
        const updatedReview = await Review.findByIdAndUpdate(reviewId, req.body, {new: true});
        if (!updatedReview) {
            return next(CreateError(StatusCodes.BAD_REQUEST, "Review not found"));
        }
        res.status(StatusCodes.OK).json(updatedReview);
    } catch (error) {
        console.log("Error updating product review");
        next(error);
    }
}


// delete Review
 // only user who created the review can delete it
export const deleteReview = async (req, res, next) => {
    const { reviewId } = req.params;
    try {
        const deletedReview = await Review.findByIdAndDelete(reviewId);
        if (!deletedReview) {
            return next(CreateError(StatusCodes.BAD_REQUEST, "Review not found"));
        }
        res.status(StatusCodes.OK).json({ message: "Review deleted successfully" });
    } catch (error) {
        console.log("Error deleting product review");
        next(error);
    }
}



//  Average Review
 // calculate average rating for a product or site
export const getAverageReviewRating = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const reviews = await Review.find({product:productId });
        let totalRating = 0;
        reviews.forEach(review => totalRating += review.rating);
        const averageRating = totalRating / reviews.length;
        res.status(StatusCodes.OK).json({ averageRating });
    } catch (error) {
        console.log("Error calculating average review");
        next(error);
    }
}


//  User Reviews
 // get reviews made by a specific user
export const getUserReviews = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const reviews = await Review.find({ user:userId });
        res.status(StatusCodes.OK).json(reviews);
    } catch (error) {
        console.log("Error fetching user reviews");
        next(error);
    }
}


//  User Review Counts
 // get the number of reviews made by each user
export const getUserReviewCounts = async (req, res, next) => {
    try {
        const userCounts = await Review.aggregate([
            {
                $group: {
                    _id: "$user",
                    count: { $sum: 1 }
                }
            }
        ]);
        res.status(StatusCodes.OK).json(userCounts);
    } catch (error) {
        console.log("Error fetching user review counts");
        next(error);
    }
}

//  User Top Reviewed Products
 // get the top reviewed products for each user
 
 export const getUserTopReviewedProducts = async (req, res, next) => {
     try {
         const { userId } = req.params;
 
         // Convert userId to ObjectId
        //  const userObjectId = new mongoose.Types.ObjectId(userId);
 
         const topProducts = await Review.aggregate([
             {
                 $match: { user: userId }, // ✅ Convert to ObjectId for proper matching
                 $match: {type: "product" }
             },
             {
                 $group: {
                     _id: "$product",
                     count: { $sum: 1 },
                     averageRating: { $avg: "$rating" }
                 }
             },
             {
                 $sort: { averageRating: -1, count: -1 }
             },
             {
                 $limit: 5
             }
         ]);
 
         res.status(StatusCodes.OK).json(topProducts);
     } catch (error) {
         console.error("Error fetching user top reviewed products:", error);
         next(error);
     }
 };
 