import axios from 'axios';
import { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { openGame } from 'stores/modeSlice';
import store from 'stores';
import { setFlagsFromString } from 'v8';

interface DetailInfo {
  bojId: string;
  id: string;
  maxStreak: number;
  nickname: string;
  rating: number;
  tier: number;
}

function Whiteboard() {
  const initialState: [] = [];

  let [bojInfos, setbojInfos] = useState<DetailInfo[]>(initialState);
  let [showInfoFlag, setFlag] = useState(true);

  //TODO: export해서 phaser main scene에서 불리게? 또는 Lobby? redis에 저장까지
  const getBojInfos = async () => {
    try {
      const response = await axios.get(`http://localhost:3003/boj-infos`);
      await setbojInfos(response.data);
      //   console.log(bojInfos);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (showInfoFlag) {
      getBojInfos();
      setFlag(false);
    }
  }, []);

  const handleBack = async () => {
    await setbojInfos([]);
    store.dispatch(openGame());
  };

  return (
    <>
      <Background>
        <div>
          백준 랭킹 🔥
          {/* <button onClick={getBojInfos}>새로고침</button> */}
        </div>
        {bojInfos?.map((info: any) => (
          <div>
            {info.id} {info.nickname} {info.tier} {info.bojId} {info.rating}
            {info.maxStreak}
          </div>
        ))}
        <button onClick={handleBack}>돌아가기</button>
      </Background>
    </>
  );
}

export default Whiteboard;

const Background = styled.div`
  width: 100%;
  height: 100%;
  background-color: white;
`;
