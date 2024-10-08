const Exam = require("../models/examModel");
const Question = require("../models/questionModel");
const Answer = require("../models/answerModel");

exports.createExam = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      level,
      program,
      questions,
      courseCode,
      sittingDate,
      duration,
    } = req.body;

    // Calculate total points based on questions
    const totalPoints = questions.reduce((total, question) => {
      return total + (question.points || 0); // assuming each question has a points field
    }, 0);

    const exam = new Exam({
      title,
      description,
      courseCode,
      sittingDate,
      date,
      level,
      program,
      questions,
      totalPoints,
      createdBy: req.user._id,
      duration,
    });

    const savedExam = await exam.save();
    res.status(201).json(savedExam);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create exam", details: error.message });
  }
};

//Get all available exams with program and level === the student
exports.getExamForStudents = async (req, res) => {
  try {
    const { level, program, _id: studentId } = req.user;
    const exams = await Exam.find({ program, level });
    if (!exams || exams.length === 0) {
      return res
        .status(404)
        .json({ error: "No exam found for your program and level" });
    }

    // Get all exams the student has already submitted
    const submittedExams = await Answer.find({ student: studentId }).select(
      "exam"
    );

    const submittedExamIds = new Set(
      submittedExams.map((submitted) => submitted.exam.toString())
    );

    // Filter out the submitted exams
    const availableExams = exams.filter(
      (exam) => !submittedExamIds.has(exam._id.toString())
    );

    res.status(200).json({
      status: "success",
      data: {
        availableExams,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      error: error.message,
    });
  }
};

///Get exam questions
exports.getExam = async (req, res) => {
  try {
    const examId = req.params.id;
    const exam = await Exam.findById(examId).populate("questions");
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }
    res.status(200).json({
      status: "success",
      data: {
        exam,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "faied",
      error: error.message,
    });
  }
};

// Add questions to an exam
exports.addQuestionToExam = async (req, res) => {
  try {
    const { examId } = req.params; // Get examId from URL parameters
    const { questions } = req.body; // questions should be an array of question objects

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    const newQuestions = await Question.insertMany(questions); // Insert all questions at once

    newQuestions.forEach((question) => {
      exam.questions.push(question._id); // Add each question's ID to the exam's questions array
    });

    await exam.save(); // Save the updated exam with the new questions

    res.status(200).json(exam); // Respond with the updated exam document
  } catch (error) {
    res.status(500).json({
      error: "Failed to add questions to exam",
      details: error.message,
    });
  }
};
