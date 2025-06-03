import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from './LandingPage';
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";

function App() {

  return (
    <BrowserRouter >
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/details" element={<div>Details Page</div>} />
        <Route path="/signin" element={<SignIn/>} />
        <Route path="/signup" element={<SignUp/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;