import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { createRoom, fetchRoomById } from '../firebase/rooms';

export const Home: React.FC<RouteComponentProps> = ({ history }) => {
  const [roomId, setRoomId] = useState<string>();

  const handleRoomIdInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setRoomId(value);
  };

  const createNewRoom = async (): Promise<void> => {
    const id = await createRoom();
    history.push(`rooms/${id}`);
  };

  const joinRoom = async (): Promise<void> => {
    if (!roomId) return;
    const room = await fetchRoomById(roomId);
    if (!room) return console.error('room not found');
    history.push(`rooms/${roomId}`);
  };

  return (
    <div>
      <button onClick={createNewRoom}>Create Room</button>
      <div>
        <div>Room id you want to join</div>
        <input type="text" onChange={handleRoomIdInput} value={roomId || ''} />
        {roomId && <button onClick={joinRoom}>join</button>}
      </div>
    </div>
  );
};
