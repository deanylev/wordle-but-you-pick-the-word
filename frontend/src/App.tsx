import { BrowserRouter, Route, Routes } from 'react-router-dom';

import CreatePage from './pages/CreatePage';
import PlayPage from './pages/PlayPage';

import './App.scss';
import Toaster from './components/Toaster';

function App() {
  return (
    <div className="App">
      <div className="title">WORDLE</div>
      <div className="subtitle">(but you pick the word)</div>
      <Toaster>
        {(onToast) => (
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<CreatePage onToast={onToast} />} />
              <Route path="/:short" element={<PlayPage onToast={onToast} />} />
            </Routes>
          </BrowserRouter>
        )}
      </Toaster>
    </div>
  );
}

export default App;
