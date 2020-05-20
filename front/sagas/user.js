import { all, fork, takeLatest, call, put, delay } from 'redux-saga/effects'
import { 
    LOG_IN_REQUEST, 
    LOG_IN_SUCCESS, 
    LOG_IN_FAILURE,
    SIGN_UP_REQUEST, 
    SIGN_UP_FAILURE, 
    SIGN_UP_SUCCESS,
    LOG_OUT_SUCCESS,
    LOG_OUT_REQUEST,
    LOG_OUT_FAILURE,
    LOAD_USER_SUCCESS,
    LOAD_USER_FAILURE,
    LOAD_USER_REQUEST} from '../reducers/user';
import axios from 'axios';

//프론트에있는 userId, password가 loginData에 담겨서 서버로 이동 (req.body.~~)
function logInAPI(loginData) {
    return axios.post('/user/login', loginData, {
        withCredentials: true,   // 프론트 쿠키 설정
    })
}

function* logIn(action) {
    try {
        const result = yield call(logInAPI, action.data);  // 로그인 성공 했을 때 filteredUser 받아옴
        yield put({
            type: LOG_IN_SUCCESS,
            data: result.data,
        })
    } catch (e) {
        console.error(e);
        yield put({
            type: LOG_IN_FAILURE,
        })
    }
}

function* watchLogIn() {
    yield takeLatest(LOG_IN_REQUEST, logIn);
}

function signUpAPI(signUpData) {
    //서버에 요청을 보내는 부분
    return axios.post('/user/', signUpData);
}

// action에 dispatch에서 전달한 id, password, nickname이 들어있음
function* signUp(action) {
    try {
        yield call(signUpAPI, action.data)
        yield put({
            type: SIGN_UP_SUCCESS
        })
    } catch(e) {
        console.error(e);
        yield put({
            type: SIGN_UP_FAILURE,
            error: e,
        })
    }
}

function* watchSignUp() {
    yield takeLatest(SIGN_UP_REQUEST, signUp);
}

function logOutAPI() {
    // post 매개변수 (주소, 데이터, 옵션)
    return axios.post('/user/logout', {}, { 
        withCredentials: true,
    });
}

function* logOut() {
    try {
        yield call(logOutAPI)
        yield put({
            type: LOG_OUT_SUCCESS
        })
    } catch(e) {
        console.error(e);
        yield put({
            type: LOG_OUT_FAILURE,
            error: e,
        })
    }
}

function* watchLogOut() {
    yield takeLatest(LOG_OUT_REQUEST, logOut);
}


//남의 정보 load
function loadUserAPI(userId) {
    return axios.get(userId ? `/user/${userId}` : '/user/', {
        withCredentials: true
    });
}

function* loadUser(action) {
    try {
        const result = yield call(loadUserAPI, action.data)
        yield put({
            type: LOAD_USER_SUCCESS,
            data: result.data,
            me: !action.data,
        })
    } catch(e) {
        console.error(e);
        yield put({
            type: LOAD_USER_FAILURE,
            error: e,
        })
    }
}

function* watchLoadUser() {
    yield takeLatest(LOAD_USER_REQUEST, loadUser);
}

export default function* userSaga() {
    yield all([
        fork(watchLogIn),
        fork(watchLogOut),
        fork(watchLoadUser),
        fork(watchSignUp),
    ]);
}