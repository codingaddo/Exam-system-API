const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      required: [true, "question must have at least two options"],
    },
    correctOption: {
      type: Number,
      required: true,
      validate: {
        validator: function (value) {
          return value >= 0 && value < this.options.length;
        },
        message: "Invalid index for correct option",
      },
    },
    points: {
      type: Number,
      default: 1, // Default points for each question if not specified
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Question = mongoose.model("Question", questionSchema);

module.exports = Question;
