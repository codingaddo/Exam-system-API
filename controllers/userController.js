const User = require("../models/userModel");
const nodemailer = require("nodemailer");

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

//2)Verify all unVerified users

exports.verifyUsers = async (req, res) => {
  try {
    const verifyAll = await User.updateMany(
      { isVerified: false },
      { isVerified: true }
    );
    res.status(200).json({ message: ` users have been verified` });
  } catch (error) {
    res.status(500).json({
      error: "Failed to verify users",
    });
  }
};

//3) Verify selected users

exports.verifySelected = async (req, res) => {
  const { userIds } = req.body;
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ error: "No selected users" });
  }

  try {
    const selected = await User.updateMany(
      { _id: { $in: userIds }, isVerified: false },
      { isVerified: true }
    );
    res.status(200).json({
      message: `Selected users have been verified`,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to verify selected users" });
  }
};

// Create a Nodemailer transporter object
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_FROM, //  Gmail address
    pass: process.env.EMAIL_PASS, // app-specific password
  },
});

exports.createUser = async (req, res) => {
  try {
    const { name, email, level, role, studentId } = req.body;

    // Generate a default password
    let defaultPass = "";
    let char = "ABCDEFGHIJKLMNOPKRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
    for (let i = 0; i < 8; i++) {
      defaultPass += char.charAt(Math.floor(Math.random() * char.length));
    }

    console.log(defaultPass);

    // Create the new user in the database
    const newUser = await User.create({
      name,
      email,
      level,
      role,
      studentId,
      isVerified: true, // Set to true if already verified
      password: defaultPass,
      passwordConfirm: defaultPass,
    });

    // Set up the email options
    const mailOptions = {
      from: `Exam System <${process.env.EMAIL_FROM}>`,
      to: email, // Receiver email (new user)
      subject: `Welcome`,
      text: `Hello ${name},\n\nYour account has been created successfully.\n\nUsername: ${email}\nPassword: ${defaultPass}\n\nPlease log in and change your password as soon as possible.\n\nBest regards,\nExam System`, // Plain text body
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Send the response back to the client
    res.status(201).json({
      status: "success",
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// exports.createUser = async (req, res) => {
//   try {
//     const { name, email, level, role, studentId } = req.body;

//     let defaultPass = "";
//     let char = "ABCDEFGHIJKLMNOPKRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
//     for (let i = 0; i < 4; i++) {
//       defaultPass += char.charAt(Math.floor(Math.random() * char.length));
//     }

//     console.log(defaultPass);

//     const newUser = await User.create({
//       name,
//       email,
//       level,
//       role,
//       studentId,
//       isVerified: true,
//       password: defaultPass,
//       passwordConfirm: defaultPass,
//     });

//     res.status(201).json({
//       status: "success",
//       data: {
//         user: newUser,
//       },
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: "fail",
//       message: err.message,
//     });
//   }
// };

exports.getStudents = async (req, res) => {
  console.log("hello from the get agents function 🔥");
  try {
    const students = await User.find({
      role: "student",
    });

    res.status(200).json({
      status: "success",
      results: students.length,
      data: {
        students,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getLecturers = async (req, res) => {
  console.log("hello from the get agents function 🔥");
  try {
    const lecturers = await User.find({
      role: "lecturer",
    });

    res.status(200).json({
      status: "success",
      results: lecturers.length,
      data: {
        lecturers,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getUsers = async (req, res) => {
  console.log("hello from the get agents function 🔥");
  try {
    const users = await User.find();

    res.status(200).json({
      status: "success",
      results: users.length,
      data: {
        users,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getMe = async (req, res) => {
  req.params.id = req.user._id;
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res.status(404).json({
        status: "fail",
        //  Error: err,
        message: "No user found",
      });

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      Error: err,
      message: "No user found",
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message:
          "No user found with that ID or you do not have permission to delete this agent",
      });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
