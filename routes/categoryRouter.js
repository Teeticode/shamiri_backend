const Category = require("../model/Category");
const verify = require("../middlewares/jwtVerify");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

router.get("/", (req, res) => {
  Category.find()
    .then((categories) => {
      if (categories) {
        return res.status(200).json({ categories: categories });
      } else {
        return res.status(404).json({ error: "Not found, Try later" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ error: err });
    });
});

router.post("/create", verify, (req, res) => {
  if (!req.body.name) {
    return res.status(404).json({ error: "Enter a name please" });
  }
  const newCategory = new Category({
    name: req.body.name,
  });
  newCategory
    .save()
    .then((saved) => {
      return res
        .status(201)
        .json({ message: "Phase created successfully", category: saved });
    })
    .catch((err) => {
      return res.status(500).json({ error: "Something went wrong" });
    });
});

router.delete("/delete/:id", verify, (req, res) => {
  const paramid = req.params.id;

  if (mongoose.isValidObjectId(paramid)) {
    Category.findByIdAndDelete(paramid)
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
