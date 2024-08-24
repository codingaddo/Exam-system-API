const Exam = require("../models/examModel");
const Question = require("../models/questionModel");
const Answer = require("../models/answerModel");

exports.submitAnswers = async (req, res) => {
  try {
    const { examId, answers } = req.body;
    const student = req.user;

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        status: "fail",
        message: "Exam not found",
      });
    }
    if (student.level !== exam.level || student.program !== exam.program) {
      console.log(student.level);
      console.log(student.program);
      console.log(exam.program);
      console.log(exam.level);

      return res
        .status(403)
        .json({ error: "You are not authorized to take this exam" });
    }
    let totalScore = 0;
    const resultDetails = [];

    for (const answer of answers) {
      const question = exam.questions.id(answer.questionId);

      if (!question) {
        resultDetails.push({
          questionId: answer.questionId,
          correct: false,
          message: "Question not found",
        });
        continue;
      }

      const correct = question.correctOption === answer.selectedOption;
      const points = correct ? question.points : 0;

      resultDetails.push({
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        correct,
        points,
      });

      totalScore += points;
    }

    // Save the result to the Result model
    const result = await Answer.create({
      examiner: exam.createdBy,
      student,
      exam: examId,
      answers: resultDetails,
      totalScore,
    });

    res.status(200).json({
      status: "success",
      data: {
        resultId: result._id,
        examiner: exam.createdBy,
        student,
        examId,
        totalScore,
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
