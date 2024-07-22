const express = require("express");
const { submitAnswers } = require("../controllers/answerController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.route("/exams/:examId/submit").post(protect, submitAnswers);
module.exports = router;
