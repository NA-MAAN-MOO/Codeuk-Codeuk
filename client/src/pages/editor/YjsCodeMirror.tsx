//@ts-nocheck
/* react */
import { useRef, useEffect, useState } from 'react';

/* lib */
import * as random from 'lib0/random';
import { useSelector } from 'react-redux';
import axios from 'axios';

/* yjs */
import * as Y from 'yjs';
// @ts-ignore
import { yCollab } from 'y-codemirror.next';
import { WebsocketProvider } from 'y-websocket';
import * as awarenessProtocol from 'y-protocols/awareness.js';

/* codemirror */
import { basicSetup } from 'codemirror';
import { python } from '@codemirror/lang-python';
import { EditorState } from '@codemirror/state';
import { keymap, EditorView } from '@codemirror/view';
import {
  defaultKeymap,
  indentWithTab,
  standardKeymap,
} from '@codemirror/commands';
import { noctisLilac } from '@uiw/codemirror-theme-noctis-lilac';
import { okaidia } from '@uiw/codemirror-theme-okaidia';
import { RootState } from 'stores';

/* GraphQL queries */
import PROBLEMQUERY from '../../graphql/problemQuery';
import USERINFOQUERY from '../../graphql/userInfoQuery';

/* UI */
import './YjsCodeMirror.css';
import styledc from 'styled-components';
import 'styles/fonts.css'; /* FONT */
import Button from '@mui/material/Button';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InputIcon from '@mui/icons-material/Input';

/* solvedAC badge svg */
import RenderSvg from 'components/Svg';

/* 다크/라이트 토글 스위치 테마 */
const MaterialUISwitch = styled(Switch)(({ theme }) => ({
  // 토글 막대기 부분
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 0,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& .MuiSwitch-thumb:before': {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          '#fff'
        )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: theme.palette.mode === 'dark' ? '#003892' : '#001e3c',
    width: 32,
    height: 32,
    '&:before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        '#fff'
      )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
    },
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
    borderRadius: 20 / 2,
  },
}));

/* MUI button color theme setting */
const buttonTheme = createTheme({
  palette: {
    primary: {
      main: '#272822', // 에디터 검정
    },
    secondary: {
      // main: '#FD971F', // 주황
      main: '#ffefd5', // papayawhip
      // main: '#11cb5f',
    },
  },
});

/* Paper element theme setting */
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

