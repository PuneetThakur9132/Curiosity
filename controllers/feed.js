const path = require("path");

const Question = require("../models/question");
const Answer = require("../models/answer");
const User = require("../models/user");
const ExpressError = require("../utils/ExpressError");
const { cloudinary } = require("../cloudinary");

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

    const user = await User.findById(userId).select("followings");
    if (!publicUser) {
      return next(new ExpressError("User not found"));
    }

    const publicUserDetails = {
      ...publicUser._doc,
      questions: publicUser.questions.length,
      followers: publicUser.followers.length,
      followings: publicUser.followings.length,
      answers: publicUser.answers.length,
    };
    const isFound = user.followings.find((followingUser) =>
      followingUser.equals(id)
    );

    const isFollowing = isFound === undefined ? false : true;
    res.render("PublicProfile", { profile: publicUserDetails, isFollowing });
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

//follow

module.exports.follow = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const followerUser = await User.findById(userId).select("followings");
    const followingUser = await User.findById(id).select("followers");

    if (!followerUser || !followingUser) {
      return next(new ExpressError("User not Found", 404));
    }

    const isFollowing = followerUser.followings.findIndex((followingUserId) =>
      followingUserId.equals(id)
    );

    // if user is already following
    if (isFollowing !== -1) {
      return next(new ExpressError("Already following this user", 422));
    }

    //if user is not following

    followingUser.followers.push(userId);
    await followingUser.save();

    followerUser.followings.push(id);
    await followerUser.save();

    console.log("followerUser...", followerUser);
    console.log("followingUser...", followingUser);

    req.flash("success", "Successfully followed");
    res.redirect(`/PublicProfile/${id}`);
  } catch (e) {
    next(e);
  }
};

//unfollow

module.exports.unfollow = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (id === undefined) {
      return next(new ExpressError("No user Found", 404));
    }
    const followerUser = await User.findById(userId).select("followings");
    const followingUser = await User.findById(id).select("followers");

    if (!followerUser || !followingUser) {
      return next(new ExpressError("No user Found", 404));
    }

    const followingIndex = followerUser.followings.findIndex(
      (followingUserId) => followingUserId.equals(id)
    );

    const followerIndex = followingUser.followers.findIndex((followerUserId) =>
      followerUserId.equals(userId)
    );

    if (followingIndex === -1 || followerIndex === -1) {
      return next(new ExpressError("First follow to Unfollow", 422));
    }

    followerUser.followings.splice(followingIndex, 1);
    followingUser.followers.splice(followerIndex, 1);

    await followerUser.save();
    await followingUser.save();

    req.flash("success", "Successfully..Unfollowed");
    res.redirect(`/PublicProfile/${id}`);
  } catch (e) {
    next(e);
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
      next(new ExpressError("no activity found!"));
    }
    //If activity is found;
    res.render("userActivity", { activity });
  } catch (err) {
    next(err);
  }
};

module.exports.getEditProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    if (userId === undefined) {
      next(new ExpressError("No userId found", 404));
    }
    const user = await User.findById(userId);
    if (!user) {
      next(new ExpressError("No user is found!"));
    }
    res.render("Editprofile", { user });
  } catch (e) {
    next(e);
  }
};

module.exports.postEditProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const intro = req.body.bio;
    const branch = req.body.stream;

    const user = await User.findById(userId).select("intro branch");

    user.branch = branch;
    user.intro = intro;

    await user.save();

    req.flash("success", "You have Successfully Updated  your info");
    res.redirect("/editprofile");
  } catch (e) {
    next(e);
  }
};

module.exports.putEditQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const editedQuestion = req.body.statement;
    const branch = req.body.category;
    const question = await Question.findById(id);
    if (!question) {
      req.flash("error", "Question not Found");
      return res.redirect("/home");
    }
    question.statement = editedQuestion;
    question.category = branch;

    await question.save();

    req.flash("success", "Successfully edited a question");
    return res.redirect("/userActivity");
  } catch (e) {
    next(e);
  }
};

module.exports.postProfileDp = async (req, res, next) => {
  try {
    const { id } = req.params;
    const finalName = req.file;
    console.log(finalName);
    const user = await User.findById(id).select("dp dpFilename");
    //If no user is found
    if (!user) {
      return res.render("page404");
    }
    if (user.dp !== "/images/user.png" && user.dpFilename !== "curiosity") {
      cloudinary.uploader.destroy(user.dpFilename);
    }
    user.dp = finalName.path;
    user.dpFilename = finalName.filename;
    const newDp = await user.save();
    res.redirect("/myaccount");
  } catch (error) {
    console.log(error);
  }
};

module.exports.deleteQuestion = async (req, res) => {
  const { id } = req.params;
  const deletedQuestion = await Question.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted question");
  res.redirect(`/questions?category=${deletedQuestion.category}`);
};
