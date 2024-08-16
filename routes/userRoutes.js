const express = require("express");

const {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const { protect, restrictTo } = require("../controllers/authController");

const {
  verifyUser,
  verifyUsers,
  verifySelected,
  createUser,
  deleteUser,
  getStudents,
  getLecturers,
  getUsers,
  updateUser,
  getMe,
} = require("../controllers/userController");

const router = express.Router();
router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);

router.route("/verify/:id").patch(protect, restrictTo("admin"), verifyUser);
router.route("/verify-users").patch(protect, restrictTo("admin"), verifyUsers);
router
  .route("/verify-selected")
  .patch(protect, restrictTo("admin"), verifySelected);
router.route("/create-user").post(protect, restrictTo("admin"), createUser);

router.route("/delete/:id").delete(protect, restrictTo("admin"), deleteUser);

router.route("/get-students").get(protect, restrictTo("admin"), getStudents);

router.route("/get-lecturers").get(protect, restrictTo("admin"), getLecturers);

router.route("/get-users").get(protect, restrictTo("admin"), getUsers);

router.route("/update/:id").patch(protect, restrictTo("admin"), updateUser);

router.route("/me").get(protect, getMe);

module.exports = router;
