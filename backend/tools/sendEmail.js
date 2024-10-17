const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const path = require("path");

module.exports.sendEmail = function (mailOptionsObj) {
  console.log("mailOptionsObj", mailOptionsObj);
  const groomedMailOptionsObj = {
    from: mailOptionsObj.hasOwnProperty("from")
      ? mailOptionsObj.from
      : process.env.MAILER_EMAIL_ID,
    to: mailOptionsObj.hasOwnProperty("to")
      ? mailOptionsObj.to
      : "levelthreeemail@gmail.com",
    template: mailOptionsObj.hasOwnProperty("template")
      ? mailOptionsObj.template
      : "main",
    subject: mailOptionsObj.hasOwnProperty("subject")
      ? mailOptionsObj.subject
      : "An email from GlassInteractive.com",
    text: mailOptionsObj.hasOwnProperty("text")
      ? mailOptionsObj.text
      : "Hello from https://audio-plugin-organizer-tool.glassinteractive.com ! This email was sent without any text. Please let the site admin know at general@glassinteractive.com so this can be fixed.",
    context: {
      url:
        mailOptionsObj.hasOwnProperty("context") &&
        mailOptionsObj.context.hasOwnProperty("url")
          ? mailOptionsObj.context.url
          : "",
      name:
        mailOptionsObj.hasOwnProperty("context") &&
        mailOptionsObj.context.hasOwnProperty("name")
          ? mailOptionsObj.context.name
          : "Interview Questions user",
    },
  };

  console.log("groomedMailOptionsObj", groomedMailOptionsObj);
  return new Promise((resolve, reject) => {
    let response = { success: null };
    console.log("sendEmail");

    console.log("sendEmail: Begin email sending...");
    const transporter = nodemailer.createTransport({
      host: "mail.glassinteractive.com",
      port: 465,
      secure: true, // use TLS/ upgrade later with STARTTLS
      auth: {
        user: process.env.MAILER_EMAIL_ID,
        pass: process.env.MAILER_PASSWORD,
      },
      // tls: {
      //   // do not fail on invalid certs
      //   rejectUnauthorized: false,
      // },
      debug: true,
    });

    console.log("sendEmail: transporter: ", transporter);

    console.log("sendEmail: groomedMailOptionsObj: ", groomedMailOptionsObj);
    handlebarsOptions = {
      viewEngine: {
        extname: ".html", // handlebars extension
        layoutsDir: path.resolve("./backend/templates/"), // location of handlebars templates
        defaultLayout: "", // name of main template
        partialsDir: path.resolve("./backend/templates/"), // location of your subtemplates aka. header, footer etc
      },
      viewPath: path.resolve("./backend/templates/"),
      defaultView: "default",
      defaultLayout: "",
      layoutsDir: path.resolve("./backend/templates/"),
      partialsDir: path.resolve("./backend/templates/"),
      extName: ".html",
    };
    console.log("handlebarsOptions", handlebarsOptions);
    transporter.use("compile", hbs(handlebarsOptions));
    transporter.sendMail(groomedMailOptionsObj, function (error, info) {
      console.log("error **** ", error);
      console.log("info **** ", info);
      if (error) {
        console.log(error);
        resolve({
          message: "An error occurred trying to send the email",
          data: error,
          success: false,
        });
      } else {
        console.log("Email sent: " + info.response);
        resolve({
          message: "The email was sent successfully!",
          data: info.response,
          success: true,
        });
      }
    });
  });
};
