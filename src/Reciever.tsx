import React, { useEffect, useRef, useState, ChangeEvent } from 'react';
import { fetchRoomById, setAnswer } from './firebase/rooms';
import { DEFAULT_RTC_CONFIG, requestUserMedia } from './utils';

export const Reciever: React.FC<{}> = () => {
  const myVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerVideoRef = useRef<HTMLVideoElement | null>(null);

  const [roomId, setRoomId] = useState<string>();
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection>();
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [isIceCreated, setIsIceCreated] = useState(false);

  const handleRoomIdInput = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setRoomId(value);
  };
  const joinRoom = async (): Promise<void> => {
    if (!roomId || !peerConnection || !localStream) return;
    const room = await fetchRoomById(roomId);
    if (!room) return console.error('room not found');
    const offer = new RTCSessionDescription(room.offer);
    peerConnection.setRemoteDescription(offer);
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
  };

  useEffect(() => {
    const _peerConnection = new RTCPeerConnection(DEFAULT_RTC_CONFIG);
    setPeerConnection(_peerConnection);
    _peerConnection.addEventListener('icecandidate', async (e) => {
      console.log('icecandidate', e.candidate);
      if (e.candidate == null) setIsIceCreated(true);
    });
    _peerConnection.ontrack = (e): void => {
      console.log('ontrack', e);
      const stream = e.streams[0];
      if (!peerVideoRef.current) return;
      peerVideoRef.current.srcObject = stream;
    };
    _peerConnection.onicecandidateerror = (e): void => {
      console.log('onicecandidateerror', e);
    };
  }, []);

  useEffect(() => {
    if (!isIceCreated) return;
    const sendAnswer = async (): Promise<void> => {
      if (!peerConnection) return console.error('peerConnection not found');
      const answer = peerConnection.localDescription;
      await setAnswer(roomId!!, answer!!);
    };
    sendAnswer();
  }, [isIceCreated]);

  useEffect(() => {
    if (!myVideoRef.current) return;
    const init = async (): Promise<void> => {
      const stream = await requestUserMedia();
      if (!stream) return; // TODO
      myVideoRef.current!.srcObject = stream;
      setLocalStream(stream);
    };
    init();
  }, [myVideoRef.current]);

  return (
    <div>
      {isIceCreated ? (
        <div>Current room id is {roomId}</div>
      ) : (
        <div>
          <div>Room id you want to join</div>
          <input
            type="text"
            onChange={handleRoomIdInput}
            value={roomId || ''}
          />
          {roomId && <button onClick={joinRoom}>join</button>}
        </div>
      )}
      <div>
        <video
          playsInline
          autoPlay
          controls
          muted
          ref={myVideoRef}
          style={{ width: '300px', border: '1px solid #000000' }}
        />
        <video
          playsInline
          autoPlay
          controls
          muted
          ref={peerVideoRef}
          style={{ width: '300px', border: '1px solid #000000' }}
        />
      </div>
    </div>
  );
};
