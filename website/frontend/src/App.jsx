import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import MainPage from "./MainPage";
import {RequireAuth,RequireAge} from "./components/RequireAuth";
import AgeGate from "./AgeVerificationPage";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AgeGate />} />
        
        {/* Routes that require age verification but not authentication */}
        <Route>
          <Route path="/login" element={<SignIn />} />
          <Route path="/register" element={<SignUp />} />
        </Route>
        
        {/* Routes that require both age verification AND authentication */}
        <Route>
          <Route element={<RequireAuth />}>
            <Route path="/shop" element={<MainPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;