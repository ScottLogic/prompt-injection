const express = require("express");
const router = require("./router");

const port = process.env.PORT || 3001;

// Creating express server
const app = express();

app.use("/", router);
app.listen(port, () => {
  console.log("Server is running on port: " + port);
});
