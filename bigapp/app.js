const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require('morgan');
const fs = require("fs");
const path = require('path');
const db = require("./services/db");
const mailService = require("./routes/mailservice");

// parse requests of content-type - application/json
app.use(bodyParser.json());

var accessLogStream = fs.createWriteStream(path.join(__dirname, './logs/access.log'), { flags: 'a' })
// setup the logger
app.use(morgan('combined', { stream: accessLogStream }));

app.use("/mailservice", mailService);

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// set port, listen for requests
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});