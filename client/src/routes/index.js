import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import Home from './Home';
import Login from './Login';
import Register from './Register';
import CreateTeam from './CreateTeam';

const Routes = () => (
  <BrowserRouter>
    <Switch>
      <Route path="/" exact component={Home} />
      <Route path="/register" exact component={Register} />
      <Route path="/create-team" exact component={CreateTeam} />
      <Route path="/login" exact component={Login} />
    </Switch>
  </BrowserRouter>
);

export default Routes;
