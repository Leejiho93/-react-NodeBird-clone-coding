import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { LOAD_HASHTAG_POSTS_REQUEST } from '../reducers/post';
import PostCard from '../components/PostCard';

const Hashtag = ({ tag }) => {
    console.log('tag: ',tag)
    const dispatch = useDispatch();
    const { mainPosts } = useSelector(state => state.post);

    useEffect(() => {
        dispatch({
            type: LOAD_HASHTAG_POSTS_REQUEST,
            data: tag,
        })
    }, []);
    // console.log('mainPosts: ',mainPosts);
    return (
        <div>
            {mainPosts.map(c => (
                <PostCard key={+c.createdAt} post={c} />
            ))}
        </div>
    )
}

Hashtag.propTypes = {
    tag : PropTypes.string.required
}

Hashtag.getInitialProps = async (context) => {
    console.log('hashtag.js hashtag getInitialProps: ', context.query.tag)
    return { tag : context.query.tag }  //
}

export default Hashtag;