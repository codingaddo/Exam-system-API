const Exam = require("../models/examModel");
const Question = require("../models/questionModel");
const Answer = require("../models/answerModel");

exports.submitAnswers = async (req, res) => {
  try {
    const { examId, answers } = req.body;
    const student = req.user;

    // Find the exam by ID
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        status: "fail",
        message: "Exam not found",
      });
    }

    // Check if the student's level and program match the exam's level and program
    if (student.level !== exam.level || student.program !== exam.program) {
      return res
        .status(403)
        .json({ error: "You are not authorized to take this exam" });
    }

    // Initialize scores
    let totalScore = 0; // Total points the student scores
    let totalPossiblePoints = 0; // Total possible points for the exam
    const resultDetails = [];

    // Iterate through each answer the student submitted
    for (const answer of answers) {
      // Find the question in the exam
      const question = exam.questions.id(answer.questionId);

      if (!question) {
        resultDetails.push({
          questionId: answer.questionId,
          correct: false,
          message: "Question not found",
        });
        continue;
      }

      // Calculate total possible points for the exam
      totalPossiblePoints += question.points;

      // Check if the answer is correct and assign points
      const correct = question.correctOption === answer.selectedOption;
      const points = correct ? question.points : 0;

      resultDetails.push({
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        correct,
        points,
      });

      // Add points for correct answers to total score
      totalScore += points;
    }

    // Save the result to the Answer model
    const result = await Answer.create({
      examiner: exam.createdBy,
      student,
      exam: examId,
      answers: resultDetails,
      totalScore,
      totalPossiblePoints,
    });

    res.status(200).json({
      status: "success",
      data: {
        resultId: result._id,
        examiner: exam.createdBy,
        student,
        examId,
        totalScore,
        totalPossiblePoints,
        resultDetails,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Server error",
      error: err.message,
    });
  }
};

exports.getMyResult = async (req, res) => {
  try {
    const studentId = req.user._id; // Assuming req.user contains the authenticated student's data

    // Find all results that belong to the student
    const results = await Answer.find({ student: studentId }).populate("exam"); // Populating exam info (optional)

    // If no results are found
    if (!results || results.length === 0) {
      return res
        .status(404)
        .json({ error: "No results found for this student" });
    }

    res.status(200).json({
      status: "success",
      data: {
        results,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Server error",
      error: err.message,
    });
  }
};

// exports.submitAnswers = async (req, res) => {
//   try {
//     const { answers } = req.body;
//     const { examId } = req.params;
//     const studentId = req.user._id;
//     const exam = await Exam.findById(examId).populate("questions");
//     if (!exam) {
//       return res.status(404).json({
//         message: "Exam not found",
//       });
//     }

//     const student = req.user;
//     // Check if student's level and program match the exam's level and program
//     if (student.level !== exam.level || student.program !== exam.program) {
//       return res
//         .status(403)
//         .json({ error: "You are not authorized to take this exam" });
//     }

//     //Calculate score
//     let score = 0;
//     let totalScore = 0;
//     let studentTotalscore = 0;
//     for (const answer of answers) {
//       const question = await Question.findById(answer.question);
//       if (question.correctOption === answer.selectedOption) {
//         score += question.points;
//         answer.score = question.points;
//       }
//       totalScore += question.points;
//     }
//     // Save answers and score to database
//     const newAnswer = new Answer({
//       examId,
//       studentId,
//       answers,
//       studentTotalscore: score,
//       totalScore,
//     });
//     await newAnswer.save();
//     res.status(200).json({
//       message: "Answers submitted successfully",
//       studentTotalscore: score,
//       totalScore,
//     });
//   } catch (error) {
//     res.status(500).json({
//       error: "Failed to submit answers",
//       details: error.message,
//     });
//   }
// };
