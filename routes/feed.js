const express = require("express");
const router = express.Router();
const Question = require("../models/question");
const Answer = require("../models/answer");
const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");

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
  catchAsync(async (req, res) => {
    const category = req.query.category;
    const questions = await Question.find({ category });
    res.render("questions", { questions });
  })
);

router.get(
  "/questions/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const question = await Question.findById(id).populate("answers");
    res.render("questionPage", { question });
  })
);

router.post(
  "/newanswer",
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
  catchAsync(async (req, res) => {
    const statement = req.body.statement;
    const category = req.body.category;
    const question = new Question({
      statement: statement,
      category: category,
    });
    await question.save();
    res.redirect(`/questions?category=${category}`);
  })
);

module.exports = router;