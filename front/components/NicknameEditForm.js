import React from 'react';
import { Form, Input, Button } from 'antd';
import { useSelector } from 'react-redux';

const NicknameEditForm = () => {
    const { user } = useSelector(state => state.user)
    return (
        <Form style={{ marginBottom: '20px', border: '1px solid #d9d9d9', padding: '20px' }}>
            <Input addonBefore="닉네임" value={user && user.nickname} />
            <Button type="primary">수정</Button>
        </Form>
    )
}

export default NicknameEditForm