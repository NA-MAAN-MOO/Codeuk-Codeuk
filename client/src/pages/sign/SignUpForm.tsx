import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import axios, { AxiosError } from 'axios';
import { styledTheme } from 'styles/theme';
import MySnackbar from '../../components/MySnackbar';
import { useSignContext } from 'hooks/useSignContext';
import { APPLICATION_URL } from 'utils/Constants';

interface IForm {
  userId: string;
  userPw: string;
  userNickName: string;
  userBojId: string;
  userLeetId: string;
}
const APPLICATION_DB_URL = APPLICATION_URL.APPLICATION_DB_URL;

export default function FormDialog() {
  const { isSignUpOpen, handleSignUpFailMsg, signUpFailMsg, closeSignUpForm } =
    useSignContext();
  const [userForm, setUserForm] = React.useState<IForm>({
    userId: '',
    userPw: '',
    userNickName: '',
    userBojId: '',
    userLeetId: '',
  });
  const [userIdErrorMsg, setUserIdErrorMsg] = React.useState('');
  const [userNickErrorMsg, setUserNickErrorMsg] = React.useState('');
  const [userPwErrorMsg, setUserPwErrorMsg] = React.useState('');
  const [userBojErrorMsg, setUserBojErrorMsg] = React.useState('');

  const [signUpStatus, setSignUpStatus] = React.useState('');
  const submitSignUpForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      let body = {
        userId: userForm.userId,
        userPw: userForm.userPw,
        userNickname: userForm.userNickName,
        userBojId: userForm.userBojId,
        userLeetId: userForm.userLeetId,
      };
      const signUpResponse = await axios.post(
        `${APPLICATION_DB_URL}/user/signup`,
        body
      );

      const addBojInfoResponse = await axios.post(
        `${APPLICATION_DB_URL}/boj-info`,
        userForm.userBojId
      );

      if (signUpResponse.data.status === 200) {
        setSignUpStatus('SUCCESS');
        closeSignUpForm();
      }
    } catch (error: any) {
      if (error?.response?.status === 409) {
        handleSignUpFailMsg('이미 존재하는 아이디 입니다');
      } else if (error?.response?.status === 410) {
        handleSignUpFailMsg('이미 존재하는 닉네임 입니다');
      } else {
        handleSignUpFailMsg(
          '아이디와 닉네임은 공백과 특수기호를 포함할 수 없습니다'
        );
      }
      setSignUpStatus('FAIL');
    }
    return false;

    //db에 이미 있는 데이터인지 확인하고 이상없으면 제출..
  };

  const handleSignUpClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setSignUpStatus('');
  };

  const handleForm = (item: string, value: string) => {
    setUserForm((prev: IForm) => ({ ...prev, [item]: value }));
  };

  const handleValidation = async (item: string, value: string) => {
    switch (item) {
      case 'userId':
      case 'userNickName':
        try {
          const res = await axios.post(`${APPLICATION_DB_URL}/user/validate`, {
            item,
            value,
          });
          console.log(res.data);
          if (item === 'userId') {
            setUserIdErrorMsg(res.data.message || '');
          } else {
            setUserNickErrorMsg(res.data.message || '');
          }
        } catch (e) {
          console.log(e);
        }
        break;
      case 'userPw':
        if (!value) {
          setUserPwErrorMsg('비밀번호를 입력해 주세요');
        } else {
          setUserPwErrorMsg('');
        }
        break;
    }
  };

  return (
    <div>
      <MySnackbar
        text="회원가입 완료"
        state="success"
        onClose={handleSignUpClose}
        onOpen={signUpStatus === 'SUCCESS'}
      />

      <Dialog
        open={isSignUpOpen}
        onClose={closeSignUpForm}
        sx={{ fontFamily: styledTheme.mainFont }}
      >
        <MySnackbar
          onClose={handleSignUpClose}
          text={signUpFailMsg}
          state="warning"
          onOpen={signUpStatus === 'FAIL'}
        />
        <form onSubmit={submitSignUpForm} id="signUp">
          <DialogTitle sx={{ fontFamily: styledTheme.mainFont }}>
            회원가입
          </DialogTitle>
          <DialogContent>
            <TextField
              required={true}
              margin="dense"
              id="userId"
              label="아이디"
              type="text"
              fullWidth
              variant="standard"
              onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleForm('userId', e.target.value);
              }}
              onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                handleValidation('userId', e.target.value);
              }}
              error={Boolean(userIdErrorMsg)}
              helperText={userIdErrorMsg}
            />
            <TextField
              required={true}
              margin="dense"
              id="userPw"
              label="비밀번호"
              type="password"
              fullWidth
              variant="standard"
              onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleForm('userPw', e.target.value);
              }}
              onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                handleValidation('userPw', e.target.value);
              }}
              error={Boolean(userPwErrorMsg)}
              helperText={userPwErrorMsg}
            />
            <TextField
              required={true}
              margin="dense"
              id="userNickName"
              label="닉네임"
              type="text"
              fullWidth
              variant="standard"
              onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleForm('userNickName', e.target.value);
              }}
              onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                handleValidation('userNickName', e.target.value);
              }}
              error={Boolean(userNickErrorMsg)}
              helperText={userNickErrorMsg}
            />
            <TextField
              margin="dense"
              id="userBojId"
              label="백준 ID"
              type="text"
              fullWidth
              variant="standard"
              onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleForm('userBojId', e.target.value);
              }}
              error={Boolean(userBojErrorMsg)}
              helperText={userBojErrorMsg}
            />
            <TextField
              margin="dense"
              id="userLeetId"
              label="LeetCode ID"
              type="text"
              fullWidth
              variant="standard"
              onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleForm('userLeetId', e.target.value);
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="primary"
              size="small"
              sx={{ fontFamily: styledTheme.mainFont }}
              onClick={closeSignUpForm}
            >
              취소
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="small"
              sx={{ fontFamily: styledTheme.mainFont }}
              type="submit"
              form="signUp"
            >
              확인
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
