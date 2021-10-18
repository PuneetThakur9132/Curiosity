const express = require("express");
const router = express.Router();
const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn } = require("../middleware/loginAuth");

const newQuestionValidator = require("../middleware/validators/newQuestion");
const getQuestionValidator = require("../middleware/validators/getQuestion");
const getHomePageValidator = require("../middleware/validators/getHome");

const feedController = require("../controllers/feed");

router.get("/", feedController.getLandingPage);
router.get("/about", feedController.getAboutPage);
router.get("/home", feedController.getHomePage);

router.get(
  "/questions",
  getQuestionValidator,
  catchAsync(feedController.getQuestions)
);

router.get(
  "/questions/:id",
  isLoggedIn,
  getQuestionValidator,
  catchAsync(feedController.getQuestion)
);

router.post("/newanswer", isLoggedIn, catchAsync(feedController.postNewAnswer));

router.post(
  "/askquestion",
  isLoggedIn,
  newQuestionValidator,
  catchAsync(feedController.postAskQuestion)
);

router.delete(
  "/question/:id",
  isLoggedIn,
  catchAsync(feedController.deleteQuestion)
);

router.get(
  "/PublicProfile/:id",
  isLoggedIn,
  catchAsync(feedController.getPublicProfile)
);

router.get(
  "/editprofile",
  isLoggedIn,
  catchAsync(feedController.getEditProfile)
);
router.post(
  "/editprofile",
  isLoggedIn,
  catchAsync(feedController.postEditProfile)
);

router.get(
  "/home",
  isLoggedIn,
  getHomePageValidator,
  catchAsync(feedController.getHomePage)
);

router.get("/follow/:id", isLoggedIn, catchAsync(feedController.follow));

router.get("/unfollow/:id", isLoggedIn, catchAsync(feedController.unfollow));

router.get("/userActivity", isLoggedIn, catchAsync(feedController.getActivity));

router.put(
  "/editquestion/:id",
  isLoggedIn,
  catchAsync(feedController.putEditQuestion)
);

router.get("/myaccount", isLoggedIn, catchAsync(feedController.getProfile));

module.exports = router;