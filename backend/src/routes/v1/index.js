const express = require("express");

const router = express.Router();
const helpController = require("../../controllers/helpController");
const airlineController = require("../../controllers/airlineController");
const flightController = require("../../controllers/flightController");
const reviewController = require("../../controllers/reviewController");
const bookingController = require("../../controllers/bookingController");
const aiController = require('../../controllers/aiController');

router.get("/help", helpController.helpDetails);
router.post("/airline", airlineController.createAirline);
router.get("/airline/:name", airlineController.getAirline);
router.get("/airline", airlineController.getAllAirlines);
router.delete("/airline", airlineController.destroyAirline);

router.post("/flight", flightController.createFlight);
router.get("/flight/:flightNumber", flightController.getFlight);
router.get("/flight", flightController.getAllFlights);
router.delete("/flight", flightController.destroyFlight);


router.post("/review", reviewController.createReview);
router.get("/review/:flightId", reviewController.getAllReviews);
router.get("/review/:flightId/:userId", reviewController.getReview);
router.delete("/review/:flightId", reviewController.destroyReview);

router.post("/booking", bookingController.createBooking);
router.get("/booking/:id/boardingPass", bookingController.getBoardingPass);
router.delete("/booking/:id", bookingController.cancelBooking);
router.get("/booking", bookingController.getUserBookings);

router.post('/ai/chat', aiController.chat);
router.post('/ai/recommendations', aiController.recommendations);
router.post('/ai/pricing-insight', aiController.pricingInsight);
module.exports = router;