var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

var PORT = 3000;

// Require all models
var db = require("./models");

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/____________", {
  useMongoClient: true
});

// When the server starts, create and save a new _______ document to the db
// The "unique" rule in the _______ model's schema will prevent duplicate ________ from being added to the server
db._______
  .create({ name: " _______" })
  .then(function(db_______) {
    // If saved successfully, print the new _______ document to the console
    console.log(db_______);
  })
  .catch(function(err) {
    // If an error occurs, print it to the console
    console.log(err.message);
  });

// Routes

// POST route for saving a new ----- to the db and associating it with a _______
app.post("/submit", function(req, res) {
  // Create a new ----- in the database
  db.-----
    .create(req.body)
    .then(function(db-----) {
      // If a ----- was created successfully, find one _______ (there's only one) and push the new -----'s _id to the _______'s `-----s` array
      // { new: true } tells the query that we want it to return the updated _______ -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db._______.findOneAndUpdate({}, { $push: { -----s: db-----._id } }, { new: true });
    })
    .then(function(db_______) {
      // If the _______ was updated successfully, send it back to the client
      res.json(db_______);
    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});

// Route for getting all -----s from the db
app.get("/-----s", function(req, res) {
  // Using our ----- model, "find" every ----- in our db
  db.-----
    .find({})
    .then(function(db-----) {
      // If any -----s are found, send them to the client
      res.json(db-----);
    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});

// Route for getting all ________ from the db
app.get("/_______", function(req, res) {
  // Using our _______ model, "find" every _______ in our db
  db._______
    .find({})
    .then(function(db_______) {
      // If any ________ are found, send them to the client
      res.json(db_______);
    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});

// Route to see what _______ looks like WITH populating
app.get("/populated", function(req, res) {
  // Using our _______ model, "find" every _______ in our db and populate them with any associated -----s
  db._______
    .find({})
    // Specify that we want to populate the retrieved ________ with any associated -----s
    .populate("-----s")
    .then(function(db_______) {
      // If any ________ are found, send them to the client with any associated -----s
      res.json(db_______);
    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
