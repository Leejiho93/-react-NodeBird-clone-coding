const passport = require('passport');
const db = require('../models');
const local = require('./local');

module.exports = () => {
    // req.login
    // 요청 보낼때 마다 serializeUser가 실행

    passport.serializeUser((user, done) => { // 서버쪽에 [{ id: 3, cookie: 'asdgh' }]  cookie는 프론트로 보냄
        return done(null, user.id);
    });
    // 서버에 현재 접속한 유저의 정보를 모두 저장하기에는 메모리에 무리가 가기때문에
    // id 값과 쿠키값만 저장후 쿠키는 프론트로 보냄, 프론트에서 사용자 정보를 위해 쿠키를 서버로 보내면 
    

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await db.User.findOne({
                where: { id },
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
                    attributes: ['id'],
                  }],
            });
            return done(null, user); // req.user 에 저장됨
        } catch(e) {
            console.error(e);
            return done(e);
        }
    });

    // 쿠키와 일치하는 id를 찾은후 deserialize를 이용해 db에 있는 상세한 유저 정보를 가져옴
    // req.user로 사용자 정보가 들어감

    
    // 실무에서는 deserializeUser 결과물 캐싱

    local();
};
