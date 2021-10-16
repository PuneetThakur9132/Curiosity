const Question = require("../models/question");
const Answer = require("../models/answer");
const User = require("../models/user");

module.exports.getLandingPage = (req, res) => {
  res.render("index");
};

module.exports.getAboutPage = (req, res) => {
  res.render("about");
};

module.exports.getHomePage = async (req, res) => {
  if (!req.user) {
    res.render("index");
  }
  const category = req.user.branch;
  const questions = await Question.find({ category });
  if (!questions) {
    req.flash("error", "Cannot Find any question");
    return res.redirect("/home");
  }
  res.render("home", { questions });
};

module.exports.getQuestions = async (req, res) => {
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
};

module.exports.getQuestion = async (req, res) => {
  const { id } = req.params;
  const question = await Question.findById(id).populate("answers");
  console.log(question);
  if (!question) {
    req.flash("error", "Cannot find the question");
    return res.redirect("/questions");
  }
  console.log(question);
  res.render("questionPage", { question });
};

module.exports.postNewAnswer = async (req, res) => {
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
};

module.exports.postAskQuestion = async (req, res) => {
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
};

module.exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      const error = new Error("No user is found");
      throw error;
    }
    //console.log(user);
    const profile = {
      ...user._doc,
      questions: user.questions.length,
      followers: user.followers.length,
      likedQuestions: user.likedQuestions.length,
      likedAnswers: user.likedAnswers.length,
      answers: user.answers.length,
      followings: user.followings.length,
      answeredQuestions: user.answeredQuestions.length,
    };
    console.log(profile);
    res.render("myaccount", { profile });
  } catch (err) {
    next(err);
  }
};

module.exports.getPublicProfile = (req, res, next) => {
  res.render("PublicProfile");
};

module.exports.getEditprofile = (req, res, next) => {
  res.render("Editprofile");
};
module.exports.getUserActivity = (req, res, next) => {
  res.render("userActivity");
};

module.exports.deleteQuestion = async (req, res) => {
  const { id } = req.params;
  const deletedQuestion = await Question.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted question");
  res.redirect(`/questions?category=${deletedQuestion.category}`);
};
