import React from 'react';
import { Sender } from './components/Sender';
import { Switch, Route } from 'react-router-dom';
import { Home } from './Home';

export const App: React.FC<{}> = () => {
  return (
    <Switch>
      <Route path="/rooms/add">
        <Sender />
      </Route>
      <Route exact path="/">
        <Home />
      </Route>
    </Switch>
  );
};
