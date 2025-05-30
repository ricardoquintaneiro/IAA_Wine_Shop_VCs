import { Button } from "@heroui/button"
import { useNavigate } from "react-router-dom";
import MyNavbar from "./components/Navbar";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex flex-col h-screen">
        {/* Flex container */}
        <MyNavbar />
        <main className="flex-grow">
          <Button className="text-green-500" onPress={() => navigate("/details")}> Hello NextUI!</Button>
        </main>
        {/* <MyFooter /> */}
      </div>
    </>
  );
}