import { useEffect, useState } from 'react';
import axios from 'axios';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import { useSelector } from 'react-redux';
import { RootState } from 'stores';
/* toast */
import { notifyFail } from './toast';
//@ts-ignore
import missSoundFile from '../../assets/sound_effect/miss_sound.mp3';
//@ts-ignore
import hitSoundFile from '../../assets/sound_effect/hit_sound.mp3';
import SoundPlayer from 'hooks/useSoundPlayer';
import { middleButtonStyle, tooltipStyle } from 'pages/editor/editorStyle';
import EvaluateGauge from 'components/editor/EvaluateGauge';
import { Fireworks } from './fireworks';
import TaskIcon from '@mui/icons-material/Task';
import Swal from 'sweetalert2';
import _ from 'lodash';
import { APPLICATION_URL } from '../../utils/Constants';

const APPLICATION_EDITOR_URL = APPLICATION_URL.APPLICATION_EDITOR_URL;

//@ts-ignore
function EvaluateButton(props) {
  const { userName, editorName } = useSelector(
    (state: RootState) => state.editor
  );

  const { ytext, bojProblemId, mySocket, bojProbFullData } = props;

  let [markingPercent, setMarkingPercent] = useState('');
  let [shining, setShining] = useState(false);
  let [evalFinished, setEvalFinished] = useState(false);
  const newMissSoundToggle = SoundPlayer(missSoundFile);
  const newHitSoundToggle = SoundPlayer(hitSoundFile);
  let [totalCases, setTotalCases] = useState(0);

  /* fetching '.in' file */
  async function fetchInputFileText(url: string) {
    try {
      const response = await fetch(url);
      const text = await response.text();
      return text;
    } catch {
      console.log('input 파일 fetching 실패');
      return null;
    }
  }

  /* 유저가 가채점 성공시 소켓 이벤트 발동 */
  const broadcastSuccess = () => {
    mySocket?.emit('broadcastSuccess', {
      editorName: editorName,
      problemId: bojProblemId,
      broadcast: true,
    });
  };

  /* 문제 번호에 따라 테스트 케이스 개수와 올림피아드 출처 여부 판별 */
  const getTestCasesInfo = () => {
    const pizzaovenCase = 2; // 19940번 테스트 케이스 개수
    const gourdPop = 5; // 19939번 테스트 케이스 개수
    let cases = 0; // 전체 testcase 개수 (state 대신 쓰기 위해 필요)
    let isOlympiad = 1;

    if (bojProblemId === 19940) {
      cases = pizzaovenCase; // 19940번 테스트 케이스 개수
    } else if (bojProblemId === 19939) {
      cases = gourdPop; // 19939번 테스트 케이스 개수
    } else if (bojProblemId !== 19939 || bojProblemId !== 19940) {
      let sampleNum = Object.keys(bojProbFullData?.samples).length;
      cases = sampleNum; // 19939번 테스트 케이스 개수
      isOlympiad = 0;
    }
    return { cases, isOlympiad };
  };

  /* 올림피아드 소스 문제 채점 */
  const evalulateOlympiad = async (hitCount: number, cases: number) => {
    for (let i = 1; i < 50; i++) {
      const fetchInput = await fetchInputFileText(
        `/assets/olympiad/${bojProblemId}/${i}.in`
      );

      if (fetchInput === null || fetchInput?.startsWith('<!DOCTYPE html>')) {
        console.log('더 이상 채점할 파일이 없어요!!');
        setEvalFinished(true);
        break;
      }

      const { data } = await axios.post(`${APPLICATION_EDITOR_URL}/usercode`, {
        codeToRun: ytext.toString(),
        //@ts-ignore
        stdin: fetchInput,
      });

      const fetchOutput = await fetchInputFileText(
        `assets/olympiad/${bojProblemId}/${i}.out`
      );
      const jdoodleOutput = data.output;

      if (jdoodleOutput === fetchOutput) {
        console.log(`${i}번 테스트 케이스 맞음`);
        hitCount++;
      } else {
        console.log(`${i}번 테스트 케이스 틀림`);
      }

      setMarkingPercent(`${(hitCount / cases) * 100}`);
      setShining(true);
    }
  };

  /* 올림피아드 소스가 아닌 문제 채점 */
  const evalulateNonOlympiad = async (hitCount: number, cases: number) => {
    // console.log(bojProbFullData.samples);

    for (let i = 1; i < 50; i++) {
      if (!bojProbFullData.samples[i]) {
        console.log('더 이상 채점할 파일이 없어요!!');
        setEvalFinished(true);
        break;
      }
      const inputWithLf = bojProbFullData.samples[i].input.replace(
        /\r\n/g,
        '\n'
      );
      const outputWithLf = bojProbFullData.samples[i].output
        .replace(/\r\n/g, '\n')
        .trimEnd();

      const { data } = await axios.post(`${APPLICATION_EDITOR_URL}/usercode`, {
        codeToRun: ytext.toString(),
        //@ts-ignore
        stdin: inputWithLf,
      });

      const jdoodleOutput = data.output.replace(/ \n/g, '\n').trimEnd();

      if (jdoodleOutput === outputWithLf) {
        console.log(`${i}번 테스트 케이스 맞음`);
        hitCount++;
      } else {
        console.log(`${i}번 테스트 케이스 틀림`);
      }
      setMarkingPercent(`${(hitCount / cases) * 100}`);
      setShining(true);
    }
  };

  /* 유저가 작성한 코드 가채점하기 위해 서버로 보냄 */
  const evaluateCode = async () => {
    if (!ytext.toString()) {
      Swal.fire({
        icon: 'error',
        title: '채점을 위해 코드를 작성하세요',
      });
      return;
    }

    if (!bojProblemId) {
      Swal.fire({
        icon: 'error',
        title: '채점할 문제를 선택하세요',
      });
      return;
    }

    let { cases, isOlympiad } = getTestCasesInfo();
    if (cases === 0) {
      alert('채점할 테스트 케이스가 없어요!');
      return;
    }
    setTotalCases(cases);
    let hitCount = 0;

    try {
      if (isOlympiad === 1) {
        await evalulateOlympiad(hitCount, cases);
      } else {
        await evalulateNonOlympiad(hitCount, cases);
      }
    } catch (error) {
      console.error(error);
      alert('채점 실패');
    }
  };

  /* google cloud functions */
  async function callCloudFunction(data: any) {
    const url = `https://asia-northeast3-codeuk-379309.cloudfunctions.net/compiler`;
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
    console.log(options);

    const response = await fetch(url, options);
    const result = await response.json();
    return result;
  }

  const evaluateSample = async () => {
    console.log(bojProbFullData?.samples?.[1].input.toString());
    const inputData = {
      code: ytext.toString(),
      // stdin: '1\n', // todo: 실제 input value로 바꾸기
      stdin: bojProbFullData?.samples?.[1].input.toString() || '',
    };

    callCloudFunction(inputData)
      .then((result) => {
        console.log('Result:', result);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  useEffect(() => {
    if (!bojProblemId) return;
    if (evalFinished === false) {
      // console.log('아직 채점 다 안 끝났어요~');
      return;
    }
    if (markingPercent === '100') {
      newHitSoundToggle();
      broadcastSuccess();
    } else {
      newMissSoundToggle();
      notifyFail(editorName, bojProblemId);
    }
    setEvalFinished(false);

    setTimeout(() => {
      setMarkingPercent('');
      setShining(false);
    }, 4000);
  }, [markingPercent, evalFinished]);

  return (
    <>
      <Tooltip title="코드와트 가채점" arrow slotProps={tooltipStyle}>
        <Button
          variant="outlined"
          color="primary"
          onClick={_.debounce(evaluateCode, 200)}
          style={middleButtonStyle}
        >
          <TaskIcon sx={{ marginRight: '5px', fontSize: '1.2rem' }} />
          제출
        </Button>
      </Tooltip>
      {markingPercent === '100' ? <Fireworks /> : null}
      {/* ▼ 문제 성공 알림을 테스트용 투명 버튼 */}
      {/* <button
        onClick={broadcastSuccess}
        style={{
          // border: '1px solid green',
          backgroundColor: 'transparent',
          color: 'transparent',
        }}
      >
        -
      </button> */}
      <EvaluateGauge
        value={markingPercent}
        min={0}
        max={100}
        label={markingPercent === '' ? '' : `${markingPercent}점`}
        shining={shining}
        totalCases={totalCases}
      />
    </>
  );
}

export default EvaluateButton;
