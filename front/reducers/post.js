const initalState = {
    mainPosts: [{
        User: {
            id: 1,
            nickname: '제로초',
        },
        content: '첫번 째 게시글',
        img: 'https://bookthumb-phinf.pstatic.net/cover/137/995/13799585.jpg?udate=20180726',
    }],
    imagePaths: [],
}

const ADD_POST = 'ADD_POST';
const ADD_DUMMY = 'ADD_DUMMY';

const addPost = {
    type: ADD_POST,
    data: {
        content: 'Hello',
        UserId: 1,
        User: {
            nickname: '보노보노'
        }
    }
}

const reducer = (state = initalState, action) => {
    switch (action.type) {
        case ADD_POST: {
            return {
                ...state,
            }
        }
        case ADD_DUMMY: {
            return {
                ...state,
                mainPosts: [action.data, ...state.mainPosts]
            }
        }
        default: {
            return {
                ...state
            }
        }
    }
};

export default reducer;