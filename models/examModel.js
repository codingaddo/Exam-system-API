const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Exam title is required"],
    },
    description: {
      type: String,
      required: true,
    },
    sittingDate: {
      type: Date,
      // required: true,
    },
    createdAt: { type: Date, default: Date.now },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "An exam must belong to a user"],
    },
    questions: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Question",
        required: [true, "At least one question is required for an exam"],
      },
    ],
    level: {
      type: String,
      required: [true, "Exam level is required"],
      enum: ["100", "200", "300", "400"],
    },
    program: {
      type: String,
      required: [true, "Program is required"],
    },
    courseCode:{
      type: String,
      required: [true, "Course code is required"],
    },
    duration: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

examSchema.pre(/^find/, function (next) {
  this.populate({
    path: "createdBy",
    select: "name avatar email",
  });

  next();
});

const Exam = mongoose.model("Exam", examSchema);
module.exports = Exam;
