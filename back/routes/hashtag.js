const express = require('express');
const db = require('../models');

const router = express.Router();

router.get('/:tag', async (req, res, next) => {
    try {
        const posts = await db.Post.findAll({
            include: [{
                model: db.Hashtag,
                where: { name: decodeURIComponent(req.params.tag) },
                // 한글, 특수문자는 주소창에 쓸떄 URIComponent로 바뀌기 떄문에 decode 해줘야함
            }, {
                model: db.User,
                attribute: ['id', 'nickname'],
            }, {
                model: db.Image
            }, {
                model: db.User,
                through: 'Like',
                as: 'Likers',
                attributes: ['id'],
            }, {
                model: db.Post,
                as: 'Retweet',
                include: [{
                    model: db.User,
                    attributes: ['id', 'nickname'],
                }, {
                    mode: db.Image
                }]
            }],
        })
        res.json(posts);
    } catch(e) {
        console.error(e);
        next(e);
    }
});

module.exports = router;