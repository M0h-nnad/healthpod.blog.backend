const User = require('../models/user.model');
const Post = require('../models/posts.model');
const fs = require('fs');
const mongoose = require('mongoose');

exports.CreatePost = async (req, res, next) => {
	// console.log(req.body);
	if (req.body.photo !== 'null') {
		// const url = req.protocol + "://" +  "blog.healthtime.ie";
		// const url = req.protocol + "://" + "localhost:3000";

		req.body['imagePath'] = '/images/' + req.file.filename;
	}

	// console.log(req.body["imagePath"]);
	try {
		// req.body.tags = JSON.parse(req.body.tags);
		let newPost = await new Post(req.body);
		await newPost.save();
		await User.updateOne(
			{ _id: req.body.authorId },
			{ $addToSet: { posts: newPost } },
			{ new: true },
		);
		res.status(200).send({ message: 'created Succefully' });
	} catch (e) {
		console.log(e);
	}
};

exports.GetAllPosts = async (req, res, next) => {
	const pageSize = +req.query.pagesize;
	const currentPage = +req.query.page;
	let count = await Post.countDocuments({ published: true });
	if (pageSize >= 0 && currentPage >= 0) {
		let Posts = await Post.find({ published: true }, {}, { sort: { _id: -1 } })
			.skip(pageSize * (currentPage - 1))
			.limit(pageSize);
		return res.status(200).json({ Posts, count });
	}
	let Posts = await Post.find({ published: true }, {}, { sort: { _id: -1 } });
	res.status(200).json({ Posts, count });
};

exports.DeletePost = async (req, res, next) => {
	try {
		const post = await Post.findById(req.params.id);
		console.log(post);
		if (post) {
			let deleted = await Post.findByIdAndDelete({ _id: req.params.id });
			let deletedFromUsers = await User.updateOne(
				{ _id: deleted.authorId },
				{ $pull: { posts: req.params.id } },
			);
			if (post.imagePath) {
				let imagePath = post.imagePath.split(':')[2].split('/');
				imagePath = imagePath[1] + '/' + imagePath[2];
				if (fs.existsSync(imagePath)) {
					await fs.promises.unlink(imagePath);
				}
			}

			res.status(200).json({ message: 'The Post Deleted !', deletedId: req.params.id });
		} else {
			res.status(404).json({ message: 'Post Is not Found' });
		}
	} catch (e) {
		console.log(e);
	}
};

async function increaseView(id) {
	try {
		const dayWithTime = new Date();
		// console.log(day, typeof day);
		const textDate = dayWithTime.toDateString();
		const today = new Date(textDate);
		console.log(today);
		const selectedPost = await Post.findOne({
			_id: id,
			'views.day': today,
		});
		console.log(selectedPost);
		if (selectedPost) {
			await Post.updateOne({ _id: id, 'views.day': today }, { $inc: { 'views.$.num': 1 } });
		} else {
			const p = await Post.updateOne({ _id: id }, { $push: { views: { day: today, num: 1 } } });
			console.log(p);
		}
		return true;
	} catch (e) {
		return e;
	}
}

exports.getPost = (req, res, next) => {
	const isReloaded = req.query.isReloaded;
	const id = req.params.id;
	Post.findById(id)
		.select('-_id -__v')
		.then(async (post) => {
			if (post) {
				try {
					// if (!isReloaded) {
					// }
					const val = await increaseView(id);
					console.log(val);
				} catch (e) {
					console.log(e);
				}
				User.findById(post.authorId)
					.then((user) => {
						res.status(200).json({ user, post });
					})
					.catch((e) => {
						res.status(500).send({ message: 'Server Error' });
					});
			} else {
				res.status(404).json({ message: 'Post in not found' });
			}
		})
		.catch((e) => {
			res.status(500).send({ message: 'Server Error' });
		});
};

exports.UpdatePost = async (req, res, next) => {
	let imagePath = req.body.imagePath;
	if (req.body.photo !== 'null') {
		// const url = req.protocol + "://" + req.get("host")
		req.body['imagePath'] = '/images/' + req.file.filename;
	}
	req.body.tags = JSON.parse(req.body.tags);
	let updatePost = await Post.findByIdAndUpdate(
		{ _id: req.params.id },
		{ $set: req.body },
		{ new: true },
	);
	//let updateUser = await User.findByIdAndUpdate({_id:req.body.authorId},{$set:{posts:})
	return updatePost.save((err) => {
		console.log(err);
		res.status(200).json({ updatePost, message: 'Post Is Updated' });
	});
};

exports.getUserPosts = async (req, res, next) => {
	const authorId = req.params.id;
	const pageSize = +req.query.pageSize;
	const currentPage = +req.query.page;
	let count = await Post.countDocuments({ authorId });
	const posts = await Post.find({ authorId })
		.skip(pageSize * (currentPage - 1))
		.limit(pageSize);

	console.log(posts.length);
	console.log(count);
	// if (!user) {
	//   return res.status(404);
	// }

	res.status(200).send({ posts, count });
};

exports.publishPost = async (req, res, next) => {
	const id = req.params.id;
	let publishState = req.body.publishState;
	publishState = !publishState;
	const UpdatedPost = await Post.findByIdAndUpdate(
		id,
		{ $set: { published: publishState } },
		{ new: true },
	);

	res.status(200).json({ message: 'Done' });
};

exports.postsSearch = async (req, res, next) => {
	const search = req.query.search;
	console.log(search);
	const posts = await Post.find({ $text: { $search: search } });

	res.status(200).send({ posts });
};

exports.increaseShare = async (req, res, next) => {
	const id = req.params.id;
	try {
		const dayWithTime = new Date();
		const textDate = dayWithTime.toDateString();
		const today = new Date(textDate);
		const selectedPost = await Post.findOne({
			_id: id,
			'shares.day': today,
		});
		if (selectedPost) {
			await Post.updateOne({ _id: id, 'shares.day': today }, { $inc: { 'shares.$.num': 1 } });
		} else {
			const p = await Post.updateOne({ _id: id }, { $push: { shares: { day: today, num: 1 } } });
		}
		res.status(200).send({ message: 'done' });
	} catch (e) {
		console.log(e);
		res.status(500).send({ message: 'unknown error' });
	}
};

exports.getDashboardData = async (req, res, next) => {
	const id = req.user.id;
	console.log(id);
	Post.aggregate([
		{
			$match: {
				authorId: new mongoose.Types.ObjectId(id),
			},
		},
		{ $unwind: { path: '$views' } },
		{ $unwind: { path: '$shares', preserveNullAndEmptyArrays: true } },

		{ $sort: { 'views.day': 1 } },
		{ $sort: { 'shares.day': 1 } },

		{
			$group: {
				_id: '',
				views: {
					$push: '$views',
				},
				shares: { $push: '$shares' },
				numOfViews: {
					$sum: { $sum: '$views.num' },
				},
				numOfShares: {
					$sum: { $sum: '$shares.num' },
				},
				// authorId: { $first: "$authorId" },
			},
		},
	]).then((val) => {
		res.json(...val);
	});
};
