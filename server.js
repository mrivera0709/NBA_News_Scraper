// ==================================
// Dependencies
var express = require("express");
//var method = require("method-override");
var body = require("body-parser");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");
var logger = require("morgan");
var cheerio = require("cheerio");
var request = require("request");

// ==================================
// Mongoose
var Note = require("./models/Note");
var Article = require("./models/Article");
var databaseUrl = 'mongodb://localhost:27017/nba';

// ==================================
// base64 decoder
var base64ToImage = require('base64-to-image');
;

if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI);
} else {
    mongoose.connect(databaseUrl);
};

mongoose.Promise = Promise;
var db = mongoose.connection;

db.on("error", function(error) {
    console.log("Mongoose Error: ", error);
});

db.once("open", function() {
    console.log("Mongoose connection successful.");
});

var app = express();
var port = process.env.PORT || 3000;

// ==================================
// app set-ups
app.use(logger("dev"));
app.use(express.static("public"));
app.use(body.urlencoded({
    extended: false
}));
//app.use(method("_method"));
app.engine("handlebars", exphbs({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");

// ==================================
// Routes
app.get("/", function(req, res) {
    Article.find({}, null, {
        sort: {
            created: -1
        }
    }, function(err, data) {
        if (data.length === 0) {
            res.render("placeholder", {
                message: "There's nothing scraped yet. Please click \"Scrape for the latest NBA News\" from SBNation.com."
            });
        } else {
            res.render("index", {
                articles: data
            });
        }
    });
});

app.get("/scrape", function(req, res) {
    request("https://www.sbnation.com/nba-news-basketball/archives", function(error, response, html) {
        var $ = cheerio.load(html);
        var result = {};
        $("div.c-entry-box--compact").each(function(i, element) {
            var link = $(element).find("a").attr("href");
            var title = $(element).find("h2.c-entry-box--compact__title").text().trim();
            var imgTitle = $(element).attr("data-chorus-optimize-id");
            var img = //$(element).children("a").find("img.c-dynamic-image").attr("src");
            console.log(img);
            result.link = link;
            result.title = title;
            result.img = img;
            //Base64 decoder - under construction
            /*var base64Str = img;
            var path ='/assets/images';
            var optionalObj = {'filename': imgTitle, 'type':'png'};
            var image = base64ToImage(base64Str,path,optionalObj);

            result.img = path +"/" + imgTitle + ".png";
            if (img) {
                result.img = img;
            } else {
                result.img = $(element).find(".lazy-image").find("img").attr("src");
            };*/
            var entry = new Article(result);
            Article.find({
                title: result.title
            }, function(err, data) {
                if (data.length === 0) {
                    entry.save(function(err, data) {
                        if (err) throw err;
                    });
                }
            });
        });
        console.log("Scrape finished.");
        res.redirect("/");
    });
});


app.get("/saved", function(req, res) {
    Article.find({
        isSaved: true
    }, null, {
        sort: {
            created: -1
        }
    }, function(err, data) {
        if (data.length === 0) {
            res.render("placeholder", {
                message: "You have not saved any articles yet. Try to save some delicious news by simply clicking \"Save Article\"!"
            });
        } else {
            res.render("saved", {
                saved: data
            });
        }
    });
});

app.get("/:id", function(req, res) {
    Article.findById(req.params.id, function(err, data) {
        res.json(data);
    })
})

app.post("/search", function(req, res) {
    console.log(req.body.search);
    Article.find({
        $text: {
            $search: req.body.search,
            $caseSensitive: false
        }
    }, null, {
        sort: {
            created: -1
        }
    }, function(err, data) {
        console.log(data);
        if (data.length === 0) {
            res.render("placeholder", {
                message: "Nothing has been found. Please try other keywords."
            });
        } else {
            res.render("search", {
                search: data
            })
        }
    })
});

app.post("/save/:id", function(req, res) {
    Article.findById(req.params.id, function(err, data) {
        if (data.isSaved) {
            Article.findByIdAndUpdate(req.params.id, {
                $set: {
                    isSaved: false,
                    status: "Save Article"
                }
            }, {
                new: true
            }, function(err, data) {
                res.redirect("/");
            });
        } else {
            Article.findByIdAndUpdate(req.params.id, {
                $set: {
                    isSaved: true,
                    status: "Saved"
                }
            }, {
                new: true
            }, function(err, data) {
                res.redirect("/saved");
            });
        }
    });
});

app.post("/note/:id", function(req, res) {
    var note = new Note(req.body);
    note.save(function(err, doc) {
        if (err) throw err;
        Article.findByIdAndUpdate(req.params.id, {
            $set: {
                "note": doc._id
            }
        }, {
            new: true
        }, function(err, newdoc) {
            if (err) throw err;
            else {
                res.send(newdoc);
            }
        });
    });
});

app.get("/note/:id", function(req, res) {
    var id = req.params.id;
    Article.findById(id).populate("note").exec(function(err, data) {
        res.send(data.note);
    })
})

// ==================================
app.listen(port, function() {
    console.log("Listening on port " + port);
})