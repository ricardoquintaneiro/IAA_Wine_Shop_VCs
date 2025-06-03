import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from './MainPage';
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import LandingPage from "./LandingPage";
import {RequireAuth} from "./components/RequireAuth";

function App() {

  return (
    <BrowserRouter >
      <Routes>
        <Route element={<RequireAuth />}>
        <Route path="/" element={<LandingPage/>} />
        <Route path="/login" element={<SignIn/>} />
        <Route path="/register" element={<SignUp/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;