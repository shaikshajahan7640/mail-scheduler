const express = require("express");
const router = express.Router();
const nodemailer = require('nodemailer');
const mail = require("../models/mails");
const config = require("../configs/config");

var timeoutFuntion;

// To check the future scheduled mails initially
checkLatestRecord();

// To Create scheduled mail records 
router.post("/create", function (req, res) {
    var mailBody = req.body;
    mail.create(mailBody, function (createErr, respData) {
        if (createErr) {
            res.json({
                "status": 500,
                "message": "Internal service error"
            })
        } else {
            checkLatestRecord();
            res.json({
                "status": 200,
                "message": "mail scheduled sucessfully",
                "_id": respData["_id"]
            })
        }
    })
})

// To list scheduled mail records
router.post("/list", function (req, res) {
    var query = {};
    query.isDelete = false;

    if (req.body.status != undefined && req.body.status.length > 0) {
        query.status = req.body.status;
    }

    mail.find(query, { _id: 0, isDelete: 0, status: 0, __v: 0 }, function (listErr, respData) {
        if (listErr) {
            res.json({
                "status": 500,
                "message": "Internal service error"
            })
        } else if (respData.length == 0) {
            res.json({
                "status": 404,
                "message": "No data found"
            })
        } else {
            res.json({
                "status": 200,
                "data": respData
            })
        }
    })
})

// To update scheduled mail record
router.post("/update", function (req, res) {
    var newMailData = req.body;

    updateMails({ _id: req.body._id }, newMailData, res);
})

function updateMails(query, data, res) {
    mail.findOneAndUpdate(query, data, function (deleteErr, respData) {
        if (deleteErr) {
            res.json({
                "status": 500,
                "message": "Internal service error"
            })
        } else if (respData == null || respData == undefined || respData.length == 0) {
            res.json({
                "status": 404,
                "message": "No data found to delete"
            })
        } else {
            checkLatestRecord();
            res.json({
                "status": 200,
                "message": "Record updated sucessfully",
                "data": respData
            })
        }
    })
}

// To delete schedule mail record
router.post("/delete", function (req, res) {
    updateMails({ _id: req.body._id }, { isDelete: true }, res)
})

// To remove schedule mail record
router.post("/remove", function (req, res) {
    mail.remove({ _id: req.body._id }, function (removeErr, respData) {
        if (removeErr) {
            res.json({
                "status": 500,
                "message": "Internal service error"
            })
        } else if (respData == null || respData == undefined || respData.length == 0) {
            res.json({
                "status": 404,
                "message": "No data found to delete"
            })
        } else {
            checkLatestRecord();
            res.json({
                "status": 200,
                "message": "Record deleted sucessfully"
            })
        }
    })
})

// To make the record sent mail after particular time period
function checkLatestRecord() {
    const myDate = new Date();
    const newDate1 = new Date(myDate);
    const newDate2 = new Date(myDate);
    var presentTime = newDate1.setHours(newDate1.getHours() + 5, newDate1.getMinutes() + 29);
    var presentTimeUpperBuffer = newDate2.setHours(newDate2.getHours() + 5, newDate2.getMinutes() + 31);

    mail.findOne({ "scheduledTime": { $gte: presentTime }, "isDelete": false, "status": "Unsent" }, {}, { sort: { scheduledTime: 1 } }, function (findErr, recordDate) {
        if (findErr || recordDate == null) {
            console.log("No mails to schedule");
        } else {
            var scheduleTime = new Date(recordDate.scheduledTime).getTime() - new Date(presentTimeUpperBuffer).getTime();
            clearTimeout(timeoutFuntion);
            timeoutFuntion = setTimeout(sendMail, scheduleTime, recordDate);
        }
    })
}

// sending mail function
function sendMail(mailData) {

    var transporter = nodemailer.createTransport({
        service: config.mailService,
        auth: {
            user: config.mail,
            pass: config.password
        }
    });

    var mailOptions = {
        from: config.mail,
        to: mailData.receiver,
        cc: mailData.CC,
        subject: mailData.subject,
        text: mailData.body
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            mail.findOneAndUpdate({ "_id": mailData._id }, { status: 'fail' }, function (err, resp) {
                console.log("unable to sent mail")
                checkLatestRecord();
            })
        } else {
            mail.findOneAndUpdate({ "_id": mailData._id }, { status: 'sent' }, function (err, resp) {
                console.log('Email sent: ' + info.response);
                checkLatestRecord();
            })
        }
    });
}

module.exports = router;