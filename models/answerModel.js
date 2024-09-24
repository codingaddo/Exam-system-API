// const mongoose = require("mongoose");

// const answerSchema = new mongoose.Schema({
//   examId: {
//     type: mongoose.Schema.ObjectId,
//     ref: "Exam",
//   },
//   studentId: {
//     type: mongoose.Schema.ObjectId,
//     ref: "User",
//   },
//   answers: [
//     {
//       question: {
//         type: mongoose.Schema.ObjectId,
//         ref: "Question",
//       },
//       selectedOption: Number,
//       score: {
//         type: Number,
//         default: 0,
//       },
//       completedAt: {
//         type: Date,
//         default: Date.now,
//       },
//     },
//   ],
//   totalScore: {
//     type: Number,
//     default: 0,
//   },
//   studentTotalscore: {
//     type: Number,
//     default: 0,
//   },
// });

// const Answer = mongoose.model("Answer", answerSchema);

// module.exports = Answer;

const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  exam: {
    type: mongoose.Schema.ObjectId,
    ref: "Exam",
    required: true,
  },
  examiner: {
    type: mongoose.Schema.ObjectId,
    ref: "Exam",
  },
  answers: [
    {
      questionId: {
        type: mongoose.Schema.ObjectId,
        ref: "Question",
        required: true,
      },
      selectedOption: {
        type: Number,
      },
      correct: {
        type: Boolean,
        required: true,
      },
      points: {
        type: Number,
        required: true,
      },
    },
  ],
  totalScore: {
    type: Number,
    default: 0,
  },
  totalPossiblePoints: {
    type: Number,
    default: 0,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

const Answer = mongoose.model("Answer", answerSchema);

module.exports = Answer;
