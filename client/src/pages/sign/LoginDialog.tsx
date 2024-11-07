import React, { useState } from 'react';
import styled from 'styled-components';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

// import logo from 'assets/images/logo.png';
import logo_new from 'assets/images/logo_new.png';

import loginFrame from 'assets/images/frame.png';
import { styledTheme } from 'styles/theme';
import {
  setPlayerBojId,
  setPlayerId,
  setPlayerLeetId,
  setPlayerTexture,
  setUserBgmState,
  setUserLoginId,
} from 'stores/userSlice';
import { useDispatch } from 'react-redux';
import { handleScene } from 'lib/phaserLib';
import { GAME_STATUS } from 'utils/Constants';
import { Snackbar, SnackbarOrigin } from '@mui/material';
import SignUpForm from './SignUpForm';
import axios, { AxiosError } from 'axios';
import MySnackbar from '../../components/MySnackbar';
import SignContextProvider from '../../contexts/SignContext';

import 'animate.css';
import { openGame } from 'stores/modeSlice';
import useVoice from 'hooks/useVoice';
import AvatarSlide from 'components/sign/AvatarSlide';
import { useSignContext } from 'hooks/useSignContext';
import { APPLICATION_URL } from 'utils/Constants';

const APPLICATION_DB_URL = APPLICATION_URL.APPLICATION_DB_URL;
const APPLICATION_VOICE_URL = APPLICATION_URL.APPLICATION_VOICE_URL;

// const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
//   props,
//   ref
// ) {
//   return <MuiAlert elevation={10} ref={ref} variant="filled" {...props} />;
// });

export interface State extends SnackbarOrigin {
  openLoginWarn: boolean;
}

