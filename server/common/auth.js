const passport = require("passport");
const BasicStrategy = require("passport-http").BasicStrategy;
const logger = require("./logger");

passport.use(
  new BasicStrategy((username, pass, done) => {
    const collectID = process.env.BASIC_ID;
    const collectPass = process.env.BASIC_PASS;
    if (collectID && collectPass) {
      if (collectID === username && collectPass === pass) {
        done(null, { user: username });
      } else {
        done(null, false, { message: "invalid user or pass" });
      }
    } else {
      logger.error(`config error: [ID:${collectID}, pass:${collectPass}]`);
      done(new Error("server configuration error"));
    }
  })
);

const auth = {};
auth.initialize = () => {
  return passport.initialize();
};
auth.authenticate = (strategy) => {
  return passport.authenticate(strategy, { session: false });
};

module.exports = auth;
