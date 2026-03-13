const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

router.get('/', reviewController.getReviewPage);
router.get('/mine', reviewController.getUserReviewPage);
router.post('/', reviewController.createReview);

module.exports = router;
