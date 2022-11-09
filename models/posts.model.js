const mongoose = require('mongoose');
const { Mixed } = require('mongoose');
const Comments = require('./comment.model').schema;
// const user = require("./user.model").schema;

const postShema = mongoose.Schema(
	{
		authorName: { type: String },
		authorId: { type: mongoose.ObjectId },
		imagePath: { type: String },
		title: { type: String },
		content: { type: String },
		date: { type: Date, default: Date.now },
		// comments: [Comments],
		published: { type: Boolean, default: false },
		views: {
			type: [{ day: Date, num: Number }],
			default: [],
			_id: false,
		},
		category: { type: String, required: true },
		shares: {
			type: [{ day: Date, num: Number }],
			default: [],
			_id: false,
		},
	},
	{ timestamp: true },
);

postShema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Post', postShema);
