// Importing express module
const express = require("express");
const router = express.Router();

// Handling request using router
router.get("/", (req, res, next) => {
  res.send("Hello world");
});

// Importing the router
module.exports = router;
