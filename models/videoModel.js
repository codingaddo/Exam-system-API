// const mongoose = require("mongoose");

// const videoSchema = new mongoose.Schema({
//   student: {
//     type: mongoose.Schema.ObjectId,
//     ref: "User",
//     // required: true,
//   },
//   exam: {
//     type: mongoose.Schema.ObjectId,
//     ref: "Exam",
//     // required: true,
//   },
//   screenVideoChunks: [
//     {
//       type: String,
//       required: true,
//     },
//   ],
//   cameraVideoChunks: [
//     {
//       type: String,
//       required: true,
//     },
//   ],
//   createdAt: { type: Date, default: Date.now },
// });

// const Video = mongoose.model("Video", videoSchema);

// module.exports = Video;

const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  exam: {
    type: mongoose.Schema.ObjectId,
    ref: "Exam",
    // required: true,
  },
  screenVideoLinks: {
    type: [String], // Array to store multiple Dropbox links for screen video chunks
    default: [],
  },
  cameraVideoLinks: {
    type: [String], // Array to store multiple Dropbox links for camera video chunks
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Video = mongoose.model("Video", videoSchema);
module.exports = Video;
