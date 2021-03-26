const mongoose = require("mongoose");
const config = require("../configs/config");
const connsctionOptions = { poolSize: 10, bufferMaxEntries: 0, useNewUrlParser: true, useUnifiedTopology: true };
mongoose.connect(config.mongo_URL, connsctionOptions).then(() => console.log('Now connected to MongoDB!'))
    .catch(err => console.error('Something went wrong', err));