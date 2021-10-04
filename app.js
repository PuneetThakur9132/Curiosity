// ************ NPM MODULES **********//
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const ejsMate = require("ejs-mate");
const path = require("path");

const Question = require("./models/question");
const Answer = require("./models/answer");

const ExpressError = require("./utils/ExpressError");
const catchAsync = require("./utils/catchAsync");

//****** CONNECTING DATABASE****** //
mongoose.connect("mongodb://localhost:27017/Curiosity", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // for serving static assets

//********ALL ROUTES *********//

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/home", async (req, res) => {
  res.render("home");
});

app.get("/questions", async (req, res) => {
  const category = req.query.category;
  const questions = await Question.find({ category });
  res.render("questions", { questions });
});

app.get("/questions/:id", async (req, res) => {
  const { id } = req.params;
  const question = await Question.findById(id).populate("answers");
  res.render("questionPage", { question });
});

app.post("/newanswer", async (req, res) => {
  const answerContent = req.body.answer;
  const questionId = req.body.questionId;

  const question = await Question.findById(questionId);
  const answer = new Answer({
    content: answerContent,
    question: questionId,
  });
  await answer.save();
  question.answers.push(answer);
  await question.save();
  console.log(question);
  res.redirect(`/questions/${questionId}`);
});

app.post("/askquestion", async (req, res) => {
  const statement = req.body.statement;
  const category = req.body.category;
  const question = new Question({
    statement: statement,
    category: category,
  });
  await question.save();
  res.redirect(`/questions?category=${category}`);
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No , Something Went Wrong";
  if (err.statusCode === 404) {
    return res.status(statusCode).render("page404", { err });
  }
  res.status(statusCode).render("error", { err });
});
app.listen(3000, () => {
  console.log("SERVING ON PORT 3000");
});
