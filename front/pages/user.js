import React, { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { LOAD_USER_POSTS_REQUEST } from '../reducers/post';
import { Avatar, Card } from 'antd';
import { LOAD_USER_REQUEST } from '../reducers/user';
import PostCard from '../containers/PostCard';

const User = () => {
    const { mainPosts, hasMorePost } = useSelector(state => state.post);
    const { userInfo, me } = useSelector(state => state.user);
    const countRef = useRef([]);
    const dispatch = useDispatch();

    const onScroll = useCallback(() => {
        // console.log(window.scrollY,  document.documentElement.clientHeight,  document.documentElement.scrollHeight)
        // console.log(window.scrollY, document.documentElement.clientHeight, document.documentElement.scrollHeight);
        // 스크롤 내린 거리, 화면 높이, 페이지 전체 높이
        if (window.scrollY + document.documentElement.clientHeight > document.documentElement.scrollHeight - 300) {
            if (hasMorePost) {
                const lastId = mainPosts[mainPosts.length - 1].id;
                if (!countRef.current.includes(lastId)) {
                    dispatch({
                        type: LOAD_USER_POSTS_REQUEST,
                        lastId,
                        id: me && me.id,
                    });
                    countRef.current.push(lastId)
                }
            }
        }
    }, [mainPosts.length, hasMorePost, me && me.id]);

    // 인피니티 스크롤
    useEffect(() => {
        window.addEventListener('scroll', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll)
        }
    }, [mainPosts.length]);

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