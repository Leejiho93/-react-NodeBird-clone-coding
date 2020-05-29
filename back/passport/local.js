const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const bcrypt = require('bcrypt');
const db = require('../models');

module.exports = () => {
    passport.use(new LocalStrategy({
        usernameField: 'userId',
        passwordField: 'password'
    }, async (userId, password, done) => {  //프론트 (login -> saga) 에서 보낸 req.body.userId, req.body.password
        try {
            const user = await db.User.findOne({ where: {userId}}) 
            if (!user) {
                return done(null, false, { reason: '존재하지 않는 사용자입니다.!'})
                //첫번째 매개변수: 서버쪽 에러
                //두번째 매개변수: 성공시
                //세번째 매개변수: 로직상 에러
            }
            const result = await bcrypt.compare(password, user.password);
            if (result) {
                return done(null, user); // -> router/user 의 post /login 이동
            }
            return done(null, false, { reason: '비밀번호가 틀립니다.'})  
        } catch(e) {
            console.error(e);
            return done(e);
        }
    }));
};
