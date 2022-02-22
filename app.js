// ************ NPM MODULES **********//

// this line means if we are in development mode , them process.env should be available on our node app
if(process.env.NODE_ENV !== "production"){
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const methodOverride = require("method-override");

const Question = require("./models/question");
const Answer = require("./models/answer");

const ExpressError = require("./utils/ExpressError");
const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");
const MongoStore = require('connect-mongo')(session);
const dbUrl = process.env.DB_URL||"mongodb://localhost:27017/Curiosity";

// Passport configuring

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

//****** CONNECTING DATABASE****** //
mongoose.connect(dbUrl, {
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public"))); // for serving static assets

// configuring session
const secret = process.env.SECRET|| "thisshouldbeabettersecret!";
const store =  new MongoStore({
  url:dbUrl,
  secret,
  touchAfter:24*60*60
})

store.on("error",function(e){
  console.log("SESSION STORE ERROR",e);
})

const sessionConfig = {
  store,
  name:'session',
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      usernameQueryFields: ["email"],
    },
    User.authenticate()
  )
);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

//********SETTING UP ROUTES *********//
app.use(feedRoutes);
app.use(authRoutes);

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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`SERVING ON PORT ${port}`);
});
