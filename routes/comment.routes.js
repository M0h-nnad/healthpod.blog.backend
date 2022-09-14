const express = require("express");
const router = express.Router();
const CommentsReqMethodes = require('../data/comment.request');

router.get('/comments/:id', CommentsReqMethodes.getPostComments);
router.post('/comments', CommentsReqMethodes.createComment);
router.put('/comments/:id', CommentsReqMethodes.updateComment);
router.delete('/comments/:id', CommentsReqMethodes.DeleteComment);

module.exports = router;
