const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }

  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    level: req.body.level,
    program: req.body.program,
    email: req.body.email,
    studentId: req.body.studentId,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    // role: req.body.role,
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASS,
    },
  });

  const email = transporter.sendMail({
    from: `Exam System <${process.env.EMAIL_FROM}>`,
    to: newUser.email,
    subject: "Hello, Welcome",
    text: "You exam account is successfully registered, contact your admin for account verification",
    html: "<b>You exam account is successfully registered, contact your admin for account verification</b>",
  });
  console.log("Email Sent");

  createSendToken(newUser, 201, req, res);

  //   res.status(201).json({
  //     status: "success",
  //   });
});

exports.login = catchAsync(async (req, res, next) => {
  const { emailOrId, password } = req.body;
  if (!emailOrId || !password) {
    return res.status(400).json({
      status: "fail",
      message: "please provide your email / id and password",
    });
  }

  const isEmail = emailOrId.includes("@");
  const user = isEmail
    ? await User.findOne({ email: emailOrId }).select("+password")
    : await User.findOne({ studentId: emailOrId }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return res.status(401).json({
      status: "fail",
      message: "invalid email/id or password",
    });
  }

  if (!user.isVerified) {
    return res.status(400).json({ message: "User not verified" });
  }

  createSendToken(user, 200, req, res);
  next();
});

exports.logout = async (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
    message: "logged out successfully",
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({
      status: "fail",
      message: "you are not logged in, please login",
    });
  }

  //Verify Token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //   console.log(decoded);

  //Check if user still exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return res.status(401).json({
      status: "fail",
      message: "the user belonging to this token no longer exist",
    });
  }

  if (currentUser.passwordChangedAfter(decoded.iat)) {
    return res.status(401).json({
      status: "fail",
      message: "user recently changed password, please login again",
    });
  }
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "fail",
        message: "you do not have permission to perform this action",
      });
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "user not found",
    });
  }

  let resetToken;
  resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASS,
      },
    });

    const email = await transporter.sendMail({
      from: `Exam System <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: "Password Reset Token",
      text: `Your password reset token, click on this👉 ${resetUrl} link to reset  your password,(valid for 10mins)`,
      html: `
    <p>Your password reset token is ready. Please click on the link below to reset your password:</p>
    <a href="${resetUrl}" target="_blank">${resetUrl}</a>
    <br /><br />
    <p>Or, click the button below to reset your password:</p>
    <a href="${resetUrl}" target="_blank" 
       style="
         background-color: #007bff;
         color: white;
         padding: 10px 20px;
         text-decoration: none;
         border-radius: 5px;
         display: inline-block;
       "
    >
      Reset Password
    </a>
    <br /><br />
    <p>This link will be valid for 10 minutes.</p>
    <br /><br />
    <h1>Ignore this email if you did not request for password reset</h1>


  `,
    });
    console.log("Password reset token Sent");

    res.status(200).json({
      status: "success",
      message: "Password reset token sent to your email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(500).json({
      status: "fail",
      message: "There was an error sending the reset token to your email",
      // message: err,
    });
  }
  next();
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user)
    return res.status(400).json({
      status: "fail",
      message: "token is invalid or has expired",
    });

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  createSendToken(user, 200, req, res);
});
