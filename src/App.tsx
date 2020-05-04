import React, { useState } from 'react';
import { Sender } from './Sender';
import { Reciever } from './Reciever';

export const App: React.FC<{}> = () => {
  const [isSender, setIsSender] = useState<boolean>(false);
  const [isReciever, setIsReciever] = useState<boolean>(false);

  return (
    <div>
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
