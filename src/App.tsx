import React, { useEffect } from 'react';
import './App.css';
import {
  Routes,
  Route,
  BrowserRouter,
} from 'react-router-dom';
import Main from './views/main/Main';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        Currency app
      </header>
      <BrowserRouter>
        <Routes>
          <Route index element={<Main />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
