import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { fetchRoomById } from '../firebase/rooms';
import { Sender } from './Sender';
import { Reciever } from './Reciever';

export const Room: React.FC<RouteComponentProps<RouterParams>> = ({
  match,
}) => {
  const roomId = match.params.roomId;
  const [isOwner, setIsOwner] = useState<boolean>();

  useEffect(() => {
    const init = async (): Promise<void> => {
      const room = await fetchRoomById(roomId);
      if (!room) return console.error('room not found');
      if (room.offer && room.answer) {
        console.error('TODO reconnect');
        return;
      }
      if (room.offer) {
        setIsOwner(false);
      } else {
        setIsOwner(true);
      }
    };
    init();
  }, []);

  if (isOwner === true) return <Sender roomId={roomId} />;
  if (isOwner === false) return <Reciever roomId={roomId} />;
  return <div>something error happened</div>;
};
