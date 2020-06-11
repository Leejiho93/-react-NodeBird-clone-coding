const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../models');
const { isLoggedIn, isPostExist } = require('./middleware');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');

const router = express.Router();

//aws 접근 config
AWS.config.update({
    // region: 'ap-northeast-2', //서울
    region: 'us-east-2',
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
})

const upload = multer({
     //서버 하드에 저장
    // storage: multer.diskStorage({  //서버 하드에 저장하겠다.
    //     destination(req, file, done) {
    //         done(null, 'uploads')  // 서버에러, 성공했을때
    //     },
    //     filename(req, file, done) {
    //         const ext = path.extname(file.originalname)
    //         const basename = path.basename(file.originalname, ext); // 보노보노.png,  ext===.png, basename===보노보노
    //         done(null, basename + new Date().valueOf() + ext)   // 서버에러, 성공했을때
    //     }
    // }),
    // limits: { fileSize: 20 * 1024 * 1024 },
    storage: multerS3({  
        s3: new AWS.S3(),
        bucket: 'easyhonodebird',
        key(req, file, cb) {
            cb(null, `original/${+new Date()}${path.basename(file.originalname)}`);
        },
    }),
    limits: { fileSize: 20 * 1024 * 1024 },
});

// post 는 이미지 path (text) 이기 떄문에 upload.none() 사용
// 폼데이터 파일 -> req.file(s), 폼데이터 일반 값 -> req.body
router.post('/', isLoggedIn, upload.none(), async (req, res, next) => {
    try {
        const hashtags = req.body.content.match(/#[^\s]+/g);
        const newPost = await db.Post.create({
            content: req.body.content,  // ex) '제로초 파이팅 #구독 #졸아요 눌러주세요
            UserId: req.user.id,
        })
        if (hashtags) {
            const result = await Promise.all(hashtags.map(tag => db.Hashtag.findOrCreate({ 
                where: { name: tag.slice(1).toLowerCase() },
            })));
            await newPost.addHashtags(result.map(r => r[0]));
        }
        // console.log('req.body.image', req.body.image )
        if (req.body.image) { // 이미지 주소를 여러개 올리면 image: [주소1, 주소2]
            if (Array.isArray(req.body.image)) {
                const images = await Promise.all(req.body.image.map((image) => {
                    return db.Image.create({ src: image});
                }));
                await newPost.addImages(images)
            } else {  // 이미지 하나만 올리면 image: 주소1
                const image = await db.Image.create({ src: req.body.image });
                await newPost.addImage(image);
            }
        }
     
        const fullPost = await db.Post.findOne({
            where: { id: newPost.id },
            include: [{
                model: db.User,
                attributes: ['id', 'nickname'],
            }, {
                model: db.Image,
            }],
        })
        res.json(fullPost);
    } catch(e) {
        console.error(e);
        next(e);
    }
});


// upload.array('image')  image 는 imageFormData.append('image', f) 와 일치
router.post('/images', upload.array('image'), (req, res) => {
    // console.log('req.files', req.files)
    // res.json(req.files.map(v => v.filename));  // diskStorage
    res.json(req.files.map(v => v.location));
});

router.get('/:id', async(req, res, next) => {
    try {
        const post = await db.Post.findOne({
            where: { id: req.params.id },
            include: [{
                model: db.User,
                attributes: ['id', 'nickname'],
            }, {
                model: db.Image,
            }]
        })
        res.json(post);
    } catch(e) {
        console.error(e);
        next(e);
    }
})

router.delete('/:id', isLoggedIn, isPostExist, async(req, res, next) => {
    try {
        await db.Post.destroy({ where: { id: req.params.id }});
        res.send(req.params.id);
    } catch(e) {
        console.error(e);
        next(e);
    }
})

router.get('/:id/comments', isPostExist, async (req, res, next) => {
    try {
        const comments = await db.Comment.findAll({
            where: {
                PostId: req.params.id,
            },
            order: [['createdAt', 'ASC']],
            include: [{
                model: db.User,
                attributes: ['id', 'nickname'],
            }]
        });
        return res.json(comments);
    } catch(e) {
        console.error(e);
        return next(e);
    }
})

router.post('/:id/comment', isLoggedIn, isPostExist, async (req, res, next) => {
    try {
        const post = await db.Post.findOne({ where: { id: req.params.id }});
        const newComment = await db.Comment.create({
            PostId: post.id,
            UserId: req.user.id,
            content: req.body.content,
        });
        await post.addComment(newComment.id);
        const comment = await db.Comment.findOne({
            where: {
                id: newComment.id,
            },
            include: [{
                model: db.User,
                attributes: ['id', 'nickname'],
            }]
        })
        return res.json(comment);
    } catch(e) {
        console.error(e);
        return next(e);
    }
});

router.post('/:id/like', isLoggedIn, isPostExist, async (req, res, next) => {
    try {
        const post = await db.Post.findOne({ where: { id: req.params.id }})
        await post.addLiker(req.user.id);
        res.json({ userId: req.user.id })
    } catch(e) {
        console.error(e);
        next(e);
    } 
});

router.delete('/:id/like', isLoggedIn, isPostExist, async (req, res, next) => {
    try {
        const post = await db.Post.findOne({ where: { id: req.params.id }})
        await post.removeLiker(req.user.id);
        res.json({ userId: req.user.id })
    } catch(e) {
        console.error(e);
        next(e);
    } 
});

router.post('/:id/retweet', isLoggedIn, isPostExist, async (req, res, next) => {
    try {
        const post = await db.Post.findOne({ 
            where: { id: req.params.id },
            include: [{
                model: db.Post,
                as: 'Retweet',
            }]
        })
        if (req.user.id === post.UserId || (post.Retweet && post.Retweet.UserId === req.user.id)) {
            return res.status(403).send('자신의 글은 리트윗 할 수 없습니다.');
        }
        const retweetTargetId = post.RetweetId || post.id;
        const exPost = await db.Post.findOne({
            where: {
                UserId: req.user.id,
                RetweetId: retweetTargetId,
            },
        });
        if (exPost) {
            return res.status(403).send('이미 리트윗 했습니다.')
        }

        const retweet = await db.Post.create({
            UserId: req.user.id,
            RetweetId: retweetTargetId,
            content: 'retweet',
        })

        const retweetWithPrevPost = await db.Post.findOne({
            where: { id: retweet.id},
            include: [{
                model: db.User,
                attributes: ['id', 'nickname'],
            }, {
                model: db.Post,
                as: 'Retweet',
                include: [{
                    model: db.User,
                    attributes: ['id', 'nickname'],
                }, {
                    model: db.Image,
                }]
            }]
        })

        res.json(retweetWithPrevPost);
    } catch(e) {
        console.error(e);
        next(e);
    }
});



module.exports = router;