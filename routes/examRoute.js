const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../controllers/authController");
const {
  addQuestionToExam,
  createExam,
} = require("../controllers/examController");
const { submitAnswers } = require("../controllers/answerController");

router
  .route("/create")
  .post(protect, restrictTo("lecturer", "admin"), createExam);
router
  .route("/add-question/:examId")
  .post(protect, restrictTo("lecturer", "admin"), addQuestionToExam);

module.exports = router;
