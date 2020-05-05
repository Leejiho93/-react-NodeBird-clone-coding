import { all, fork, takeLatest, call, put, delay } from 'redux-saga/effects'
import { 
    LOG_IN_REQUEST, 
    LOG_IN_SUCCESS, 
    LOG_IN_FAILURE,
    SIGN_UP_REQUEST, 
    SIGN_UP_FAILURE, 
    SIGN_UP_SUCCESS} from '../reducers/user';
import axios from 'axios';



function loginAPI() {
    return axios.post('/login')
}

function* login() {
    try {
        // yield call(loginAPI);
        yield delay(2000);
        yield put({
            type: LOG_IN_SUCCESS
        })
    } catch (e) {
        console.error(e);
        yield put({
            type: LOG_IN_FAILURE,
        })
    }
}

function* watchLogin() {
    yield takeLatest(LOG_IN_REQUEST, login);
}

function signUpAPI() {
    //서버에 요청을 보내는 부분
}

function* signUp() {
    try {
        // yield call(signUpAPI)
        yield delay(2000)
        yield put({
            type: SIGN_UP_SUCCESS
        })
    } catch(e) {
        console.error(e);
        yield put({
            type: SIGN_UP_FAILURE
        })
    }
}

function* watchSignUp() {
    yield takeLatest(SIGN_UP_REQUEST, signUp);
}

export default function* userSaga() {
    yield all([
        fork(watchLogin),
        fork(watchSignUp),
    ]);
}