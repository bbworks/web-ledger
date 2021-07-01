import {useState, useEffect} from 'react';
import {BrowserRouter as Router, Switch, Route, Link} from 'react-router-dom';

import TransactionsView from './../TransactionsView';
import DashboardView from './../DashboardView';
import FooterNavbar from './../FooterNavbar';

import './main.css';
import './index.scss';

const App = () => {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/transactions" exact>
            <TransactionsView />
          </Route>
          <Route path={["/dashboard", "/"]} exact>
            <DashboardView />
          </Route>
        </Switch>
      </Router>
      <FooterNavbar />
    </div>
  );
};

export default App;
