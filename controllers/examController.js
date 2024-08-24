const Exam = require("../models/examModel");
const Question = require("../models/questionModel");

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

    const exam = new Exam({
      title,
      description,
      courseCode,
      sittingDate,
      date,
      level,
      program,
      questions,
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
