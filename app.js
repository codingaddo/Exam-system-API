const express = require("express");
const app = express();
const userRouter = require("./routes/userRoutes");
const examRouter = require("./routes/examRoute");

app.use(express.json());

///Mounting routers
// app.use("/api/v1/users", userRouter);
// app.use("/api/v1/exams", examRouter);
module.exports = app;
