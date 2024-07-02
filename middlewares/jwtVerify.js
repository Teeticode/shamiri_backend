const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

function verifyUser(req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    const id = decodedToken.id;
    const userid = decodedToken.userid;
    const role = decodedToken.role;
    const premium = decodedToken.premium;
    if (
      req.body.id &&
      req.body.premium &&
      req.body.userid &&
      req.body.isAdmin &&
      req.body.userid !== userid &&
      req.body.premium !== premium &&
      req.body.isAdmin !== isAdmin &&
      req.body.userId !== id
    ) {
      res.status(401).json({
        error: "Not Authorized",
      });
    } else {
      req.user = id;
      req.admin = role;
      req.userid = userid;
      req.premium = premium;
      next();
    }
  } catch (error) {
    res.status(401).json({
      error: "Not Authorized",
    });
  }
}

module.exports = verifyUser;
