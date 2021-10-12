const express = require("express");
const router = express.Router();
const Question = require("../models/question");
const Answer = require("../models/answer");
const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn } = require("../middleware/loginAuth");
const newQuestionValidator = require("../middleware/validators/newQuestion");
const getQuestionValidator = require("../middleware/validators/getQuestion");

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/about", (req, res) => {
  res.render("about");
});

router.get("/home", async (req, res) => {
  res.render("home");
});

router.get(
  "/questions",
  getQuestionValidator,
  catchAsync(async (req, res) => {
    const page = req.query.page || 1;

    const category = req.query.category;
    //calculating total pages
    const totalQuestions = await Question.countDocuments({ category });
    const totalPages = Math.ceil(totalQuestions / 10);
    const questions = await Question.find({ category })
      .populate("author")
      .skip((page - 1) * 10)
      .limit(10);
    res.render("questions", {
      questions,
      totalPages,
      currentPage: page,
    });
  })
);

router.get(
  "/questions/:id",
  isLoggedIn,
  getQuestionValidator,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const question = await Question.findById(id).populate("answers");
    console.log(question);
    if (!question) {
      req.flash("error", "Cannot find the question");
      return res.redirect("/questions");
    }
    console.log(question);
    res.render("questionPage", { question });
  })
);

router.post(
  "/newanswer",
  isLoggedIn,
  catchAsync(async (req, res) => {
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
  })
);

router.post(
  "/askquestion",
  isLoggedIn,
  newQuestionValidator,
  catchAsync(async (req, res) => {
    const statement = req.body.statement;
    const category = req.body.category;
    const question = new Question({
      statement: statement,
      category: category,
    });
    question.author = req.user._id;
    await question.save();
    req.flash("success", "Sucessfully added a question");
    res.redirect(`/questions?category=${category}`);
  })
);

router.delete(
  "/question/:id",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const category = req.body.category;
    await Question.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted question");
    res.redirect(`/questions?category=${category}`);
  })
);

module.exports = router;
