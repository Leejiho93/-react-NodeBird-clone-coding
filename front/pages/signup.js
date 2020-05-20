import React, { useState, useCallback, useEffect } from 'react';
import { Form, Input, Button, Checkbox } from 'antd';
import { SIGN_UP_REQUEST } from '../reducers/user';
import { useDispatch, useSelector } from 'react-redux';
import Router from 'next/router';

export const useInput = (initValue = null) => {
    const [value, setter] = useState(initValue);
    const handler = useCallback((e) => {
        setter(e.target.value);
    }, []);
    return [value, handler];
}

const Signup = () => {
    // const [id, setId] = useState('');
    // const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [id, onChangeId] = useInput('');
    const [nickname, onChangeNickname] = useInput('');
    // const [password, onChangePassword] = useInput('');

    const [passwordCheck, setPasswordCheck] = useState('');
    const [term, setTerm] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [termError, setTermError] = useState(false);
    const dispatch = useDispatch();
    const {me, isSigningUp } = useSelector(state => state.user)

    useEffect(() => {
        if (me) {
            Router.push('/')  //로그인하면 회원가입 페이지가 메인페이지로 바뀜
        }
    }, [me && me.id])

    const onSubmit = useCallback((e) => {
        e.preventDefault();
        if (password !== passwordCheck) {
            return setPasswordError(true);
        }
        if (!term) {
            return setTermError(true);
        }
        dispatch(({
            type: SIGN_UP_REQUEST,
            data: {
                userId: id,
                password,
                nickname
            }
        }))
    }, [id, nickname, password, passwordCheck, term]);

    // const onChangeId = (e) => {
    //     setId(e.target.value);
    // }

    // const onChangeNickname = (e) => {
    //     setNickname(e.target.value);
    // }

    const onChangePassword = useCallback((e) => {
        setPasswordError(e.target.value !== passwordCheck);
        setPassword(e.target.value);
    }, [passwordCheck])

    const onChangePasswordCheck = useCallback((e) => {
        setPasswordError(e.target.value !== password);
        // console.log(`pass: ${password} , passchk ${e.target.value} `)
        setPasswordCheck(e.target.value);
    }, [password]);

    const onChangeTerm = useCallback((e) => {
        setTermError(false);
        setTerm(e.target.checked);
    }, [term]);

    return (
        <>
            <Form onSubmit={onSubmit} style={{ padding: 10 }}>
                <div>
                    <label htmlFor="user-id">아이디</label>
                    <br />
                    <Input name="user-id" value={id} required onChange={onChangeId}></Input>
                </div>
                <div>
                    <label htmlFor="user-nick">닉네임</label>
                    <br />
                    <Input name="user-nick" value={nickname} required onChange={onChangeNickname}></Input>
                </div>
                <div>
                    <label htmlFor="user-pass">비밀번호</label>
                    <br />
                    <Input name="user-pass" type="password" value={password} required onChange={onChangePassword}></Input>
                </div>
                <div>
                    <label htmlFor="user-pass-chk">비밀번호체크</label>
                    <br />
                    <Input name="user-pass-chk" type="password" value={passwordCheck} required onChange={onChangePasswordCheck}></Input>
                    {passwordError && <div style={{ color: 'red' }}>비밀번호가 일치하지 않습니다.</div>}
                </div>
                <div>
                    <Checkbox name="user-term" defaultChecked={term} onChange={onChangeTerm}>약관을 확인을 동의합니다.</Checkbox>
                    {termError && <div style={{ color: 'red' }}>약관에 동의 하셔야 합니다.</div>}
                </div>
                <div style={{ marginTop: 10 }}>
                    <Button type="primary" htmlType="submit" loading={isSigningUp}>가입하기</Button>
                </div>
            </Form>
        </>
    )
}


export default Signup;