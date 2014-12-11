"use strict";

/**
 * lib/mailer.js
 * Rin prpr!
 *
 * rin-pr mailer
 */

var config = require('../config');

var nodemailer = require('nodemailer');
var fs = require('fs');

var transporter = nodemailer.createTransport({
    service: config['mail'].service,
    auth: {
        user: config['mail'].user,
        pass: config['mail'].password
    }
});

/*
* mailer params
* receiver: string 'someone@example.com'
* language: string 'zh_tw'
* mailtemplate: string 'reg_confirmation'
* locals: object { someVar: "someVal" }
*
* */

module.exports = function (receiver, language, mailtemplate, locals) {
    fs.readFile('./mails/' + language + '/' + mailtemplate, 'utf8', function(err, data) {
        if (err) {
            return { success: false, message: err };
        }

        for (var key, value in locals) {
            data = data.replace('<' + key + '>', value);
        }

        var subject = data.slice(0, data.indexOf('\n'));
        var body  = data.slice(data.indexof('\n') + 1);

        var mailOptions = {
            from: config['mail'].sender,
            to: receiver,
            subject: subject,
            text: body
        };

        if (config['app'].dev_mode) {
            console.log('message not really sent to ' +
                mailOptions.receiver +
                '\nsubject: '
                + mailOptions.subject +
                '\n' + mailOptions.text
            );
            return { success: true };
        } else {
            transporter.sendMail(mailOptions, function(err){
                if (err) {
                    return { success: false, message: err };
                } else {
                    return { success: true };
                }
            });
        }
    });
};