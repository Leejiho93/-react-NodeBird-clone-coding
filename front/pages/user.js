import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { LOAD_USER_POSTS_REQUEST } from '../reducers/post';
import { Avatar, Card } from 'antd';
import { LOAD_USER_REQUEST } from '../reducers/user';
import PostCard from '../containers/PostCard';

const User = () => {
    const { mainPosts } = useSelector(state => state.post);
    const { userInfo } = useSelector(state => state.user);

    return (
        <div>
            {userInfo
                ? <Card
                    actions={[
                        <div key="twit">
                            짹짹
                        <br />
                            {userInfo.Posts}
                        </div>,
                        <div key="following">
                            팔로잉
                        <br />
                            {userInfo.Followings}
                        </div>,
                        <div key="follower">
                            팔로워
                        <br />
                            {userInfo.Followers}
                        </div>,
                    ]}
                >
                    <Card.Meta
                        avatar={<Avatar>{userInfo.nickname[0]}</Avatar>}
                        title={userInfo.nickname}
                    />
                </Card>
                : null}
            {mainPosts.map(c => (
                <PostCard key={c.id} post={c} />
            ))}
        </div>
    )
}

User.getInitialProps = async (context) => {
    // console.log('User getInitialProps: ', context.query.id)
    const id = context.query.id
    context.store.dispatch({
        type: LOAD_USER_REQUEST,
        data: id,
    });
    context.store.dispatch({
        type: LOAD_USER_POSTS_REQUEST,
        data: id,
    });

    return { id }
    //컴포넌트의 props 전달 가능
    // retrun 값은 _app.js의 pageProps로 전달 
}

export default User;