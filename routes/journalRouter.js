const Journal = require("../model/Journal");
const express = require("express");
const mongoose = require("mongoose");
const verify = require("../middlewares/jwtVerify");
const router = express.Router();

router.get("/", verify, (req, res) => {
  Journal.find({})
    .populate("assignee", "firstname lastname")
    .populate("phase", "name")
    .then((journals) => {
      if (journals) {
        return res.status(200).json({ journals });
      } else {
        return res.status(404).json({ error: "Not found, try later" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ error: err });
    });
});

router.post("/create", verify, (req, res) => {
  console.log(req.user);
  if (!req.body.title || !req.body.description || !req.body.category) {
    return res.status(500).json({ error: "fill in all fields" });
  }
  const newJournal = new Journal({
    title: req.body.title,
    description: req.body.description,
    owner: req.user,
    category: req.body.category,
  });
  newJournal
    .save()
    .then((saved) => {
      return res
        .status(201)
        .json({ message: "Journal Created Successfully", journal: saved });
    })
    .catch((err) => {
      return res.status(500).json({ error: err });
    });
});

router.delete("/delete/:id", verify, (req, res) => {
  const paramid = req.params.id;

  if (mongoose.isValidObjectId(paramid)) {
    Journal.findByIdAndDelete(paramid)
      .then((category) => {
        return res.status(200).json({ message: "Deleted Successfully" });
      })
      .catch((err) => {
        return res.status(500).json({ error: err });
      });
  } else {
    return res.status(500).json({ error: "Something Went wrong" });
  }
});
module.exports = router;
