const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const verifyUser = require("../middlewares/jwtVerify");
const _ = require("lodash");
const axios = require("axios");
const { lowerCase } = require("lodash");
const asyncHandler = require("express-async-handler");
dotenv.config();

router.get("/", (req, res) => {
  User.find({})
    .select("firstname lastname email username")
    .then((users) => {
      if (users) {
        return res.status(200).json({ users: users });
      } else {
        return res.status(404).json({ error: "Not found" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ error: "something went wrong" });
    });
});

router.get("/:id", (req, res) => {
  User.findOne({ _id: req.params.id })
    .select("firstname lastname email userid verified isBlocked createdAt")
    .then((users) => {
      if (users) {
        return res.status(200).json({ user: users });
      } else {
        return res.status(404).json({ error: "Not found" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ error: "something went wrong" });
    });
});
router.get("/check/:email", (req, res) => {
  User.findOne({ email: req.params.email })
    .select("email")
    .then((users) => {
      if (users) {
        return res.status(200).json({ exists: true });
      } else {
        return res.status(200).json({ exists: false });
      }
    })
    .catch((err) => {
      return res.status(500).json({ error: "something went wrong" });
    });
});
// router.put("/block/:id", (req, res) => {
//   const paramid = req.params.id;
//   if (mongoose.isValidObjectId(paramid)) {
//     User.findByIdAndUpdate(
//       paramid,
//       {
//         isBlocked: true,
//       },
//       { new: true }
//     )
//       .then((users) => {
//         return res.status(200).json({ users: users });
//       })
//       .catch((err) => {
//         return res.status(500).json({ error: "something went wrong" });
//       });
//   } else {
//     return res.status(500).json({ error: "Something Went wrong" });
//   }
// });
router.put("/update/username", verifyUser, (req, res) => {
  console.log(req.user, "here");
  //const paramid = req.params.id;
  if (!req.body.username) {
    return res.status(500).json({ error: "Fill in all fields" });
  }
  if (mongoose.isValidObjectId(req.user)) {
    User.findByIdAndUpdate(
      req.user,
      {
        username: req.body.username,
      },
      { new: true }
    )
      .then((users) => {
        return res.status(200).json({ users: users });
      })
      .catch((err) => {
        return res.status(500).json({ error: "something went wrong" });
      });
  } else {
    return res.status(500).json({ error: "Something Went wrong" });
  }
});
router.put("/update/password", verifyUser, (req, res) => {
  console.log(req.user, "here");
  //const paramid = req.params.id;
  if (!req.body.password || !req.body.oldPassword) {
    return res.status(500).json({ error: "Fill in all fields" });
  }
  if (mongoose.isValidObjectId(req.user)) {
    User.findById(req.user).then((user) => {
      bcrypt
        .compare(req.body.oldPassword, user?.password)
        .then((verifiedUser) => {
          if (verifiedUser) {
            bcrypt
              .hash(req.body.password, 10)
              .then((hashedPsd) => {
                User.findByIdAndUpdate(
                  req.user,
                  {
                    password: hashedPsd,
                  },
                  { new: true }
                )
                  .then((users) => {
                    return res.status(200).json({ users: users });
                  })
                  .catch((err) => {
                    return res
                      .status(500)
                      .json({ error: "something went wrong" });
                  });
              })
              .catch(() => {
                return res
                  .status(500)
                  .json({ error: "Error Saving New Password" });
              });
          } else {
            return res.status(401).json({ error: "Wrong credentials!" });
          }
        })
        .catch((err) => {
          return res.status(500).json({ error: "Error verifying password" });
        });
    });
  } else {
    return res.status(500).json({ error: "Something Went wrong" });
  }
});
router.delete("/delete/:id", verifyUser, (req, res) => {
  const paramid = req.params.id;

  if (mongoose.isValidObjectId(paramid)) {
    if (req.user === paramid) {
      User.findByIdAndDelete(paramid)
        .then((deletedUser) => {
          if (deletedUser) {
            return res.status(200).json({
              success: true,
              message: "product deleted successfully",
            });
          } else {
            return res.status(404).json({
              success: false,
              message: "product not found",
            });
          }
        })
        .catch((err) => {
          return res.status(500).json({ error: "something went wrong" });
        });
    } else {
      return res
        .status(401)
        .json({ error: "Something Went Wrong, try again later!" });
    }
  } else {
    return res.status(500).json({ error: "Something Went wrong" });
  }
});

router.post("/register", (req, res) => {
  if (!req.body.password || !req.body.username) {
    return res.status(500).json({ error: "Fill in all fields" });
  }
  const userid =
    lowerCase(req.body.firstname) +
    "-" +
    lowerCase(req.body.lastname) +
    "-" +
    Math.floor(Math.random() * 2000000 + 20);
  // const username =
  //   lowerCase(req.body.lastname) +
  //   "_" +
  //   Math.floor(Math.random() * 200000 + 20);

  User.findOne({ username: req.body.username })
    .then((user) => {
      if (!user) {
        bcrypt
          .hash(req.body.password, 10)
          .then((hashedPsd) => {
            const newUser = new User({
              password: hashedPsd,
              username: req.body.username,
            });
            newUser
              .save()
              .then((user) => {
                if (user) {
                  return res.status(201).json({
                    message:
                      "Account Created Successfully, Refresh To Create A new Account",
                  });
                }
              })
              .catch((err) => {
                return res.status(500).json({
                  error: "user not created. Try Again Later!",
                });
              });
          })
          .catch((err) => {
            return res.status(500).json({ error: "something went wrong" });
          });
      } else {
        return res.status(401).json({ error: "Username is taken" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ error: "Something went wrong" });
    });
});

router.post("/login", (req, res) => {
  if (!req.body.username || !req.body.password) {
    return res.status(500).json({ error: "Fill in all fields" });
  }
  const admin = process.env.ADMIN;
  User.findOne({ username: req.body.username })
    .then((logUser) => {
      if (logUser) {
        bcrypt
          .compare(req.body.password, logUser.password)
          .then((verifiedUser) => {
            if (verifiedUser) {
              const token = jwt.sign(
                {
                  id: logUser._id,
                  userid: logUser.userid,
                  role: logUser.role,
                },
                process.env.TOKEN_SECRET,
                { expiresIn: "1440h" }
              );

              res.status(200).json({ token: token });
            } else {
              return res.status(401).json({ error: "credential error" });
            }
          })
          .catch((err) => {
            return res.status(500).json({ error: "Something went wrong" });
          });
      } else {
        return res.status(404).json({ error: "Credential Error" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ error: "something went wrong" });
    });
});

// router.post("/verify/phone", verifyUser, (req, res) => {
//   User.findOne({ userid: req.userid })
//     .then((user) => {
//       if (user) {
//         const number = req.body.number;
//         const OTP = otpGenerator.generate(4, {
//           digits: true,
//           alphabets: false,
//           upperCaseAlphabets: false,
//           specialChars: false,
//         });
//         const otp = new Phone({ number: number, otp: OTP });
//         otp.otp = bacrypt.hash(otp);
//       } else {
//         return res.status(404).json({ error: "Not Authorized" });
//       }
//     })
//     .catch((err) => {
//       res.status(500).json({ error: "Something Went Wrong" });
//     });
// });

module.exports = router;
