const express = require("express");
const router = express.Router();

const pageController = require("../controllers/pageController");

router.get("/", pageController.homePage);

router.get("/simplify", pageController.dashboardPage);

module.exports = router;