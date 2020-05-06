import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { fetchRoomById } from '../firebase/rooms';
import { Sender } from './Sender';
import { Reciever } from './Reciever';

type Role = 'owner' | 'guest' | 'revisitor';

export const Room: React.FC<RouteComponentProps<RouterParams>> = ({
  match,
}) => {
  const roomId = match.params.roomId;
  const [role, setRole] = useState<Role>('revisitor');

  useEffect(() => {
    const init = async (): Promise<void> => {
      const room = await fetchRoomById(roomId);
      if (!room) return console.error('room not found');
      if (room.offer && room.answer) {
        setRole('revisitor');
        return;
      }
      if (room.offer) {
        setRole('guest');
      } else {
        setRole('owner');
      }
    };
    init();
  }, []);

  if (role === 'owner') return <Sender roomId={roomId} />;
  if (role === 'guest') return <Reciever roomId={roomId} />;
  if (role === 'revisitor') return <Reciever roomId={roomId} reConnection />;
  return <div>something error happened</div>;
};
