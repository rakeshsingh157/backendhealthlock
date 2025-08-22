const express = require("express");
const router = express.Router();
const { analyzeFileByURL } = require("../controllers/analyzeController");

// POST request, kyunki fileUrl aur userId body me aa raha hai
router.post("/", analyzeFileByURL);

module.exports = router;
