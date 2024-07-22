const User = require("../models/userModel");

//1) Verify user by id
exports.verifyUser = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedUser = await User.findByIdAndUpdate(
      { _id: id },
      { isVerified: true },
      { new: true, runValidators: false }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User verified successfully" });
  } catch (error) {
    res.status(500).json({
      error: "Failed to verify user",
      details: error.message,
    });
  }
};
//2)Verify all users
