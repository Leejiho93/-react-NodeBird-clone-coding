import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { LOAD_USER_POSTS_REQUEST } from '../reducers/post';
import { Avatar, Card } from 'antd';
import { LOAD_USER_REQUEST } from '../reducers/user';
import PostCard from '../components/PostCard';

const User = ({ id }) => {
    const dispatch = useDispatch();
    const { mainPosts } = useSelector(state => state.post);
    const { userInfo } = useSelector(state => state.user);

    useEffect(() => {
        dispatch({
            type: LOAD_USER_REQUEST,
            data: id,
        });
        dispatch({
            type: LOAD_USER_POSTS_REQUEST,
            data: id,
        });
    }, []);

    console.log('userInfo:', userInfo)
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
                <PostCard key={+c.createdAt} post={c} />
            ))}
        </div>
    )
}

User.propTypes = {
    id: PropTypes.number.isRequired
}

User.getInitialProps = async (context) => {
    console.log('User getInitialProps: ', context.query.id)
    return { id: parseInt(context.query.id, 10) }
    //컴포넌트의 props 전달 가능
    // retrun 값은 _app.js의 pageProps로 전달 
}

export default User;