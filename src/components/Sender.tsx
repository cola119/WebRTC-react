import React, { useEffect, useRef, useState } from 'react';
import { setOffer } from '../firebase/rooms';
import { DEFAULT_RTC_CONFIG, requestUserMedia } from '../utils';
import { roomsRef } from '../firebase';

type Props = {
  roomId: string;
};

export const Sender: React.FC<Props> = ({ roomId }) => {
  const myVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerVideoRef = useRef<HTMLVideoElement | null>(null);

  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection>();
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [isIceCreated, setIsIceCreated] = useState(false);

  const listenAnswer = (roomId: string): void => {
    roomsRef.doc(roomId).onSnapshot(async (snapshot) => {
      const room = snapshot.data() as Room;
      console.log('got answer', room.answer);
      if (peerConnection && room.answer) {
        const answer = new RTCSessionDescription(room.answer);
        console.log('setRemoteDescription', room.answer);
        await peerConnection.setRemoteDescription(answer);
      }
    });
  };

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
      if (!stream) return;
      myVideoRef.current!.srcObject = stream;
      setLocalStream(stream);
    };
    init();
  }, []);

  useEffect(() => {
    if (!isIceCreated) return;
    const sendOffer = async (): Promise<void> => {
      if (!peerConnection) return console.error('peerConnection not found');
      const offer = peerConnection.localDescription!!;
      await setOffer(roomId, offer);
      listenAnswer(roomId);
    };
    sendOffer();
  }, [isIceCreated]);

  useEffect(() => {
    if (!localStream || !peerConnection) return;
    const offer = async (): Promise<void> => {
      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
    };
    offer();
  }, [localStream, peerConnection]);

  return (
    <div>
      <div>Current room id is {roomId}</div>
      {!isIceCreated && <div>Creating connection...</div>}
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
