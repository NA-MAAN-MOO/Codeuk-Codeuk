import React, { useState } from 'react';
import styled from 'styled-components';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';

import characters from 'assets/characters';

import { setPlayerId, setPlayerTexture } from '../stores/userSlice';
import { useDispatch } from 'react-redux';
import { openGame } from 'stores/modeSlice';

const Wrapper = styled.form`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #222639;
  border-radius: 16px;
  padding: 36px 60px;
  box-shadow: 0px 0px 5px #0000006f;
`;

const Title = styled.p`
  margin: 5px;
  font-size: 20px;
  color: #c2c2c2;
  text-align: center;
`;

const RoomName = styled.div`
  max-width: 500px;
  max-height: 120px;
  overflow-wrap: anywhere;
  overflow-y: auto;
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;

  h3 {
    font-size: 24px;
    color: #eee;
  }
`;

const RoomDescription = styled.div`
  max-width: 500px;
  max-height: 150px;
  overflow-wrap: anywhere;
  overflow-y: auto;
  font-size: 16px;
  color: #c2c2c2;
  display: flex;
  justify-content: center;
`;

const SubTitle = styled.h3`
  width: 160px;
  font-size: 16px;
  color: #eee;
  text-align: center;
`;

const Content = styled.div`
  display: flex;
  margin: 36px 0;
`;

const Left = styled.div`
  margin-right: 48px;

  --swiper-navigation-size: 24px;

  .swiper {
    width: 160px;
    height: 220px;
    border-radius: 8px;
    overflow: hidden;
  }

  .swiper-slide {
    width: 160px;
    height: 220px;
    background: #dbdbe0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .swiper-slide img {
    display: block;
    width: 95px;
    height: 136px;
    object-fit: contain;
  }
`;

const Right = styled.div`
  width: 300px;
`;

const Bottom = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Warning = styled.div`
  margin-top: 30px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const avatars = [
  { name: 'char0', img: characters.char0 },
  { name: 'char1', img: characters.char1 },
  { name: 'char2', img: characters.char2 },
  { name: 'char3', img: characters.char3 },
  { name: 'char4', img: characters.char4 },
  { name: 'char5', img: characters.char5 },
  { name: 'char6', img: characters.char6 },
  { name: 'char7', img: characters.char7 },
  { name: 'char8', img: characters.char8 },
  { name: 'char9', img: characters.char9 },
  { name: 'char10', img: characters.char10 },
  { name: 'char11', img: characters.char11 },
  { name: 'char12', img: characters.char12 },
  { name: 'char13', img: characters.char13 },
  { name: 'char14', img: characters.char14 },
  { name: 'char15', img: characters.char15 },
  { name: 'char16', img: characters.char16 },
  { name: 'char17', img: characters.char17 },
  { name: 'char18', img: characters.char18 },
  { name: 'char19', img: characters.char19 },
  { name: 'char20', img: characters.char20 },
  { name: 'char21', img: characters.char21 },
  { name: 'char22', img: characters.char22 },
  { name: 'char23', img: characters.char23 },
  { name: 'char24', img: characters.char24 },
  { name: 'char25', img: characters.char25 },
  { name: 'char26', img: characters.char26 },
  { name: 'char27', img: characters.char27 },
];

const colorArr = [
  '#7bf1a8',
  '#ff7e50',
  '#9acd32',
  '#daa520',
  '#ff69b4',
  '#c085f6',
  '#1e90ff',
  '#5f9da0',
];

// determine name color by first character charCode
function getColorByString(string: string) {
  return colorArr[80 % colorArr.length];
}

export default function LoginDialog() {
  const [name, setName] = useState<string>('');
  const [avatarIndex, setAvatarIndex] = useState<number>(0);
  const [nameFieldEmpty, setNameFieldEmpty] = useState<boolean>(false);
  const dispatch = useDispatch();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (name === '') {
      setNameFieldEmpty(true);
    } else {
      console.log('Join! Name:', name, 'Avatar:', avatars[avatarIndex].name);

      dispatch(setPlayerId(name));
      // game.myPlayer.setPlayerName(name);
      dispatch(setPlayerTexture(avatars[avatarIndex].name));
      dispatch(openGame());

      // game.myPlayer.setPlayerTexture(avatars[avatarIndex].name);
      // game.network.readyToConnect();
      // dispatch(setLoggedIn(true));
    }
  };

  return (
    <Wrapper onSubmit={handleSubmit}>
      <Title>Welcome Codewarts!</Title>
      <RoomName>
        <Avatar
          style={{ background: getColorByString('roomName와야함 나중에') }}
        >
          {'CW'}
        </Avatar>
        {/* <h3>{roomName}</h3> */}
        <h3>{'My Room'}</h3>
      </RoomName>
      <RoomDescription>
        <ArrowRightIcon /> {'My roomDescription'}
      </RoomDescription>
      <Content>
        <Left>
          <SubTitle>Select an avatar</SubTitle>
          <Swiper
            modules={[Navigation]}
            navigation
            spaceBetween={0}
            slidesPerView={1}
            onSlideChange={(swiper) => {
              setAvatarIndex(swiper.activeIndex);
            }}
          >
            {avatars.map((avatar) => (
              <SwiperSlide key={avatar.name}>
                <img
                  style={{
                    scale: '4.5',
                    left: '20%',
                    clipPath: 'inset(0px 36px 102px 40px)',
                    top: '120%',
                    position: 'absolute',
                  }}
                  src={avatar.img}
                  alt={avatar.name}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </Left>
        <Right>
          <TextField
            autoFocus
            fullWidth
            label="Name"
            variant="outlined"
            color="secondary"
            error={nameFieldEmpty}
            helperText={nameFieldEmpty && 'Name is required'}
            onInput={(e) => {
              setName((e.target as HTMLInputElement).value);
            }}
          />
          {/* {!videoConnected && (
            <Warning>
              <Alert variant="outlined" severity="warning">
                <AlertTitle>Warning</AlertTitle>
                No webcam/mic connected -{' '}
                <strong>connect one for best experience!</strong>
              </Alert>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  game.network.webRTC?.getUserMedia();
                }}
              >
                Connect Webcam
              </Button>
            </Warning>
          )} */}

          {/* {videoConnected && (
            <Warning>
              <Alert variant="outlined">Webcam connected!</Alert>
            </Warning>
          )} */}
        </Right>
      </Content>
      <Bottom>
        <Button
          // onClick={() => {  submit보다 먼저 작동해서 문제가 있었음
          //   if (!nameFieldEmpty) {
          //     dispatch(openGame());
          //   }
          // }}
          variant="contained"
          color="secondary"
          size="large"
          type="submit"
        >
          Join
        </Button>
      </Bottom>
    </Wrapper>
  );
}