function YjsCodeMirror() {
  /* ref */
  const editor = useRef(null);
  const inputStdin = useRef();
  const leetUserNameRef = useRef(null);
  const leetProbDataRef = useRef(null);
  const bojUserNameRef = useRef(null);
  const bojProbDataRef = useRef(null);

  /* states */
  const { userName, roomId } = useSelector((state: RootState) => state.editor);
  let [compileOutput, setCompileOutput] = useState();
  let [cpuTime, setCpuTime] = useState();
  let [memory, setMemory] = useState();
  let [editorThemeMode, setEditorTheme] = useState(okaidia);
  let [leetUserData, setLeetUserData] = useState();
  let [leetProbData, setLeetProbData] = useState();
  let [bojUserData, setBojUserData] = useState();
  let [bojProbData, setBojProbData] = useState();
  let [bojProbFullData, setBojProbFullData] = useState();

  /* roomName 스트링 값 수정하지 말 것(※ 수정할 거면 전부 수정해야 함) */
  const roomName = `ROOMNAME${roomId}`;

  const usercolors = [
    { color: '#30bced', light: '#30bced33' },
    { color: '#6eeb83', light: '#6eeb8333' },
    { color: '#ffbc42', light: '#ffbc4233' },
    { color: '#ecd444', light: '#ecd44433' },
    { color: '#ee6352', light: '#ee635233' },
    { color: '#9ac2c9', light: '#9ac2c933' },
    { color: '#8acb88', light: '#8acb8833' },
    { color: '#1be7ff', light: '#1be7ff33' },
  ];

  // select a random color for this user
  const userColor = usercolors[random.uint32() % usercolors.length];
  const ydoc = new Y.Doc();

  // Websocket Provider setting
  const provider = new WebsocketProvider(
    `ws://localhost:1234/`, // serverUrl
    roomName,
    ydoc
    // { params: { auth: roomId } } // Specify a query-string that will be url-encoded and attached to the `serverUrl`
  );

  provider.on('status', (event: any) => {
    console.log(event.status); // logs "connected" or "disconnected"
  });
  const ytext = ydoc.getText('codemirror');

  const undoManager = new Y.UndoManager(ytext);

  /* provider의 awareness setting */
  provider.awareness.setLocalStateField('user', {
    name: userName, // 커서에 표시되는 이름
    color: userColor.color, // should be a hex color
    colorLight: userColor.light,
    roomName: roomName,
    clientID: provider.awareness.clientID, // A unique identifier that identifies this client.
  });

  /* provider의 정보 출력 */
  console.log(provider.awareness.getLocalState());
  // console.log('클라이언트ID ' + provider.awareness.clientID);
  // console.log(provider.awareness.states.values().next().value['name']); // 모든 client의 state
  // console.log(provider.awareness.getStates().get(2127960527).user.name); // get(clientID)
  // provider.awareness.getStates().forEach((key, value) => {
  //   console.log(key, value);
  // });

  useEffect(() => {
    /* editor theme 설정 */
    let basicThemeSet = EditorView.theme({
      '&': {
        height: '500px',
        // minHeight: '500px',
        borderRadius: '.5em', // '.cm-gutters'와 같이 조절할 것
      },
      '.cm-editor': {},
      '.cm-content, .cm-gutter': { minHeight: '30%' },
      '.cm-content': {
        fontFamily: 'Cascadia Code',
        fontSize: 'large',
      },
      '.cm-gutter': {
        // minHeight: '50%',
        fontFamily: 'Cascadia Code',
      },
      '.cm-gutters': {
        borderRadius: '.5em',
      },
    });

    /* editor instance 생성; state, view 생성 */
    const state = EditorState.create({
      doc: ytext.toString(),
      extensions: [
        basicSetup,
        python(),
        yCollab(ytext, provider.awareness, { undoManager }),
        keymap.of([indentWithTab]),
        keymap.of(standardKeymap),
        keymap.of(defaultKeymap),
        editorThemeMode,
        basicThemeSet,
      ],
    });

    if (!editor.current) return;

    const view = new EditorView({
      state: state,
      parent: editor.current || undefined,
    });

    /* view 중복 생성 방지 */
    return () => view?.destroy();
  }, [editorThemeMode]);

  /* 유저가 작성한 코드를 컴파일하기 위해 서버로 보냄 */
  const runCode = async () => {
    if (!inputStdin.current) return;

    console.log(inputStdin.current?.value);

    try {
      const { data } = await axios.post(`http://localhost:3001/code_to_run`, {
        codeToRun: ytext.toString(),
        //@ts-ignore
        stdin: inputStdin.current?.value,
      });

      console.log(data); // 전체 reponse body (output, statusCode, memory, cpuTime)
      setCompileOutput(data.output.replace(/\n/g, '<br>'));
      setMemory(data.memory);
      setCpuTime(data.cpuTime);
    } catch (error) {
      console.error(error);
      alert('코드 서버로 보내기 실패');
    }
  };

  /* 다크/라이트 모드 테마 토글 */
  function switchTheme(checked: boolean) {
    if (editorThemeMode === okaidia) {
      setEditorTheme(noctisLilac);
    } else {
      setEditorTheme(okaidia);
    }
  }

  /* 백준(0), 리트코드(1) 선택 */
  const [algoSelect, setAlgoSelect] = useState(0);

  const selectChange = (event, newValue: number) => {
    setAlgoSelect(newValue);
  };

  /* leetcode 문제 정보 가져오기 */
  const fetchLeetProbInfo = async () => {
    if (leetProbDataRef.current === null) return;

    const problemQueryVariable = {
      //@ts-ignore
      titleSlug: leetProbDataRef.current.value,
    };

    try {
      const response = await axios.post(
        'https://cors-anywhere.herokuapp.com/https://leetcode.com/graphql',
        {
          query: PROBLEMQUERY,
          variables: problemQueryVariable,
        }
      );

      let probData = response.data;
      console.log(probData.data);
      setLeetProbData(probData.data);
    } catch (error) {
      console.error(error);
    }
  };

  /* 백준 문제 정보 가져오기 */
  const fetchBojProbInfo = async () => {
    if (bojProbDataRef.current === null) return;

    let probId = bojProbDataRef.current.value;
    console.log(probId);

    try {
      const response = await axios.get(
        `https://solved.ac/api/v3/problem/show?problemId=${probId}`
      );

      let probData = response.data;
      console.log(probData);
      setBojProbData(probData);
      fetchBojProbFullData(probId);
    } catch (error) {
      console.error(error);
    }
  };

  /* 서버로 몽고DB에 저장된 백준 문제 정보 요청 */
  async function fetchBojProbFullData(probId: string) {
    if (bojProbDataRef.current === null) return;

    try {
      const response = await axios.get(
        `http://localhost:3001/bojdata?probId=${probId}`
      );

      let probFullData = response.data[0];
      console.log(probFullData);
      setBojProbFullData(probFullData);
    } catch (error) {
      console.error(error);
    }
  }

  /* leetcode 유저 정보 가져오기 */
  const fetchLeetUserData = async () => {
    if (leetUserNameRef.current === null) return;

    //@ts-ignore
    let leetUserName = leetUserNameRef.current.value;
    console.log(leetUserName);

    const userQueryVariable = {
      //@ts-ignore
      username: leetUserName,
    };

    try {
      const response = await axios.post(
        'https://cors-anywhere.herokuapp.com/https://leetcode.com/graphql',
        {
          query: USERINFOQUERY,
          variables: userQueryVariable,
        }
      );

      let userData = response.data;
      console.log(userData.data);
      setLeetUserData(userData.data);
    } catch (error) {
      console.error(error);
    }
  };

  /* 백준 유저 정보 가져오기 */
  const fetchBojUserData = async () => {
    if (bojUserNameRef.current === null) return;

    //@ts-ignore
    let bojUserName = bojUserNameRef.current.value;
    console.log(bojUserName);

    try {
      const response = await axios.get(
        `https://solved.ac/api/v3/search/user?query=${bojUserName}`
      );

      let userData = response.data;
      console.log(userData);
      setBojUserData(userData);
    } catch (error) {
      console.error(error);
    }
  };

  /* 문제 예제 인풋을 실행 인풋 창으로 복사 */
  // todo: 인덱스를 인수로 받고, 해당하는 예제 복사하기
  const copyToInput = () => {
    if (inputStdin.current === undefined) return;
    inputStdin.current.value = bojProbFullData?.samples?.[1].input;
  };

  return (
    <EditorWrapper>
      <EditorInfo>
        <div>
          🧙🏻‍♂️{roomId}님의 IDE🪄
          <span style={{ fontSize: '10px', color: 'grey' }}>
            내정보: {userName}
          </span>
        </div>
      </EditorInfo>

      <AlgoWrapper>
        <Box>
          <Box sx={{ bgcolor: '#272822', display: 'flex' }}>
            <Header>
              <StyledTabs
                value={algoSelect}
                onChange={selectChange}
                aria-label="algo-selector"
              >
                <StyledTab label="Baekjoon" />
                <StyledTab label="LeetCode" />
              </StyledTabs>

              <InputWrapper>
                <div>
                  {algoSelect === 0 ? (
                    <div>
                      <TextField
                        id="standard-basic"
                        label="문제 번호"
                        variant="standard"
                        inputRef={bojProbDataRef}
                      />
                      <AutoFixHighIcon
                        onClick={fetchBojProbInfo}
                        style={{ color: '#ffefd5' }}
                      />
                    </div>
                  ) : (
                    <div>
                      <TextField
                        id="standard-basic"
                        label="leetcode-title-slug"
                        variant="standard"
                        inputRef={leetProbDataRef}
                      />
                      <AutoFixHighIcon
                        onClick={fetchLeetProbInfo}
                        style={{ color: '#ffe600' }}
                      />
                    </div>
                  )}
                </div>
              </InputWrapper>
            </Header>

            <ProbInfo>
              <div style={{ color: '#ffefd5' }}>
                {algoSelect === 0 && bojProbData?.level ? (
                  <>
                    <RenderSvg svgName={bojProbData.level} />
                    <span>
                      {bojProbData?.problemId}번 {bojProbData?.titleKo}
                    </span>
                  </>
                ) : (
                  <span>
                    {leetProbData?.question.difficulty}{' '}
                    {leetProbData?.question.questionId}번{' '}
                    {leetProbData?.question.title}
                  </span>
                )}
              </div>
            </ProbInfo>
            <Box sx={{ p: 3 }} />
          </Box>
        </Box>
      </AlgoWrapper>

      {bojProbData?.problemId || leetProbData?.question.titleSlug ? (
        <>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography>문제 정보</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                <div
                  dangerouslySetInnerHTML={
                    algoSelect === 0 && bojProbFullData?.prob_desc
                      ? {
                          __html: bojProbFullData?.prob_desc.replace(
                            /\n/g,
                            '<br>'
                          ),
                        }
                      : {
                          __html: leetProbData?.question.content,
                        }
                  }
                />
              </Typography>
            </AccordionDetails>
          </Accordion>

          {algoSelect === 0 && bojProbFullData?.prob_input ? (
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2a-content"
                id="panel2a-header"
              >
                <Typography>입력 & 출력</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  <Typography>입력</Typography>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: bojProbFullData?.prob_input.replace(
                        /\n/g,
                        '<br>'
                      ),
                    }}
                  />
                  <Typography>출력</Typography>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: bojProbFullData?.prob_output.replace(
                        /\n/g,
                        '<br>'
                      ),
                    }}
                  />
                </Typography>
              </AccordionDetails>
            </Accordion>
          ) : (
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2a-content"
                id="panel2a-header"
              >
                <Typography>코드 스니펫</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        leetProbData?.question.codeSnippets[3].code.replace(
                          /\n/g,
                          '<br>'
                        ),
                    }}
                  ></div>
                </Typography>
              </AccordionDetails>
            </Accordion>
          )}

          {leetProbData?.question.exampleTestcases ||
          bojProbFullData?.samples ? (
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2a-content"
                id="panel2a-header"
              >
                <Typography>예제</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  <Grid container spacing={3}>
                    <Grid xs>
                      {algoSelect === 1 &&
                      leetProbData?.question.exampleTestcases ? (
                        <Item>
                          <div
                            dangerouslySetInnerHTML={{
                              __html:
                                leetProbData?.question.exampleTestcases.replace(
                                  /\n/g,
                                  '<br>'
                                ),
                            }}
                          />
                        </Item>
                      ) : (
                        <Item>
                          예제1 인풋
                          <Tooltip title="인풋 창으로 복사하기" arrow>
                            <InputIcon onClick={copyToInput} />
                          </Tooltip>
                          <div
                            dangerouslySetInnerHTML={{
                              __html:
                                bojProbFullData?.samples?.[1].input.replace(
                                  /\n/g,
                                  '<br>'
                                ),
                            }}
                          />
                          예제1 아웃풋
                          <div
                            dangerouslySetInnerHTML={{
                              __html:
                                bojProbFullData?.samples?.[1].output.replace(
                                  /\n/g,
                                  '<br>'
                                ),
                            }}
                          />
                        </Item>
                      )}
                    </Grid>
                    <Grid xs>
                      <Item>xs=6</Item>
                    </Grid>
                    <Grid xs>
                      <Item>xsㄴㅇㄹㄴㅇㄹ</Item>
                    </Grid>
                  </Grid>
                </Typography>
              </AccordionDetails>
            </Accordion>
          ) : null}
        </>
      ) : null}

      <MiddleWrapper>
        <ThemeProvider>
          <Tooltip title="코드 실행하기" arrow>
            <Button onClick={runCode} color="primary" theme={buttonTheme}>
              RUN
            </Button>
          </Tooltip>
          <Tooltip title="제출하기" arrow>
            <Button
              color="primary"
              theme={buttonTheme}
              href={
                bojProbData?.problemId
                  ? `https://acmicpc.net/problem/${bojProbData?.problemId}`
                  : `https://leetcode.com/problems/${leetProbData?.question.titleSlug}`
              }
              target="_blank"
              rel="noreferrer"
            >
              SUBMIT
            </Button>
          </Tooltip>
        </ThemeProvider>

        <FormGroup>
          <FormControlLabel
            control={
              <MaterialUISwitch
                sx={{ m: 1 }}
                defaultChecked
                onClick={(checked) => {
                  switchTheme(checked);
                }}
              />
            }
            label=""
          />
        </FormGroup>
      </MiddleWrapper>

      <div
        ref={editor}
        style={{
          minHeight: '50%',
          // boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
          filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25)',
          // marginTop: '10px',
          marginBottom: '10px',
        }}
      />

      <Divider light="true"></Divider>

      <Box sx={{ flexGrow: 1, marginTop: '10px' }}>
        {/* <Grid container spacing={1.5} columns={16}> */}
        <Grid container spacing={1.5}>
          <Grid xs>
            <Item>
              <TextField
                id="standard-multiline-static"
                label="INPUT"
                multiline
                fullWidth
                // disabled
                rows={8}
                variant="standard"
                inputRef={inputStdin}
              />
            </Item>
          </Grid>
          <Grid xs>
            <Item>
              <Grid container spacing={1.5}>
                <Grid xs>
                  <Item>
                    <TextField
                      id="standard-read-only-input"
                      variant="standard"
                      label="TIME"
                      size="small"
                      fullWidth
                      InputProps={{
                        readOnly: true,
                      }}
                      // helperText="TIME"
                      value={cpuTime}
                    />
                  </Item>
                </Grid>

                <Grid xs>
                  <Item>
                    <TextField
                      id="standard-read-only-input"
                      variant="standard"
                      label="MEMORY"
                      size="small"
                      fullWidth
                      InputProps={{
                        readOnly: true,
                      }}
                      value={memory}
                    />
                  </Item>
                </Grid>
              </Grid>
              <TextField
                id="standard-multiline-static"
                label="OUTPUT"
                multiline
                fullWidth
                rows={5}
                variant="standard"
                InputProps={{
                  readOnly: true,
                }}
                value={compileOutput}
              />
              {/* <span
                    style={{ border: '1px solid black' }}
                    className="compiled-output"
                    dangerouslySetInnerHTML={{
                      __html: compileOutput,
                    }}
                  ></span> */}
            </Item>
          </Grid>
        </Grid>
      </Box>
    </EditorWrapper>
  );
}

