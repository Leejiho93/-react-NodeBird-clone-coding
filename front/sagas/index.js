import { all, call } from 'redux-saga/effects'
import axios from 'axios';
import user from './user';
import post from './post';
import { backUrl } from '../config/config';

// 불러온 모듈은 모두 공유 되기떄문에 다른 파일(post)도 axios 적용
axios.defaults.baseURL = `${backUrl}/api`;

export default function* rootSaga() {
    yield all([
        call(user),
        call(post)
    ])
}