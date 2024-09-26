const { Dropbox } = require("dropbox");
const fs = require("fs");
const Video = require("../models/videoModel");
const fetch = require("isomorphic-fetch");

// Initialize Dropbox
const dbx = new Dropbox({
  accessToken: process.env.DROPBOX_ACCESS_TOKEN,
  fetch: fetch,
});

exports.uploadVideoChunk = async (req, res) => {
  try {
    const { examId, videoType } = req.body; // "screen" or "camera"
    const student = req.user; // Getting the user submitting the video
    const chunk = req.file; // Assuming video upload is handled as a Buffer

    let videoRecord = await Video.findOne({ student, exam: examId });
    if (!videoRecord) {
      videoRecord = new Video({ student, exam: examId });
    }

    // Temporary local path for the video chunk
    const tempFilePath = `./uploads/${chunk.originalname}`;

    // Write the chunk to a temporary file
    fs.writeFileSync(tempFilePath, chunk.buffer);

    // Upload the file chunk to Dropbox
    const dropboxPath = `/exam_videos/${videoType}/${
      student._id
    }_${examId}_${Date.now()}.mp4`;

    const response = await dbx.filesUpload({
      path: dropboxPath,
      contents: fs.readFileSync(tempFilePath), // Read video chunk from local storage
    });

    // Get the temporary link for accessing the file from Dropbox
    const tempLink = await dbx.filesGetTemporaryLink({
      path: response.path_display,
    });

    // Save the Dropbox link in the database
    if (videoType === "screen") {
      videoRecord.screenVideoLinks.push(tempLink.link);
    } else if (videoType === "camera") {
      videoRecord.cameraVideoLinks.push(tempLink.link);
    }

    // Clean up: Delete the temporary file after uploading
    fs.unlinkSync(tempFilePath);

    await videoRecord.save();
    res.status(200).json({
      message: "Video chunk uploaded and stored in Dropbox successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to upload video chunk",
      error: err.message,
    });
  }
};
