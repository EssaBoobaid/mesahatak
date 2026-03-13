const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.get('/', bookingController.getBookingPage);
router.post('/', bookingController.createBooking);
router.get('/availability', bookingController.getAvailability);
router.get('/:id/payment', bookingController.getPaymentPage);
router.post('/:id/pay', bookingController.submitPayment);
router.get('/:id/print', bookingController.printBooking);

module.exports = router;
