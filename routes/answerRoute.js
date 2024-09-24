const express = require("express");
const {
  submitAnswers,
  getMyResult,
} = require("../controllers/answerController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.route("/write/:examId/submit").post(protect, submitAnswers);
router.route("/getMyResult").get(protect, getMyResult);
module.exports = router;
