import axios from 'axios';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';

const APPLICATION_EDITOR_URL =
  `${process.env.REACT_APP_SERVER_URL}/editor` || 'http://localhost:3001';

//@ts-ignore
function RunButton(props) {
  const { ytext, setCompileOutput, setMemory, setCpuTime, inputStdin } = props;

  /* 유저가 작성한 코드를 컴파일하기 위해 서버로 보냄 */
  const runCode = async () => {
    if (!inputStdin) return;

    console.log(inputStdin.value);

    try {
      const { data } = await axios.post(
        `${APPLICATION_EDITOR_URL}/code_to_run`,
        {
          codeToRun: ytext.toString(),
          //@ts-ignore
          stdin: inputStdin.value,
        }
      );

      console.log(data); // 전체 reponse body (output, statusCode, memory, cpuTime)
      setCompileOutput(data.output.replace(/\n/g, '<br>'));
      setMemory(data.memory);
      setCpuTime(data.cpuTime);
    } catch (error) {
      console.error(error);
      alert('코드 서버로 보내기 실패');
    }
  };

  return (
    <>
      <Tooltip title="코드 실행하기" arrow>
        <Button
          onClick={runCode}
          color="primary"
          style={{
            fontFamily: 'Cascadia Code, Pretendard-Regular',
            fontSize: '17px',
          }}
        >
          ▶️ RUN
        </Button>
      </Tooltip>
    </>
  );
}

export default RunButton;
