const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport')
const db = require('../models');
const { isLoggedIn } = require('./middleware');

const router = express.Router();

 
// API는 다른 서비스나 내 서비스의 기능을 실행할 수 있게 열어둔 창구
// 프론트에서 요청보내면 이부분 실행
router.get('/', isLoggedIn, (req, res) => {  // /api/user/    -> index.js에 userAPIRouter로 반복 줄이기
    const user = Object.assign({}, req.user.toJSON());  //db에서 가져온 객체를 변형할 때는 toJSON 붙여야됨
    delete user.password;
    return res.json(user);
});

// send 는 문자열
// json 는 json
router.post('/', async (req, res, next) => {
    try {
        const exUser = await db.User.findOne({
            where: {
                userId: req.body.userId,
            },
        });
        if (exUser) {
            return res.status(404).send('이미 사용중인 아이디입니다.');
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 12);   // salt는 10~13사이
        const newUser = await db.User.create({
            nickname: req.body.nickname,
            userId: req.body.userId,
            password: hashedPassword,
        });
        console.log(newUser);
        return res.status(200).json(newUser);

    } catch(e) {
        console.error(e);
        // 에러처리는 여기서

        return next(e);  // 프론트에 최종적으로 에러 알려줌
    }

});

router.get('/:id', async (req, res, next) => { // 남의 정보 가져옴  ex) /3  -> id 3인 유저 정보 가져옴
    try {
        const user = await db.User.findOne({
            where: { id: parseInt(req.params.id, 10 )},
            inlcude: [{
                model: db.Post,
                as: 'Posts',
                attributes: ['id'],
            }, {
                model: db.User,
                as: 'Followings',
                attributes: ['id'],
            }, {
                model: db.User,
                as: 'Followers',
                attributes: ['id'],
            }],
            attributes: ['id', 'nickname'],
        })
        const jsonUser = user.toJSON();
        jsonUser.Posts = jsonUser.Posts ? jsonUser.Post.length : 0;
        jsonUser.Followings = jsonUser.Followings ? jsonUser.Followings.length : 0;
        jsonUser.Followers = jsonUser.Followers ? jsonUser.Followers.length : 0;
        res.json(jsonUser);
    } catch(e) {
        console.error(e);
        next(e);
    }
});


router.post('/logout', (req, res) => {
    req.logout();
    req.session.destroy();
    res.send('logout 성공');
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {  // done의 인수 (err 서버실패, user  성공, info 로직실패)
        if (err) {
            console.error(err);
            return next(err);
        } 
        if (info) {
            return res.status(401).send(info.reason);
        }
        return req.login(user, async (loginErr) => {   // req.login 이 되면 passort/index 이동 serializeUser 실행
            if (loginErr) {
                return next(loginErr);
            }

            const fullUser = await db.User.findOne({
                where: { id: user.id},
                include: [{
                    model: db.Post,
                    as: 'Posts',
                    attributes: ['id'],
                }, {
                    model: db.User,
                    as: 'Followings',
                    attributes: ['id'],
                }, {
                    model: db.User,
                    as: 'Followers',
                    attributes: ['id'],  // id 만 가져옴
                }],
                attributes: ['id', 'nickname', 'userId'],  // 비밀번호 빼고 가져옴
            })

            // const filteredUser = Object.assign({}, user.toJSON());  //객체의 얇은 복사
            // delete filteredUser.password;  // 유저의 비밀번호 삭제
            // console.log('filteredUser: ',filteredUser);
            // return res.json(filteredUser);

            return res.json(fullUser);
        });
    })(req, res, next);
});
router.get('/:id/followings', isLoggedIn, async (req, res, next) => {
    try {
        const user = await db.User.findOne({
            where: { id: parseInt(req.params.id, 10) }
        });
        const followings = await user.getFollowings({
            attributes: ['id', 'nickname'],
        });
        res.json(followings)
    } catch(e) {
        console.error(e);
        next(e);
    }
});

router.get('/:id/followers', async (req, res, next) => {
    try {
        const user = await db.User.findOne({
            where: { id: parseInt(req.params.id, 10) }
        });
        const followers = await user.getFollowers({
            attributes: ['id', 'nickname'],
        });
        res.json(followers);
    } catch(e) {
        console.error(e);
        next(e);
    }
});

router.delete('/:id/follower', async (req, res, next) => {
    try {
        const me = await db.User.findOne({
            where: { id: req.user.id },
        })
        await me.removeFollower(req.params.id);
        res.send(req.params.id);
    } catch(e) {
        console.error(e);
        next(e);
    }
});

router.post('/:id/follow', isLoggedIn, async (req, res, next) => {
    try {
        const me = await db.User.findOne({
            where: { id: req.user.id }
        });
        await me.addFollowing(req.params.id);
        res.send(req.params.id);
    } catch(e) {
        console.error(e);
        next(e);
    }
});

router.delete('/:id/follow', async (req, res, next) => {
    try {
        const me = await db.User.findOne({
            where: { id: req.user.id }
        });
        await me.removeFollowing(req.params.id);
        res.send(req.params.id);
    } catch(e) {
        console.error(e);
        next(e);
    }
});

router.get('/:id/posts',async (req, res, next) => {
    try {
        const posts = await db.Post.findAll({
            where: {
                UserId: parseInt(req.params.id, 10),
                RetweetId: null,
            },
            include: [{
                model: db.User,
                attributes: ['id', 'nickname'],
            }, {
                model: db.Image,
            }, {
                model: db.User,
                through: 'Like',
                as: 'Likers',
                attributes: ['id'],
            }]
        })
        res.json(posts);
    } catch(e) {
        console.error(e);
        next(e);
    }
});

router.patch('/nickname', isLoggedIn, async (req, res, next) => {
    try {
        await db.User.update({
            nickname: req.body.nickname,
        }, {
           where: { id: req.user.id }, 
        });
        res.send(req.body.nickname);
    } catch(e) {
        console.error(e);
        next(e);
    }
})


module.exports = router;