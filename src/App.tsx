import React, { useEffect, useRef } from 'react';

export const App: React.FC<{}> = () => {
  const myVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!myVideoRef.current) return;
    const init = async (): Promise<void> => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      console.log(stream, myVideoRef.current);
      myVideoRef.current!.srcObject = stream;
    };
    init();
  }, [myVideoRef.current]);

  return (
    <div>
      <div>healalo</div>
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
  );
};
