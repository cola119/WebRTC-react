import React, { useState } from 'react';
import { Sender } from './components/Sender';
import { Reciever } from './components/Reciever';
import { DEFAULT_RTC_CONFIG } from './utils';

export const App: React.FC<{}> = () => {
  const [isSender, setIsSender] = useState<boolean>(false);
  const [isReciever, setIsReciever] = useState<boolean>(false);

  return (
    <div>
      <div>
        current stun server is {DEFAULT_RTC_CONFIG.iceServers[0].urls[0]}
      </div>
      {![isSender, isReciever].includes(true) && (
        <div>
          <button onClick={(): void => setIsSender(true)}>Organizer</button>
          <button onClick={(): void => setIsReciever(true)}>Join room</button>
        </div>
      )}
      {isSender && <Sender />}
      {isReciever && <Reciever />}
    </div>
  );
};
