const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.ObjectId,
    ref: "Exam",
  },
  studentId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  answers: [
    {
      question: {
        type: mongoose.Schema.ObjectId,
        ref: "Question",
      },
      selectedOption: Number,
      score: {
        type: Number,
        default: 0,
      },
      completedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  totalScore: {
    type: Number,
    default: 0,
  },
  studentTotalscore: {
    type: Number,
    default: 0,
  },
});

const Answer = mongoose.model("Answer", answerSchema);

module.exports = Answer;
