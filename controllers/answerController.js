const Exam = require("../models/examModel");
const Question = require("../models/questionModel");
const Answer = require("../models/answerModel");

exports.submitAnswers = async (req, res) => {
  try {
    const { answers } = req.body;
    const { examId } = req.params;
    const studentId = req.user._id;
    const exam = await Exam.findById(examId).populate("questions");
    if (!exam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }

    // console.log(`Exam ID: ${examId}`);
    // console.log(`Student ID: ${studentId}`);
    // console.log(`Answers: ${JSON.stringify(answers)}`);

    const student = req.user;
    // Check if student's level and program match the exam's level and program
    if (student.level !== exam.level || student.program !== exam.program) {
      return res
        .status(403)
        .json({ error: "You are not authorized to take this exam" });
    }

    //Calculate score
    let score = 0;
    let totalScore = 0;
    let studentTotalscore = 0;
    for (const answer of answers) {
      const question = await Question.findById(answer.question);
      if (question.correctOption === answer.selectedOption) {
        score += question.points;
        answer.score = question.points;
      }
      totalScore += question.points;
    }
    // Save answers and score to database
    const newAnswer = new Answer({
      examId,
      studentId,
      answers,
      studentTotalscore: score,
      totalScore,
    });
    await newAnswer.save();
    res.status(200).json({
      message: "Answers submitted successfully",
      studentTotalscore: score,
      totalScore,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to submit answers",
      details: error.message,
    });
  }
};
