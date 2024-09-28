const express = require("express");
const {
  submitAnswers,
  getMyResult,
  getResults,
} = require("../controllers/answerController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.route("/write/:examId/submit").post(protect, submitAnswers);
router.route("/getMyResult").get(protect, getMyResult);
router.route("/getResult").get(protect, getResults);
module.exports = router;
