import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { Home } from './components/Home';
import { Room } from './components/Room';

export const App: React.FC<{}> = () => {
  return (
    <Switch>
      <Route path="/rooms/:roomId" component={Room} />
      <Route exact path="/" component={Home} />
    </Switch>
  );
};
