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
router
  .route("/play-videos/:videoType/:examId/:studentId")
  .get(protect, streamVideo);

router.route("/get-videos").get(protect, getVideos);
// router.route("/pay-video").post(protect,  streamVideo);

module.exports = router;
