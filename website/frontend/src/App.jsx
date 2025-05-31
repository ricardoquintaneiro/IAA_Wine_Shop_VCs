import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from './LandingPage';
import SignIn from "./components/SignIn";

function App() {

  return (
    <BrowserRouter >
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/details" element={<div>Details Page</div>} />
        <Route path="/signin" element={<SignIn/>} />
        <Route path="/signup" element={<div>Sign Up Page</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;