import express from 'express';
import { verifyAdmin, verifyToken, verifyUser } from '../utils/verifyToken.js';
import { addProductReview, addSiteReview, deleteReview, getAverageReviewRating, getProductReviews, getSiteReviews, getUserReviewCounts, getUserReviews, getUserTopReviewedProducts, updateReview } from '../controllers/review.js';

const router = express.Router();

// for site 
router.get('/', verifyToken, getSiteReviews)
router.post('/', verifyToken, addSiteReview)

//for products
router.get('/product/:productId', verifyToken, getProductReviews)
router.post('/product/:productId', verifyToken, addProductReview)

//only user can edit or delete their own reviews
router.put('/:reviewId', /* verifyUser */verifyToken, updateReview)
router.delete('/:reviewId', /* verifyUser||verifyAdmin */verifyToken, deleteReview)


router.get('/average/:productId', verifyToken, getAverageReviewRating)

// for user
router.get('/user/:userId', verifyToken, getUserReviews)
router.get('/user/counts/:user', verifyToken, getUserReviewCounts)
router.get('/user/topReviews/:userId', verifyToken, getUserTopReviewedProducts)



export default router;