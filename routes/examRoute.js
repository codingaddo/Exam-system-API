const express = require("express");
const router = express.Router();
const { protect } = require("../controllers/authController");
const {
  addQuestionToExam,
  createExam,
} = require("../controllers/examController");

router.route("/create").post(protect, createExam);
router.route("/add-question/:examId").post(protect, addQuestionToExam);

module.exports = router;
