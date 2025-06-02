import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from './MainPage';
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import LandingPage from "./LandingPage";

function App() {

  return (
    <BrowserRouter >
      <Routes>
        <Route path="/" element={<LandingPage/>} />
        <Route path="/signin" element={<SignIn/>} />
        <Route path="/signup" element={<SignUp/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;