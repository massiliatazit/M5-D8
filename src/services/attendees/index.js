const express = require("express");
const attendeesRoute = express.Router();
const sgMail = require("@sendgrid/mail");
const { Transform } = require("json2csv");
const { pipeline } = require("stream");
const uniqid = require("uniqid");
const { join } = require("path");
const { getattendees, writeattendees } = require("../../lib/fsUtilities");
const attendencesPath = join(__dirname, "attandees.json");

attendeesRoute.get("/", async (req, res, next) => {
  try {
    const attandees = await getattendees(attendencesPath);
    res.send(attandees);
  } catch (err) {
    console.log(err);
    next(err);
  }
});
attendeesRoute.post("/", async (req, res, next) => {
  try {
    const attandees = await getattendees(attendencesPath);

    attandees.push({ ...req.body, ID: uniqid() });
    await writeattendees(attendencesPath, attandees);
    res.status(201).send(attandees);
  } catch (err) {
    console.log(err);
    next(err);
  }
});
attendeesRoute.post("/sendEmail", async (req, res, next) => {
  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: "massilia.tazit@hotmail.com",
      from: "massyfrares@gmail.com",
      subject: "Hello I am sending email with Twilio SendGrid",
      text: "doing it with Node.js",
      html: "<strong>Hello there!<strong>",
    };
    await sgMail.send(msg);
    res.send("sent the email check it in your inbox");
  } catch (err) {
    console.log(err);
    next(err);
  }
});
attendeesRoute.post("/export/csv", (req, res, next) => {
  try {
    const jsonReadableStream = createReadStream(attendencesPath);
    const json2csv = new Transform({
      fields: ["ID", "FirstName", "SecondName", "Email", "ArrivalDay"],
    });
    res.setHeader("Content-Disposition", "attachment; filename=export.csv");
    pipeline(jsonReadableStream, json2csv, res, (err) => {
      if (err) {
          console.log(err)
          next(err)
      }else{
          console.log("Done sent")
      }
    });
  } catch (err) {
    console.log(err)
    next(err);
  }
});
module.exports = attendeesRoute;
