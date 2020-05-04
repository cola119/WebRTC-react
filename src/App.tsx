import React, { useEffect, useRef, useState } from 'react';
import { createRoomWihtOffer } from './firebase/rooms';

const DEFAULT_RTC_CONFIG = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
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

export const App: React.FC<{}> = () => {
  const myVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerVideoRef = useRef<HTMLVideoElement | null>(null);

  const [roomId, setRoomId] = useState<string | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection>();
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [iceCandidates, setIceCandidates] = useState<RTCIceCandidateInit[]>([]);

  const createRoom = async (): Promise<void> => {
    if (!localStream) {
      console.error('localStream not found');
      return;
    }
    const _peerConnection = new RTCPeerConnection(DEFAULT_RTC_CONFIG);
    setPeerConnection(_peerConnection);
    localStream.getTracks().forEach((track) => {
      _peerConnection.addTrack(track, localStream);
    });
    const offer = await _peerConnection.createOffer();
    await _peerConnection.setLocalDescription(offer);
    const _roomId = await createRoomWihtOffer(offer);
    setRoomId(_roomId);
  };

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

  useEffect(() => {
    if (!peerConnection) return;
    peerConnection.addEventListener('icecandidate', (e) => {
      console.log('icecandidate', e.candidate);
      if (e.candidate == null) return;
      const json = e.candidate.toJSON();
      setIceCandidates((p) => [...p, json]);
    });
  }, [peerConnection]);

  return (
    <div>
      {roomId ? (
        <div>Current room id is {roomId}</div>
      ) : (
        <button onClick={createRoom}>Create Room</button>
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
    </div>
  );
};
