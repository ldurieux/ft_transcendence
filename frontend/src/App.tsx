import './App.css';
import React, {useState} from 'react';
import { BrowserRouter } from "react-router-dom";
import UserContext from "./components/Utils/context.tsx";
import {get} from "./components/Utils/Request.tsx";

const Header = React.lazy(() => import('./components/Header/index.tsx'));
const FrontRoute = React.lazy(() => import('./components/redirect.tsx'));

function App() {

  return (
    <div className="App-header">

        <div className="App">
          <BrowserRouter>
              <Header />
                 <FrontRoute />
          </BrowserRouter>
        </div>
    </div>

  );
}

export default App;
