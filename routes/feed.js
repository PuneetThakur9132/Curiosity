const express = require("express");
const multer = require("multer");
const router = express.Router();

const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");

const { isLoggedIn } = require("../middleware/loginAuth");

const newQuestionValidator = require("../middleware/validators/newQuestion");
const getQuestionValidator = require("../middleware/validators/getQuestion");
const editprofileValidator = require("../middleware/validators/editprofile");
const editquestionValidator = require("../middleware/validators/editQuestion");
const getHomePageValidator = require("../middleware/validators/getHome");
const postNewAnswerValidator = require("../middleware/validators/postNewAnswer");
const feedController = require("../controllers/feed");

const { storage } = require("../cloudinary");
const upload = multer({ storage });

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

router.post(
  "/newanswer",
  isLoggedIn,
  postNewAnswerValidator,
  catchAsync(feedController.postNewAnswer)
);

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
  editprofileValidator,
  catchAsync(feedController.getHomePage)
);

router.get("/follow/:id", isLoggedIn, catchAsync(feedController.follow));

router.get("/unfollow/:id", isLoggedIn, catchAsync(feedController.unfollow));

router.get("/userActivity", isLoggedIn, catchAsync(feedController.getActivity));

router.put(
  "/editquestion/:id",
  isLoggedIn,
  editquestionValidator,
  catchAsync(feedController.putEditQuestion)
);

router.post(
  "/profiledp",
  upload.single("profilepic"),
  catchAsync(feedController.postProfileDp)
);

router.get("/myaccount", isLoggedIn, catchAsync(feedController.getProfile));

module.exports = router;
