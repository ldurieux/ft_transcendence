import './App.css';
import React from 'react';
import { BrowserRouter } from "react-router-dom";

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
