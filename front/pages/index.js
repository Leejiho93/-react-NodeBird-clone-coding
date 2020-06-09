import React, { useEffect, useCallback, useRef } from 'react';
import PostForm from '../containers/PostForm';
import PostCard from '../containers/PostCard';
import { useSelector, useDispatch } from 'react-redux';
import { LOAD_MAIN_POSTS_REQUEST } from '../reducers/post';

const Home = () => {
    const { me } = useSelector(state => state.user);
    const {mainPosts, hasMorePost } = useSelector(state => state.post);
    const dispatch = useDispatch();
    const countRef = useRef([]);

    const onScroll = useCallback(() => {
        // console.log(window.scrollY, document.documentElement.clientHeight, document.documentElement.scrollHeight);
        // 스크롤 내린 거리, 화면 높이, 페이지 전체 높이
        if (window.scrollY + document.documentElement.clientHeight > document.documentElement.scrollHeight - 300) {
            if (hasMorePost) {
                const lastId = mainPosts[mainPosts.length - 1].id;
                if (!countRef.current.includes(lastId)) {
                    dispatch({
                        type: LOAD_MAIN_POSTS_REQUEST,
                        lastId,
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

    return (
        <>
            <div>
                {me && <PostForm />}
                {mainPosts.map((c) => {
                    return (
                        <PostCard  key={c.id} post={c} />
                    )
                })}
            </div>
        </>
    )
}

Home.getInitialProps = async (context) => {
    context.store.dispatch({
        type: LOAD_MAIN_POSTS_REQUEST,
    })
}

export default Home;