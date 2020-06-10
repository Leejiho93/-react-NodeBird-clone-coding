import React, { useCallback } from 'react';
import { Card, Avatar, Button } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { LOG_OUT_REQUEST } from '../reducers/user';
import Link from 'next/link';
import Router from 'next/router';


const UserProfile = () => {
    const { me } = useSelector(state => state.user)
    const dispatch = useDispatch();

    const onLogout = useCallback(() => {
        dispatch({
            type: LOG_OUT_REQUEST
        });
    })

    // useEffect(() => {
    //     if (!me) {
    //         alert('로그인 하지 않아 메인페이지로 이동합니다.')
    //         Router.push('/') 
    //     }

    // }, me && me.id);

    return (
        <Card
            actions={[
                <Link href="/profile" prefetch key="twit">
                    <a>
                        <div>짹짹<br />{me.Posts && me.Posts.length}</div>
                    </a>
                </Link>,
                <Link href="/profile" prefetch key="following">
                    <a>
                        <div>팔로잉<br />{me.Followings && me.Followings.length}</div>
                    </a>
                </Link>,
                <Link href="/profile" prefetch key="follower">
                    <a>
                        <div>팔로워<br />{me.Followers && me.Followers.length}</div>
                    </a>
                </Link>,
            ]}
        >
            <Card.Meta
                avatar={<Avatar>{me.nickname[0]}</Avatar>}
                title={me.nickname}
            />
            <Button onClick={onLogout}>로그아웃</Button>
        </Card>
    )
}

export default UserProfile;