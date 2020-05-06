import React, { useEffect, useRef, useState } from 'react';
import { fetchRoomById, setAnswer } from '../firebase/rooms';
import { DEFAULT_RTC_CONFIG, requestUserMedia } from '../utils';

type Props = {
  roomId: string;
};

export const Reciever: React.FC<Props> = ({ roomId }) => {
  const myVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerVideoRef = useRef<HTMLVideoElement | null>(null);

  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection>();
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [isIceCreated, setIsIceCreated] = useState(false);

  const createConnection = (): void => {
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
    _peerConnection.oniceconnectionstatechange = (): void => {
      console.log(
        'oniceconnectionstatechange',
        _peerConnection.iceConnectionState,
      );
    };
  };

  useEffect(() => {
    const init = async (): Promise<void> => {
      createConnection();
      const stream = await requestUserMedia();
      if (!stream) return; // TODO
      myVideoRef.current!.srcObject = stream;
      setLocalStream(stream);
    };
    init();
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
    if (!localStream || !peerConnection) return;
    const joinRoom = async (): Promise<void> => {
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
    joinRoom();
  }, [localStream, peerConnection]);

  return (
    <div>
      <div>Current room id is {roomId}</div>
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
