// next를 express에 연결 (해시태그 route를 위해[next는 동적 route제공 x])
// npm i express-session morgan cookie-parser dotenv
// npm i -D nodemon

const express = require('express');
const next = require('next');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const dotenv = require('dotenv');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';  // 개발모드
const prod = process.env.NODE_ENV === 'production';

const app = next({ dev });
const handle = app.getRequestHandler();
dotenv.config();

app.prepare().then(() => {
    const server = express();

    server.use(morgan('dev'));
    server.use('/', express.static(path.join(__dirname, 'public'))); // favicon  앞 프론트 주소, 뒤 백엔드 주소
    server.use(express.json());
    server.use(express.urlencoded({ extended: true }));
    server.use(cookieParser(process.env.COOKIE_SECRET));  //back COOKIE_SECRET이랑 같게하자
    server.use(expressSession({
        resave: false,
        saveUninitialized: false,
        secret: process.env.COOKIE_SECRET,
        cookie: {
            httpOnly: true,
            secure: false,
        }
    }));
    
    server.get('/post/:id', (req, res) => {
        return app.render(req, res, '/post', { id: req.params.id });
    })

    server.get('/hashtag/:tag', (req, res) => {
        return app.render(req, res, '/hashtag', { tag: req.params.tag });
    })

    server.get('/user/:id', (req, res) => {
        return app.render(req, res, '/user', { id: req.params.id });
    })

    // *는 모든 요청을 처리
    server.get('*', (req, res) => { 
        return handle(req, res);
    });

    server.listen(3060, () => {
        console.log('next-express running on port 3060');
    })
})
