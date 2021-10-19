const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    branch: {
      type: String,
      required: true,
    },

    emailToken: String,
    isVerified: Boolean,

    intro: {
      type: String,
      default: "Hello! I am new to Curiosity.",
    },
    dp: {
      type: String,
      default: "/images/user.png",
    },
    dpFilename:{
      type:String,
      default:"curiosity",
    },

    questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    answers: [{ type: Schema.Types.ObjectId, ref: "Answer" }],
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    likedQuestions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    likedAnswers: [{ type: Schema.Types.ObjectId, ref: "Answer" }],
    answeredQuestions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    followings: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

userSchema.plugin(passportLocalMongoose, { usernameField: "email" });

module.exports = mongoose.model("User", userSchema);
