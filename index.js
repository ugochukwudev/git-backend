let express = require("express");
let cors = require("cors");
let bodyParser = require("body-parser");
const { default: axios } = require("axios");
const path = require("path");
let dotenv = require("dotenv");

// MongoDB Configuration
dotenv.config();
let auth;
const app = express();
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(cors());
app.use("/public", express.static("public"));
//app.use("/api", api);
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});
app.get("/auth", (req, res) => {
  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${process.env.CLIENT_ID}`
  );
});
app.post("/callback", (req, res) => {
  console.log("body:", req.body);
  axios
    .post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code: req.body.code,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    )
    .then((result) => {
      auth = result.data.access_token;
      console.log(result.data);
      res.json({
        message: "you are authorized ",
        token: `${result?.data.access_token}`,
      });
      console.log("oo:", auth);
    })
    .catch((err) => {
      console.log(err);
    });
});
app.get("/data", (req, res) => {
  axios
    .get(
      "https://api.github.com/user",

      {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer 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",
        },
      }
    )
    .then((result) => {
      console.log(result);
      res.send("you are authorized " + result);
      console.log("oo:", auth);
    })
    .catch((err) => {
      console.log(err);
    });
});
const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  console.log("Connected to port " + port, process.env.CLIENT_ID);
});
app.use((req, res, next) => {
  // Error goes via `next()` method
  setImmediate(() => {
    next(new Error("Something went wrong"));
  });
});
app.use(function (err, req, res, next) {
  console.error(err.message);
  if (!err.statusCode) err.statusCode = 500;
  res.status(err.statusCode).send(err.message);
});
