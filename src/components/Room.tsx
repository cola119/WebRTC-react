import React from 'react';
import { RouteComponentProps } from 'react-router-dom';

export const Room: React.FC<RouteComponentProps<RouterParams>> = ({
  match,
}) => {
  return <div>{match.params.roomId}</div>;
};
