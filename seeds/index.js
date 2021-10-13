const mongoose = require("mongoose");
const questions = require("./questions");
const Question = require("../models/question");

mongoose.connect("mongodb://localhost:27017/Curiosity", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const seedDB = async () => {
  await Question.deleteMany({});

  for (let i = 0; i < questions.length; i++) {
    const question = new Question({
      author: "6166cfbd8c7d562fb3240586",
      statement: questions[i].statement,
      category: questions[i].category,
    });

    await question.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
