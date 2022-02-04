const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();
const { User } = require("./all.model.js");
const jwt = require("jsonwebtoken");
const serverless = require("serverless-http");

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const uri = process.env.MONGODB_CONNECTION_URI;
mongoose.connect(uri, { useNewUrlParser: true });

const connection = mongoose.connection;

connection.once("open", () => {
  console.log("MongoDB connection established successfully");
});

const userRouter = require("./user.js");
const postRouter = require("./post.js");
const voteRouter = require("./vote.js");
const followerRouter = require("./follower.js");
const authenticationMiddleware = require("./auth.js");

app.use("/user", userRouter);
app.use("/post", postRouter);
app.use("/vote", voteRouter);
app.use("/follower", followerRouter);

app.put("/logout", authenticationMiddleware, (req, res) => {
  User.findOne(req.username, (err, findResult) => {
    if (err) throw err;

    findResult.refreshToken = "";
    findResult
      .save()
      .then(res.json({ detail: "user logged out" }))
      .catch((err) => res.status(500).json(err));
  });
});

app.post("/token", (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (refreshToken == null) return res.sendStatus(401);
  User.findOne({ refreshToken }, (err, result) => {
    if (err) throw err;
    if (!result) {
      return res.status(403).json({ detail: "user logged out" });
    } else {
      jwt.verify(refreshToken, process.env.JWT_REFRESH_STRING, (err, user) => {
        if (err) return res.sendStatus(403);
        const accessToken = jwt.sign(
          { username: user },
          process.env.JWT_SECRET_STRING,
          { expiresIn: "30m" }
        );
        res.json({ accessToken: accessToken });
      });
    }
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const filter = { username: username };
  User.findOne(filter, async (err, result) => {
    if (!result) {
      return res.status(404).json({ detail: "user not found" });
    }
    if (err) {
      console.log(err);
    } else {
      try {
        if (await bcrypt.compare(password, result.password)) {
          const accessToken = jwt.sign(
            { username },
            process.env.JWT_SECRET_STRING,
            { expiresIn: "30m" }
          );
          const refreshToken = jwt.sign(
            username,
            process.env.JWT_REFRESH_STRING
          );
          result.refreshToken = refreshToken;
          var newValue = { $set: result };
          User.updateOne(filter, newValue, function (err, res) {
            if (err) throw err;
            console.log(res);
          });
          return res.json({
            accessToken: accessToken,
            refreshToken: refreshToken,
          });
        } else {
          return res.status(401).json({ detail: "user unauthorized" });
        }
      } catch {
        return res.status(500).send();
      }
    }
  });
});

app.listen(5000, () => {
  console.log("server listening on port 5000...");
  console.log("env var", process.env.JWT_SECRET_STRING);
  console.log("env var", process.env.JWT_REFRESH_STRING);
  console.log("env var", process.env.MONGODB_CONNECTION_URI);
});
module.exports.handler = serverless(app);
