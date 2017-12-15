var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
	title: {
		type: String,
		required: true,
	},
	link: {
		type: String,
		required: true,
	},
	/*summary: {
		type: String,
		default: "Summary unavailable."
	},*/
	img: {
		type: String,
		default: "/assets/images/unavailable.png"
	},
	isSaved: {
		type: Boolean,
		default: false
	},
	status: {
		type: String,
		default: "Save Article"
	},
	created: {
		type: Date,
		default: Date.now
	},
	note: {
		type: Schema.Types.ObjectId,
		ref: "Note"
	}
});

ArticleSchema.index({title: "text"});

var Article  = mongoose.model("Article", ArticleSchema);
module.exports = Article;