import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from './LandingPage';

function App() {

  return (
    <BrowserRouter >
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="details" element={<div>Details Page</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;