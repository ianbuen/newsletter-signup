const express = require("express");
const https = require('https');
const mailchimp = require("@mailchimp/mailchimp_marketing");

// MailChimp API key
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: "us2",
});

// MailChimp Audience List ID for the Newsletter
const listID = process.env.AUDIENCE_LIST_ID;

// start express application
const app = express();

// this line defines a static directory for local resources
app.use(express.static("public"));

// body-parser is deprecated, using this instead
app.use(express.urlencoded({extended: true}));

// When page loads, display signup.html
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/signup.html");
});

// When signup.html form submitted, make request to mailchimp
app.post("/", function(req, res) {

  // create a JSON object based on collected user input
  const jsonData = {
    email_address: req.body.txtEmail,
    status: "subscribed",
    merge_fields: {
      FNAME: req.body.txtFirstName,
      LNAME: req.body.txtLastName
    }
  };

  // async function for mailchimp to add subscriber
  async function run() {

    // addListMember requires the listID of where you're putting the subscriber
    // as well the JSON object of the subscriber details
    try {
      const response = await mailchimp.lists.addListMember(listID, jsonData);

      if (response.status === "subscribed")
          res.sendFile(__dirname + "/success.html");

    } catch(error) {
      console.log(error);
      res.sendFile(__dirname + "/failure.html");
    }

  }

  // run the async function
  run();

});

app.post("/failure", function(req, res) {
    res.redirect("/");
});

app.listen(process.env.PORT || 80, function() {
  console.log("Server is running on port 80.");
});
