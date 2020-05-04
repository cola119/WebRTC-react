import React, { useEffect, useRef, useState, ChangeEvent } from 'react';
import {
  createRoomWihtOffer,
  fetchRoomById,
  setAnswer,
} from './firebase/rooms';

const DEFAULT_RTC_CONFIG = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

export const App: React.FC<{}> = () => {
  const myVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerVideoRef = useRef<HTMLVideoElement | null>(null);

  const [roomId, setRoomId] = useState<string>();
  const [existedRoomId, setExistedRoomId] = useState<string>();
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection>();
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [isIceCreated, setIsIceCreated] = useState(false);

  const connect = async (): Promise<void> => {
    if (!localStream) return console.error('localStream not found');
    if (!peerConnection) return console.error('peerConnection not found');
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
  };

  const handleRoomIdInput = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setExistedRoomId(value);
  };
  const joinRoom = async (): Promise<void> => {
    if (!existedRoomId || !peerConnection) return;
    const room = await fetchRoomById(existedRoomId);
    if (!room) return console.error('room not found');
    setRoomId(existedRoomId);
    peerConnection.setRemoteDescription(room.offer);
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
  }, []);

  useEffect(() => {
    if (!isIceCreated) return;
    const sendOffer = async (): Promise<void> => {
      if (!peerConnection) return console.error('peerConnection not found');
      const offer = peerConnection.localDescription!!;
      const _roomId = await createRoomWihtOffer(offer);
      setRoomId(_roomId);
      setIsIceCreated(false);
    };
    const sendAnswer = async (): Promise<void> => {
      if (!peerConnection) return console.error('peerConnection not found');
      const answer = peerConnection.localDescription;
      await setAnswer(existedRoomId!!, answer!!);
      setIsIceCreated(false);
    };
    if (!existedRoomId) sendOffer();
    else if (existedRoomId) sendAnswer();
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
      {roomId ? (
        <div>Current room id is {roomId}</div>
      ) : (
        <button onClick={connect}>Create Room</button>
      )}
      <div>
        <video
          autoPlay
          controls
          muted
          ref={myVideoRef}
          style={{ width: '300px', border: '1px solid #000000' }}
        />
        <video
          autoPlay
          controls
          muted
          ref={peerVideoRef}
          style={{ width: '300px', border: '1px solid #000000' }}
        />
      </div>
      <br />
      {!roomId && (
        <div>
          <div>Room id you want to join</div>
          <input
            type="text"
            onChange={handleRoomIdInput}
            value={existedRoomId || ''}
          />
          {existedRoomId && <button onClick={joinRoom}>join</button>}
        </div>
      )}
    </div>
  );
};

const requestUserMedia = async (): Promise<MediaStream | null> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    return stream;
  } catch (e) {
    console.error(e);
    return null;
  }
};
