import { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import MainPage from "./MainPage.jsx";

export default function LandingPage() {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const hasClickedYes = localStorage.getItem("hasClickedYes");
    if (hasClickedYes === "true") {
      setShowDetails(true);
    }
  }, []);

  const handleYesClick = () => {
    localStorage.setItem("hasClickedYes", "true");
    setShowDetails(true);
  };

  const handleNoClick = () => {
    window.location.href = "https://www.asae.gov.pt/perguntas-frequentes1/area-alimentar/alcool/alcool-na-adolescencia-exposicao-e-suas-consequencias.aspx"; // Change to your desired external URL
  };

  if (showDetails) {
    return (
      <MainPage />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-semibold mb-8 text-center">
        Are you over 18 years old?
      </h1>
      <div className="flex gap-4">
        <Button
          onPress={handleNoClick}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-danger-600"
        >
          No
        </Button>
        <Button
          onPress={handleYesClick}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-success-600"
        >
          Yes
        </Button>
      </div>
    </div>
  );
}
