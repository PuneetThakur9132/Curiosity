// ************ NPM MODULES **********//
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const ejsMate = require("ejs-mate");
const path = require("path");

const Question = require("./models/question");
const Answer = require("./models/answer");

const ExpressError = require("./utils/ExpressError");
const feedRoutes = require("./routes/feed");

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

//********SETTING UP ROUTES *********//
app.use(feedRoutes);

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