export default YjsCodeMirror;

const EditorWrapper = styledc.div`
  width: 95%;
  margin: 0 auto;
  font-family: 'Cascadia Code', sans-serif;
`;

const EditorInfo = styledc.div`
font-size: 40px; 
font-weight: 600; 
margin-top: 3%;
`;

const AlgoWrapper = styledc.div`
margin-top: 20px;
width: 100%;
`;

interface StyledTabsProps {
  children?: React.ReactNode;
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
}

const StyledTabs = styled((props: StyledTabsProps) => (
  <Tabs
    {...props}
    TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }}
  />
))({
  '& .MuiTabs-indicator': {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  '& .MuiTabs-indicatorSpan': {
    maxWidth: 80,
    width: '100%',
    backgroundColor: '#ffe600',
  },
});

interface StyledTabProps {
  label: string;
}

const StyledTab = styled((props: StyledTabProps) => (
  <Tab disableRipple {...props} />
))(({ theme }) => ({
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightRegular,
  fontSize: theme.typography.pxToRem(20),
  marginRight: theme.spacing(1),
  color: 'rgba(255, 255, 255, 0.7)',
  '&.Mui-selected': {
    color: '#fff',
  },
  '&.Mui-focusVisible': {
    backgroundColor: 'rgba(100, 95, 228, 0.32)',
  },
}));

const Header = styledc.div`
  display: flex;
  justify-content: space-between;
`;

const AlgoInput = styledc.input`
  font-size: 18px;
  padding: 10px;
  margin: 10px;
  background: papayawhip;
  border: none;
  border-radius: 3px;
`;
const InputWrapper = styledc.div`
  margin-top: 10px;
`;

const ProbInfo = styledc.div`
  margin-left: 20px;
  margin-top: 20px;
  color: 'rgba(255, 255, 255, 0.7)';
  font-size: 20px;
  background-color: 'white';
  width: 300px;
`;

const ProfileInfo = styledc.div`
  margin-left: 20px;
  martgin-top: 10px;
  font-size: 20px;
`;

const MiddleWrapper = styledc.div`
  margin-left: 20px;
  martgin-top: 10px;
  font-size: 20px;
  display: flex;
`;
