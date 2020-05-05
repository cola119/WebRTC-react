import React from 'react';
import { Link } from 'react-router-dom';

export const Home: React.FC<{}> = () => {
  return (
    <div>
      <Link to="/rooms/add">LINK</Link>
    </div>
  );
};
