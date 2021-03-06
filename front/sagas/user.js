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
    LOAD_USER_REQUEST,
    FOLLOW_USER_SUCCESS,
    FOLLOW_USER_REQUEST,
    FOLLOW_USER_FAILURE,
    UNFOLLOW_USER_SUCCESS,
    UNFOLLOW_USER_FAILURE,
    UNFOLLOW_USER_REQUEST,
    LOAD_FOLLOWERS_SUCCESS,
    LOAD_FOLLOWERS_REQUEST,
    LOAD_FOLLOWERS_FAILURE,
    LOAD_FOLLOWINGS_FAILURE, 
    LOAD_FOLLOWINGS_REQUEST, 
    LOAD_FOLLOWINGS_SUCCESS, 
    REMOVE_FOLLOWER_REQUEST, 
    REMOVE_FOLLOWER_SUCCESS, 
    REMOVE_FOLLOWER_FAILURE, 
    EDIT_NICKNAME_SUCCESS,
    EDIT_NICKNAME_FAILURE,
    EDIT_NICKNAME_REQUEST} from '../reducers/user';
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
            reason: e.response && e.response.data
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
        withCredentials: true  // 클라이언트에서 axios로 요청보낼 때는 브라우저가 쿠키를 같이 동봉해줌
    });  // 서버사이드 랜더링 일때는 브라우저가 없음.
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

function followAPI(userId) {
    return axios.post(`/user/${userId}/follow`, {}, {
        withCredentials: true
    });
}

function* follow(action) {
    try {
        const result = yield call(followAPI, action.data)
        yield put({
            type: FOLLOW_USER_SUCCESS,
            data: result.data,
        })
    } catch(e) {
        console.error(e);
        yield put({
            type: FOLLOW_USER_FAILURE,
            error: e,
        })
    }
}

function* watchFollow() {
    yield takeLatest(FOLLOW_USER_REQUEST, follow);
}

function UnfollowAPI(userId) {
    return axios.delete(`/user/${userId}/follow`, {
        withCredentials: true
    });
}

function* Unfollow(action) {
    try {
        const result = yield call(UnfollowAPI, action.data)
        yield put({
            type: UNFOLLOW_USER_SUCCESS,
            data: result.data,
        })
    } catch(e) {
        console.error(e);
        yield put({
            type: UNFOLLOW_USER_FAILURE,
            error: e,
        })
    }
}

function* watchUnfollow() {
    yield takeLatest(UNFOLLOW_USER_REQUEST, Unfollow);
}

function loadFollowersAPI(userId, offset = 0, limit = 3) {
    return axios.get(`/user/${userId || 0}/followers?offset=${offset}&limit=${limit}`, {
        withCredentials: true
    });
}

function* loadFollowers(action) {
    try {
        const result = yield call(loadFollowersAPI, action.data, action.offset)
        yield put({
            type: LOAD_FOLLOWERS_SUCCESS,
            data: result.data,
        })
    } catch(e) {
        console.error(e);
        yield put({
            type: LOAD_FOLLOWERS_FAILURE,
            error: e,
        })
    }
}

function* watchLoadFollowers() {
    yield takeLatest(LOAD_FOLLOWERS_REQUEST, loadFollowers);
}

function loadFollowingsAPI(userId, offset = 0, limit = 3) {
    return axios.get(`/user/${userId || 0}/followings?offset=${offset}&limit=${limit}`, {
        withCredentials: true
    });
}

function* loadFollowings(action) {
    try {
        const result = yield call(loadFollowingsAPI, action.data, action.offset)
        yield put({
            type: LOAD_FOLLOWINGS_SUCCESS,
            data: result.data,
        })
    } catch(e) {
        console.error(e);
        yield put({
            type: LOAD_FOLLOWINGS_FAILURE,
            error: e,
        })
    }
}

function* watchLoadFollowings() {
    yield takeLatest(LOAD_FOLLOWINGS_REQUEST, loadFollowings);
}

function removeFollowerAPI(userId) {
    return axios.delete(`/user/${userId}/follower`, {
        withCredentials: true
    });
}

function* removeFollower(action) {
    try {
        const result = yield call(removeFollowerAPI, action.data)
        yield put({
            type: REMOVE_FOLLOWER_SUCCESS,
            data: result.data,
        })
    } catch(e) {
        console.error(e);
        yield put({
            type: REMOVE_FOLLOWER_FAILURE,
            error: e,
        })
    }
}

function* watchRemoveFollower() {
    yield takeLatest(REMOVE_FOLLOWER_REQUEST, removeFollower);
}

function editNicknameAPI(nickname) {
    return axios.patch(`/user/nickname`, {nickname}, {
        withCredentials: true
    });
}

function* editNickname(action) {
    try {
        const result = yield call(editNicknameAPI, action.data)
        yield put({
            type: EDIT_NICKNAME_SUCCESS,
            data: result.data,
        })
    } catch(e) {
        console.error(e);
        yield put({
            type: EDIT_NICKNAME_FAILURE,
            error: e,
        })
    }
}

function* watchEditNickname() {
    yield takeLatest(EDIT_NICKNAME_REQUEST, editNickname);
}


export default function* userSaga() {
    yield all([
        fork(watchLogIn),
        fork(watchLogOut),
        fork(watchLoadUser),
        fork(watchFollow),
        fork(watchUnfollow),
        fork(watchSignUp),
        fork(watchLoadFollowers),
        fork(watchLoadFollowings),
        fork(watchRemoveFollower),
        fork(watchEditNickname),
    ]);
}