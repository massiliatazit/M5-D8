const express = require("express");
const attendeesRoute = express.Router();
const sgMail = require("@sendgrid/mail");
const { Transform } = require("json2csv");
const { pipeline } = require("stream");
const uniqid = require("uniqid");
const {createReadStream,createWriteStream} = require("fs-extra")
const { join } = require("path");
const { getattendees, writeattendees } = require("../../lib/fsUtilities");


var PDFDocument = require('pdfkit');

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
attendeesRoute.get("/export/csv", (req, res, next) => {
  try {
    const jsonReadableStream = createReadStream(attendencesPath);
    const transformJsonIntoCSV = new Transform({
      fields: ["ID", "FirstName", "SecondName", "Email", "ArrivalDay"],
    });
    res.setHeader("Content-Disposition", "attachment; filename=export.csv")
    pipeline(jsonReadableStream, transformJsonIntoCSV, res, err => {
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
attendeesRoute.get("/pdf",async(req,res,next)=>{
  try{
   
    const docpdf = new PDFDocument()
    docpdf.pipe(createWriteStream(join(__dirname,"../../pdfs/attend.pdf")))
    const attendencesdata = await getattendees(attendencesPath)
    let content =attendencesdata.map((attendence)=>`${attendence.FirstName},${attendence.SecondName},${attendence.ID},${attendence.ArrivalDay}`)
    docpdf.font("Helvetica").fontSize(20).text(content,100,120)
    res.setHeader("Content-Disposition", "attachment; filename=attendeesresult.pdf")
    docpdf.pipe(res)
    docpdf.end()

  }catch(err){
    console.log(err)
    next(err)
  }


})
module.exports = attendeesRoute;
