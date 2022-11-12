const express = require("express");
const envLoad = require("dotenv").config();
const apiRoutes = require('./routes/api.js');
const morgan = require("morgan");
const auth = require("./common/auth.js");
const logger = require("./common/logger.js");
const path = require("path");
const db = require("./db");

if (envLoad.error) {
  logger.error("failed to load env file");
}

db.init().then(()=>{
  logger.info("DB init complete");
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("combined"));

app.use(auth.initialize());
app.use(
  "/",
  auth.authenticate("basic"),
  express.static(path.join(__dirname, "../dist"))
);
app.use("/api", apiRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  logger.info(`listening on ${port}`);
});
