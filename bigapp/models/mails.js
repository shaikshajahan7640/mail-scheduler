var mongoose = require("mongoose");
var mail = new mongoose.Schema({
    receiver: { type: String, required: true},
    scheduledTime: { type: Date, required: true},
    CC: { type: String, default: ""},
    createdTime: { type: Date, default: Date.now },
    subject: { type: String, default: "None" },
    body: { type: String, default: "None" },
    isDelete: { type: Boolean, default: false },
    status: { type: String, default: "Unsent" },
}, { strict: false });

module.exports = mongoose.model("mail", mail);