const express = require("express");
const multer = require("multer");
const { protect } = require("../controllers/authController");
const { uploadVideoChunk } = require("../controllers/videoController");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.route("/").post(protect, upload.single("videoFile"), uploadVideoChunk);

module.exports = router;
