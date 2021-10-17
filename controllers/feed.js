const Question = require("../models/question");
const Answer = require("../models/answer");
const User = require("../models/user");
const ExpressError = require("../utils/ExpressError");

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
  const question = await Question.findById(id)
    .populate("answers")
    .populate("author");
  console.log(question);
  if (!question) {
    req.flash("error", "Cannot find the question");
    return res.redirect("/questions");
  }
  console.log(question);
  res.render("questionPage", { question });
};

module.exports.postNewAnswer = async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);
  const answerContent = req.body.answer;
  const questionId = req.body.questionId;

  const question = await Question.findById(questionId);
  //Creating a new answer doc
  const newAnswer = new Answer({
   content: answerContent,
    question: questionId,
  });

  const answer = await newAnswer.save();
  //connecting docs
  const updatedAnswers = question.answers;
  updatedAnswers.push(answer);
  question.answers = updatedAnswers;

  const updatedUserAnswers = user.answers;
  updatedUserAnswers.push(answer);
  user.answers = updatedUserAnswers;

  const updatedAnsweredQuestions = user.answeredQuestions;
  updatedAnsweredQuestions.push(questionId);
  user.answeredQuestions = updatedAnsweredQuestions;

  const updatedUser = await user.save();
  const updatedQuestion = await question.save();
  res.redirect(`/questions/${questionId}`);
};

module.exports.postAskQuestion = async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);
  const statement = req.body.statement;
  const category = req.body.category;
  const question = new Question({
    statement: statement,
    category: category,
  });
  question.author = req.user._id;
  await question.save();
  user.questions.push(question);
  await user.save();
  req.flash("success", "Sucessfully added a question");
  res.redirect(`/questions?category=${category}`);
};

module.exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      req.flash("error", "User Not Found..!");
      res.redirect("/myaccount");
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

module.exports.getPublicProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // If the userId is equals to id , then redirect to myacccount..
    if (userId.equals(id)) {
      return res.redirect("/myaccount");
    }

    const publicUser = await User.findById(id).select(
      " -likedQuestions -likedAnswers  -answeredQuestions"
    );
    if (!publicUser) {
      next(new ExpressError("User not found"));
    }

    const publicUserDetails = {
      ...publicUser._doc,
      questions: publicUser.questions.length,
      followers: publicUser.followers.length,
      followings: publicUser.followings.length,
      answers: publicUser.answers.length,
    };
    res.render("PublicProfile", { profile: publicUserDetails });
  } catch (e) {
    next(e);
  }
};

module.exports.getEditprofile = (req, res, next) => {
  res.render("Editprofile");
};
module.exports.getUserActivity = (req, res, next) => {
  res.render("userActivity");
};

module.exports.follow = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (userId === undefined) {
      const error = new Error("No userId found!");
      error.statusCode(404);
      throw error;
    }

    if (id === userId) {
      const error = new Error("Can not follow himself/herself");
      error.statusCode = 400;
      throw error;
    }

    const followerUser = await User.findById(id).select("followings");
    const followingUser = await User.findById(userId).select("followers");

    if (!followerUser || !followingUser) {
      const error = new Error("User not found!");
      error.statusCode = 404;
      throw error;
    }

    const isFollowing = followerUser.followings.find(
      (followingUserId) => followingUserId == userId
    );
    //If the user is already following
    if (isFollowing !== undefined) {
      const error = new Error("Already following this user");
      error.statusCode = 422;
      throw error;
    }
    //If the user is not following already
    const updatedFollowings = followerUser.followings;
    updatedFollowings.push(userId);
    followerUser.followings = updatedFollowings;

    const updatedFollowers = followingUser.followers;
    updatedFollowers.push(id);
    followingUser.followers = updatedFollowers;

    const updatedFollowerUser = await followerUser.save();
    const updatedFollowingUser = await followingUser.save();

    res.status(200).json({
      message: "successfull",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    res.status(err.statusCode).json({
      message: err.message,
    });
  }
};


module.exports.getActivity = async (req, res, next) => {
  try {
    
    const userId = req.user._id;
    const activity = await User.findById(userId)
      .select("questions answeredQuestions")
      .populate({
        path: "questions answeredQuestions",
        select: "-answers",
      });

    if (!activity) {
      return res.render("userActivity", { error: "no activity found!" });
    }
    //If activity is found;
    console.log(activity);
    res.render("userActivity", { error: "", activity });
  } catch (err) {
    next(err);
  }
};


module.exports.deleteQuestion = async (req, res) => {
  const { id } = req.params;
  const deletedQuestion = await Question.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted question");
  res.redirect(`/questions?category=${deletedQuestion.category}`);
};