const LoginDialog = () => {
  /**form datas */
  const [userId, setUserId] = useState<string>('');
  const [userIdFieldEmpty, setUserIdFieldEmpty] = useState<boolean>(false);
  const [userPw, setUserPw] = useState<string>('');
  const [userPwFieldEmpty, setUserPwFieldEmpty] = useState<boolean>(false);
  const [autoPlayOn, setAutoPlayOn] = useState(false);

  /**snackbar */
  const [isLoginWarnOpened, setIsLoginWarnOpened] = useState(false);
  const [loginFailMsg, setLoginFailMsg] = useState('');

  const openLoginWarn = () => {
    setIsLoginWarnOpened(true);
  };

  const closeLoginWarn = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setLoginFailMsg('');
    setIsLoginWarnOpened(false);
  };

  /**context */
  const { avatarIndex, avatars, openSignUpForm } = useSignContext();
  const dispatch = useDispatch();

  const autoPlay = () => {
    if (!autoPlayOn) {
      dispatch(setUserBgmState(true));
    }
    setAutoPlayOn(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (userId === '') {
      setUserIdFieldEmpty(true);
      return;
    } else if (userId !== '' && userPw === '') {
      setUserPwFieldEmpty(true);
      setUserIdFieldEmpty(false);
      return;
    } else {
      //todo user info 확인
      const body = { userId: userId, userPw: userPw };
      try {
        const response = await axios.post(
          `${APPLICATION_DB_URL}/user/login`,
          body
        );
        if (response.data.status === 200) {
          // handleScene(GAME_STATUS.LOBBY);
          const { payload } = response.data; //userId, userNickname, userBojId, userLeetId
          //todo payload 값 리덕스에 저장하기
          dispatch(openGame());
          dispatch(setPlayerId(payload.userNickname));
          dispatch(setPlayerBojId(payload.userBojId));
          dispatch(setPlayerLeetId(payload.userLeetId));
          dispatch(setPlayerTexture(avatars[avatarIndex].name));
          dispatch(setUserLoginId(userId));

          handleScene(GAME_STATUS.LOBBY, {
            playerId: payload.userNickname,
            playerTexture: avatars[avatarIndex].name,
          });
        }
      } catch (e) {
        if (e instanceof AxiosError && e.response?.status === 420) {
          setLoginFailMsg('이미 접속한 유저입니다.');
        } else {
          setLoginFailMsg('아이디와 비밀번호를 다시 확인해 주세요.');
        }
        openLoginWarn();
        setUserId('');
        setUserPw('');
      }
    }
  };

  return (
    <Wrapper
      onFocus={autoPlay}
      className="animate__animated animate__fadeIn animate__delay-0.8s"
      style={{
        position: 'absolute',
        backgroundImage: `url(${loginFrame})`,
        backgroundSize: '100% 100%',
      }}
    >
      <MySnackbar
        text={loginFailMsg}
        state="warning"
        onClose={closeLoginWarn}
        onOpen={isLoginWarnOpened}
      />
      <img
        alt="logo"
        src={logo_new}
        style={{
          width: styledTheme.logoWidth,
          height: styledTheme.logoHeight,
          userSelect: 'none',
        }}
      />
      <Content onSubmit={handleSubmit} id="login">
        <div style={{ display: 'flex' }}>
          <Left>
            <AvatarSlide />
          </Left>
          <Right>
            <div style={{ height: '20px' }}></div>
            <TextField
              fullWidth
              label="ID"
              variant="outlined"
              error={userIdFieldEmpty}
              onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                if (!userId) {
                  setUserIdFieldEmpty(true);
                } else {
                  setUserIdFieldEmpty(false);
                }
              }}
              helperText={userIdFieldEmpty && 'ID를 입력해 주세요.'}
              value={userId}
              // margin="dense"
              onChange={(e: React.ChangeEvent) => {
                setUserId((e.target as HTMLInputElement).value);
              }}
              sx={{ fontFamily: styledTheme.mainFont }}
            />
            <div style={{ height: '20px' }}></div>
            <TextField
              fullWidth
              type="password"
              label="PASSWORD"
              variant="outlined"
              value={userPw}
              margin="dense"
              error={userPwFieldEmpty}
              onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                if (!userPw) {
                  setUserPwFieldEmpty(true);
                } else {
                  setUserPwFieldEmpty(false);
                }
              }}
              helperText={userPwFieldEmpty && 'Password를 입력해 주세요.'}
              onInput={(e) => {
                setUserPw((e.target as HTMLInputElement).value);
              }}
              sx={{ fontFamily: styledTheme.mainFont }}
            />
            <div style={{ height: '20px' }}></div>
            <SignUpForm />
          </Right>
        </div>
        <Bottom>
          <Button
            variant="contained"
            color="primary"
            size="large"
            type="submit"
            form="login"
            sx={{ fontFamily: styledTheme.mainFont }}
          >
            시작하기
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            onClick={openSignUpForm}
            sx={{
              fontFamily: styledTheme.mainFont,
              color: 'black',
              borderWidth: '2px',
              backgroundColor: 'rgba( 255, 255, 255, 0.6 )',

              '&:hover': {
                borderWidth: '2px',
                backgroundColor: 'white',
              },
            }}
          >
            회원가입
          </Button>
        </Bottom>
      </Content>
    </Wrapper>
  );
};

export default LoginDialog;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0);
  border-radius: 16px;
  padding: 36px 60px;
  // box-shadow: 0px 0px 5px #0000006f;
  img {
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -o-user-select: none;
    user-select: none;
    -webkit-user-drag: none;
  }
`;

const Content = styled.form`
  display: flex;
  flex-direction: column;
  margin: 36px 0;
  gap: 15px;
`;

const Left = styled.div`
  margin-right: 48px;
  margin-top: -8px;

  --swiper-navigation-size: 24px;

  .swiper {
    width: 160px;
    height: 200px;
    border-radius: 8px;
    overflow: hidden;
  }

  .swiper-slide {
    width: 160px;
    height: 215px;
    // background: ${({ theme }) => theme.lighterBlue};
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .swiper-slide img {
    display: block;
    width: 97px;
    height: 136px;
    object-fit: contain;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -o-user-select: none;
    user-select: none;
  }
`;

const Right = styled.div`
  width: 300px;
  display: block;
  align-items: center;
  // padding-top: 50px;
`;

const Bottom = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
`;

const Warning = styled.div`
  margin-top: 30px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 3px;
`;
