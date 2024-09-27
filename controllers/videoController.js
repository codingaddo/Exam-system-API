const fs = require("fs");
const path = require("path");
const Video = require("../models/videoModel");

exports.uploadVideoChunk = async (req, res) => {
  try {
    const { videoType } = req.body;
    const student = req.user;
    const chunk = req.file;

    if (!chunk) {
      return res.status(400).json({ message: "No video file uploaded" });
    }

    let videoRecord = await Video.findOne({ student });
    if (!videoRecord) {
      videoRecord = new Video({ student });
    }

    // Define the local directory for saving video chunks
    const uploadDir = path.join(__dirname, "../uploads/videos");

    // Ensure the uploads directory exists, create it if it doesn't
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Define the video file name and path
    const videoFileName = `${student._id}_${Date.now()}.mp4`;
    const videoFilePath = path.join(uploadDir, videoFileName);

    // Write the chunk to the server storage
    fs.writeFileSync(videoFilePath, chunk.buffer);

    // Save the file path or link to the video record
    const localLink = `/uploads/videos/${videoFileName}`;

    if (videoType === "screen") {
      videoRecord.screenVideoLinks.push(localLink);
    } else if (videoType === "camera") {
      videoRecord.cameraVideoLinks.push(localLink);
    }

    // Save the video record to the database
    await videoRecord.save();

    res.status(200).json({
      message: "Video chunk uploaded and stored on server successfully",
    });
  } catch (err) {
    console.error("Error uploading video chunk:", err);
    res.status(500).json({
      message: "Failed to upload video chunk",
      error: err.message,
    });
  }
};
