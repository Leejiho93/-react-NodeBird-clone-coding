const express = require('express');
const db = require('../models');

const router = express.Router();

router.post('/', async (req, res, next) => {
    try {
        console.log('routes/post start');
        const hashtags = req.body.content.match(/#[^\s]+/g);
        console.log('routes/post hashtags: ', hashtags)
        const newPost = await db.Post.create({
            content: req.body.content,  // ex) '제로초 파이팅 #구독 #졸아요 눌러주세요
            UserId: req.user.id,
        })
        if (hashtags) {
            const result = await Promise.all(hashtags.map(tag => db.Hashtag.findOrCreate({ 
                where: { name: tag.slice(1).toLowerCase() },
            })));
            console.log('result: ', result);
            await newPost.addHashtags(result.map(r => r[0]));
        }

        const fullPost = await db.Post.findOne({
            where: { id: newPost.id },
            include: [{
                model: db.User,
            }],
        })
        res.json(fullPost);
    } catch(e) {
        console.error(e);
        next(e);
    }
});

router.post('/images', (req, res) => {

});

router.get('/:id/comments', async (req, res, next) => {

})

router.post('/:id/comment', async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).send('로그인이 필요합니다.');
        }
        const post = await db.Post.findOne({ where: { id: req.params.id }});
        if (!post) {
            return res.status(404).send('포스트가 존재하지 않습니다.');
        }
        const newComment = await db.Comment.create({
            PostId: post.id,
            UserId: req.user.id,
            content: req.body.content,
        });
        await post.addComment(newComment.id);
    } catch(e) {
        console.error(e);
        next(e);
    }
})

module.exports = router;