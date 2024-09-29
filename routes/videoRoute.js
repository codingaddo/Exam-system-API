const express = require("express");
const multer = require("multer");
const { protect } = require("../controllers/authController");
const {
  uploadVideoChunk,
  streamVideo,
  getVideos,
} = require("../controllers/videoController");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.route("/").post(protect, upload.single("videoFile"), uploadVideoChunk);
router.route("/play-video/:videoType/:examId/:studentId").get(streamVideo);

router.route("/get-videos").get(protect, getVideos);

module.exports = router;
