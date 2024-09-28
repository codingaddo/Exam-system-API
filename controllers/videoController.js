const fs = require("fs");
const path = require("path");
const Video = require("../models/videoModel");

exports.uploadVideoChunk = async (req, res) => {
  try {
    const { videoType, exam } = req.body;
    const student = req.user;
    const chunk = req.file;

    if (!chunk) {
      return res.status(400).json({ message: "No video file uploaded" });
    }

    let videoRecord = await Video.findOne({ student, exam });
    if (!videoRecord) {
      videoRecord = new Video({ student, exam });
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

exports.getVideos = async (req, res) => {
  try {
    // Assuming req.user is the lecturer making the request (after authentication)
    const lecturer = req.user;

    // Find all exams that were created by the lecturer
    const examsCreatedByLecturer = await Exam.find({ createdBy: lecturer._id });

    if (!examsCreatedByLecturer || examsCreatedByLecturer.length === 0) {
      return res
        .status(404)
        .json({ message: "No exams found for this lecturer" });
    }

    // Get the exam IDs created by the lecturer
    const examIds = examsCreatedByLecturer.map((exam) => exam._id);

    // Find videos where the exam belongs to the lecturer's exams
    const videos = await Video.find({ exam: { $in: examIds } })
      .populate("student", "name email") // Populate student details (e.g., name, email)
      .populate("exam", "title createdBy") // Populate exam details (e.g., title, createdBy)
      .exec();

    if (videos.length === 0) {
      return res
        .status(404)
        .json({ message: "No videos found for this lecturer's exams" });
    }

    // Respond with the videos
    res.status(200).json({
      message: "Videos retrieved successfully",
      videos,
    });
  } catch (err) {
    console.error("Error retrieving videos:", err);
    res.status(500).json({
      message: "Failed to retrieve videos",
      error: err.message,
    });
  }
};

exports.streamVideo = async (req, res) => {
  try {
    const { videoType, examId, studentId } = req.params;

    // Find the video record for the given student and exam
    const videoRecord = await Video.findOne({
      exam: examId,
      student: studentId,
    });

    if (!videoRecord) {
      return res
        .status(404)
        .json({ message: "No video found for this student and exam" });
    }

    // Select the video links based on the videoType (camera or screen)
    let videoLinks;
    if (videoType === "camera") {
      videoLinks = videoRecord.cameraVideoLinks;
    } else if (videoType === "screen") {
      videoLinks = videoRecord.screenVideoLinks;
    } else {
      return res.status(400).json({ message: "Invalid video type" });
    }

    // If no video links available
    if (!videoLinks || videoLinks.length === 0) {
      return res.status(404).json({ message: "No video chunks available" });
    }

    // Get the video file path of the first chunk (for demo purposes, we're streaming one chunk)
    const videoPath = path.join(__dirname, "..", videoLinks[0]);

    // Check if video exists
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ message: "Video file not found" });
    }

    // Get the video stats (e.g., file size)
    const videoStat = fs.statSync(videoPath);
    const fileSize = videoStat.size;
    const videoRange = req.headers.range;

    // Check if Range header is provided
    if (videoRange) {
      const parts = videoRange.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const videoStream = fs.createReadStream(videoPath, { start, end });

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "video/mp4",
      });

      videoStream.pipe(res);
    } else {
      // If no range, send the whole file
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      });

      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (err) {
    console.error("Error streaming video:", err);
    res
      .status(500)
      .json({ message: "Error streaming video", error: err.message });
  }
};
