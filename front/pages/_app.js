import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import AppLayout from '../components/AppLayout';
import withRedux from 'next-redux-wrapper';
import withReduxSaga from 'next-redux-saga'; // next용 redux-saga
import { createStore, compose, applyMiddleware } from 'redux';
import { Provider, useSelector } from 'react-redux';
import reducer from '../reducers';
import createSagaMiddleware from 'redux-saga';
import rootSaga from '../sagas';
import { LOAD_USER_REQUEST } from '../reducers/user';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import App, { Container } from 'next/app';

// class NodeBird extends App {
//     static getInitialProps() {

//     }

//     render() {

//     }
// }

const NodeBird = ({ Component, store, pageProps }) => {
    return (
        <Container>
            <Provider store={store}>
                <Helmet
                    title="NodeBird"
                    htmlAttributes={{ lang: 'ko' }}
                    meta={[{
                        charset: 'UTF-8',
                    }, {
                        name: 'viewport',
                        content: 'width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=yes,viewport-fit=cover'
                    }, {
                        'http-equiv': 'X-UA-Compatible', content: 'IE-edge',
                    }, {
                        name: 'description', content: '제로초의 NodeBird SNS', 
                    }, {
                        name: 'og:title', content: 'NodeBird',
                    }, {
                        name: 'og:description', content: '제로초의 NodeBird SNS',
                    }, {
                        property: 'og:type', content: 'website',
                    }]}
                    link={[{
                        rel: 'shortcut icon', href: '/favicon.ico',
                    }, {
                        rel: 'stylesheet', href: "https://cdnjs.cloudflare.com/ajax/libs/antd/3.16.2/antd.css",
                    }, {
                        rel: 'stylesheet', href: "https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css",
                    }, {
                        rel: 'stylesheet', href: "https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css",
                    }]}
                />
                <AppLayout>
                    <Component {...pageProps} />
                </AppLayout>
            </Provider>
        </Container>
    )
}

NodeBird.propTypes = {
    Component: PropTypes.elementType.isRequired,
    store: PropTypes.object.isRequired,
    pageProps: PropTypes.object.isRequired,
};

NodeBird.getInitialProps = async (context) => {
    // console.log('app.js context: ', context)
    const { ctx, Component } = context;
    let pageProps = {};

    const state = ctx.store.getState();
    const cookie = ctx.isServer ? ctx.req.headers.cookie : '';
    if (ctx.isServer && cookie) {  // 클라이언트면 브라우저에 cookie가 포함되서 백엔드 전달하지만 클라이언트서버를 통해 백엔드로 전달 되면 cookie 를 직접 심어줌
        axios.defaults.headers.cookie = cookie;
    }

    if (!state.user.me) {
        ctx.store.dispatch({
            type: LOAD_USER_REQUEST,
        })
    }

    if (Component.getInitialProps) {
        pageProps = await Component.getInitialProps(ctx) || {};    // ctx 가 hashtag의 context로 이동
    }
    // console.log('_app.js pageProps: ', pageProps)
    return { pageProps };  // 컴포넌트의 props
};

const configureStore = (initialState, options) => {
    const sagaMiddleware = createSagaMiddleware();
    const middlewares = [sagaMiddleware, (store) => (next) => (action) => {
        // console.log(action);
        next(action);
    }];
    const enhancer = process.env.NODE_ENV === 'production'
        ? compose(applyMiddleware(...middlewares))
        : compose(
            applyMiddleware(...middlewares),
            !options.isServer && window.__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined' ? window.__REDUX_DEVTOOLS_EXTENSION__() : (f) => f);  // redux devtools 연결 해주는 미들웨어
    const store = createStore(reducer, initialState, enhancer);
    store.sagaTask = sagaMiddleware.run(rootSaga)  // withReduxSaga
    // sagaMiddleware.run(rootSaga);
    return store;
}

export default withRedux(configureStore)(withReduxSaga(NodeBird));

