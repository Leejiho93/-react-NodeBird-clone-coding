import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { LOAD_HASHTAG_POSTS_REQUEST } from '../reducers/post';
import PostCard from '../containers/PostCard';

const Hashtag = ({ tag }) => {
    const dispatch = useDispatch();
    const { mainPosts,  hasMorePost} = useSelector(state => state.post);

    const onScroll = useCallback(() => {
        // console.log(window.scrollY, document.documentElement.clientHeight, document.documentElement.scrollHeight);
        // 스크롤 내린 거리, 화면 높이, 페이지 전체 높이
        if (window.scrollY + document.documentElement.clientHeight > document.documentElement.scrollHeight - 300) {
            if (hasMorePost) {
                dispatch({
                    type: LOAD_HASHTAG_POSTS_REQUEST,
                    lastId: mainPosts[mainPosts.length - 1] && mainPosts[mainPosts.length - 1].id,
                    data: tag,
                });
            }
        }
    }, [mainPosts.length, hasMorePost, tag]);

    useEffect(() => {
        window.addEventListener('scroll', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll)
        }
    }, [mainPosts.length]);

    return (
        <div>
            {mainPosts.map(c => (
                <PostCard key={c.id} post={c} />
            ))}
        </div>
    )
}

Hashtag.propTypes = {
    tag: PropTypes.string.required
}

Hashtag.getInitialProps = async (context) => {
    // console.log('hashtag.js hashtag getInitialProps: ', context.query.tag)
    const tag = context.query.tag
    context.store.dispatch({
        type: LOAD_HASHTAG_POSTS_REQUEST,
        data: tag,
    })
    return { tag }  //
}

export default Hashtag;