const express = require("express");
const {
  createURL,
  getURL,
  getAnalytics,
  deleteURL,
  showAllURLs,
} = require("../Controllers/URLController");
const { checkValidURL, authorize } = require("../Middlewares/ValidURL");
const router = express.Router();

router.get("/", showAllURLs);

router.post("/url", checkValidURL, createURL);
router.get("/:id", getURL);

router.get("/url/analytics/:id", getAnalytics);

router.delete("/url/:id", authorize, deleteURL);

module.exports = router;
