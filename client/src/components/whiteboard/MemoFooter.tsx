import React from 'react';
import { useState, ChangeEvent, useCallback } from 'react';
import AvatarWithPopper from './AvatarWithPopper';
import AvatarGroup from '@mui/material/AvatarGroup';
import Checkbox from '@mui/material/Checkbox';
import styled from 'styled-components';
import axios from 'axios';
import { APPLICATION_URL } from '../../utils/Constants';

const APPLICATION_DB_URL = APPLICATION_URL.APPLICATION_DB_URL;

function MemoFooter(props: any) {
  let { _id, participants, getMemos, currentUserNickname } = props;
  const [participantsCopy, setParticipantsCopy] = useState(participants);

  const isChecked = participants.includes(currentUserNickname);
  const [checked, setChecked] = useState<boolean>(isChecked);

  /* Checkbox function */
  const participateIn = () => {
    try {
      axios.post(APPLICATION_DB_URL + `/participate-in-memo`, {
        _id: _id,
        target: currentUserNickname,
      });
    } catch (e) {
      console.error(e);
    }

    let newArray = [...participantsCopy, currentUserNickname];
    setParticipantsCopy(newArray);
  };

  const notParticipateIn = () => {
    participants.filter(
      (participant: string) => participant !== currentUserNickname
    );
    try {
      axios.post(APPLICATION_DB_URL + '/drop-out-of-memo', {
        _id: _id,
        target: currentUserNickname,
      });
    } catch (e) {
      console.error(e);
    }

    let newArray = participantsCopy.filter((p: string) => {
      return p !== currentUserNickname;
    });

    setParticipantsCopy(newArray);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
    if (event.target.checked) {
      participateIn();
    } else {
      notParticipateIn();
    }
  };

  return (
    <>
      <FooterWrapper>
        <AvatarGroup
          max={6}
          sx={{
            paddingLeft: '10px',
            '&.MuiAvatarGroup-avatar': {
              border: 0,
            },
          }}
        >
          {participantsCopy.map((participant: string) => (
            <AvatarWithPopper
              participant={participant}
              key={_id + participant}
            />
          ))}
        </AvatarGroup>
        <Checkbox
          checked={checked}
          onChange={handleChange}
          sx={{
            color: '#b52216',
            '&.Mui-checked': { color: '#b52216' },
            margin: '0 0 10px 10px',
          }}
        />
      </FooterWrapper>
    </>
  );
}

const FooterWrapper = styled.div`
  width: 100%;
  height: 20%;
  position: absolute;
  bottom: 0;
  display: flex;
  // margin-left: 10px;
  justify-content: space-between;
  // border: 1px solid red;
`;

const StyledAvatarGroup = styled(AvatarGroup)`
  border: none;
`;

export default React.memo(MemoFooter);
