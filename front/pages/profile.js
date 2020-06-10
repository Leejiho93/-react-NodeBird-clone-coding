import React, { useEffect, useCallback, useState, useRef } from 'react';
import NicknameEditForm from '../containers/NicknameEditForm';
import { LOAD_FOLLOWERS_REQUEST, LOAD_FOLLOWINGS_REQUEST, UNFOLLOW_USER_REQUEST, REMOVE_FOLLOWER_REQUEST } from '../reducers/user';
import { useDispatch, useSelector } from 'react-redux';
import { LOAD_USER_POSTS_REQUEST } from '../reducers/post';
import PostCard from '../containers/PostCard';
import FollowList from '../components/FollowList';
import Router from 'next/router';

const Profile = () => {
    const dispatch = useDispatch();
    const { mainPosts, hasMorePost } = useSelector(state => state.post);
    const { followingList, followerList, hasMoreFollower, hasMoreFollowing, me } = useSelector(state => state.user);
    const countRef = useRef([]);

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
    }, [mainPosts.length, hasMorePost]);

    // 인피니티 스크롤
    useEffect(() => {
        window.addEventListener('scroll', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll)
        }
    }, [mainPosts.length]);

    useEffect(() => {
        if (!me) {
            alert('로그인 하지않아 메인페이지로 이동합니다.')
            Router.push('/') 
        }
    }, [me && me.id])

    const onUnfollow = useCallback(userId => () => {
        dispatch({
            type: UNFOLLOW_USER_REQUEST,
            data: userId,
        })
    }, [])

    const onRemoveFollower = useCallback(userId => () => {
        dispatch({
            type: REMOVE_FOLLOWER_REQUEST,
            data: userId,
        })
    }, [])

    const loadMoreFollowings = useCallback(() => {
        dispatch({
            type: LOAD_FOLLOWINGS_REQUEST,
            offset: followingList.length,
        })
    }, [followingList.length])

    const loadMoreFollowers = useCallback(() => {
        dispatch({
            type: LOAD_FOLLOWERS_REQUEST,
            offset: followerList.length,
        })
    }, [followerList.length])

    return (
        <div>
            <NicknameEditForm />
            <FollowList 
                header="팔로잉 목록" 
                hasMore={hasMoreFollowing}
                onClickMore={loadMoreFollowings}
                data={followingList}
                onClickStop={onUnfollow}
            />
             <FollowList 
                header="팔로워 목록" 
                hasMore={hasMoreFollower}
                onClickMore={loadMoreFollowers}
                data={followerList}
                onClickStop={onRemoveFollower}
            />
            <div>
            {mainPosts.map(c => (
                <PostCard key={c.id} post={c} />
            ))}
            </div>
        </div>
    )
}

Profile.getInitialProps = async (context) => {
    const state = context.store.getState();
    
    //이 직전에 app.js 에 있는 LOAD_USERS_REQUEST 실행
    context.store.dispatch({
        type: LOAD_FOLLOWERS_REQUEST,
        data: state.user.me && state.user.me.id,
    });

    context.store.dispatch({
        type: LOAD_FOLLOWINGS_REQUEST,
        data: state.user.me && state.user.me.id,
    });

    context.store.dispatch({
        type: LOAD_USER_POSTS_REQUEST,
        data: state.user.me && state.user.me.id,
    })

    // 이쯤에서 LOAD_USERS_SUCCESS 돼서 me가 생김
    // saga 에서 me가 null 이면 0을 줘서 서버에서 0값이 오면 자신의 id를 받음
}

export default Profile;