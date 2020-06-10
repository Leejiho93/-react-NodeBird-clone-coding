// npm i -g sequelize-cli // sequelize init // npm i mysql2 
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const dotenv = require('dotenv');
const passport = require('passport');

const passportConfig = require('./passport');
const db = require('./models');
const userAPIRouter = require('./routes/user');
const postAPIRouter = require('./routes/post');
const postsAPIRouter = require('./routes/posts');
const hashtagAPIRouter = require('./routes/hashtag');

const prod = process.env.NODE_ENV === 'production';

dotenv.config();
const app = express();
db.sequelize.sync();  // model에 있는 db 연결
passportConfig();

if (prod) {
    app.use(hpp());
    app.use(helmet());
    app.use(morgan('combined'));
    app.use(cors({
        origin: 'http://easyhonodebird.com',
        credentials: true,
    }));

} else {
    app.use(morgan('dev'));  // 요청에 대한 log 보여줌 
    app.use(cors({
        // 프론트와 서버 쿠키 교환
        origin: true,         
        credentials: true, 
    })); // 다른서버에서 요청와도 에러 안나옴
}


app.use('/', express.static('uploads'))  // 이미지 미리보기 (다른 서버에서 자유롭게 볼 수 있음) // uploads 경로를 / (루트)로
app.use(express.json()); // req.body 쓸려면
app.use(express.urlencoded({ extended: true })) // 요청의 본문을 req.body에 넣어줌
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(expressSession({
    resave: false,   // 매번 세션 강제 저장
    saveUninitialized: false,  // 빈 값도 저장
    secret: process.env.COOKIE_SECRET,  // 암호화 
    cookie: {
        httpOnly: true, // 자바스크립트는 접근 불가능(보안)
        secure: false, //https를 쓸때 true
        domain: prod && '.easyhonodebird.com', // 쿠키 api.easyhonodebird 와 easyhonodebird 모두 가능.
    },
    name: 'rnbck',
}));

// expressSession 후 사용하기때문에 expressSession 밑에 적어여됨
app.use(passport.initialize()); 
app.use(passport.session());

app.get('/', (req, res) => {
    res.send('react nodebird 백엔드 정상 동작');
});

app.use('/api/user', userAPIRouter);
app.use('/api/post', postAPIRouter);
app.use('/api/posts', postsAPIRouter);
app.use('/api/hashtag', hashtagAPIRouter);

app.listen(prod ? process.env.PORT : 3065, () => {
    console.log(`server is running on ${process.env.PORT}`);
})
