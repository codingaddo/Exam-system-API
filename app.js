const express = require("express");
const app = express();
const cookieparser = require("cookie-parser");
const bodyParser = require("body-parser");
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");
const userRouter = require("./routes/userRoutes");
const examRouter = require("./routes/examRoute");
const answerRouter = require("./routes/answerRoute");
const videoRouter = require("./routes/videoRoute");

app.use((req, res, next) => {
  console.log("hello from the middleware");
  req.requesTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

app.use(cors());
app.options("*", cors());
app.use(express.json());
app.use(cookieparser());
app.use(mongoSanitize());

///Mounting routers

app.use("/api/v1/users", userRouter);
app.use("/api/v1/exams", examRouter);
app.use("/api/v1/answers", answerRouter);
app.use("/api/v1/video", videoRouter);

module.exports = app;
