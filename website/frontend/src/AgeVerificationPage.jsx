import { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./components/RequireAuth";

export default function AgeGate() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Check if user has already verified their age
    const hasVerifiedAge = localStorage.getItem("ageVerified");
    
    if (hasVerifiedAge === "true") {
      // If they're already authenticated, go directly to shop
      if (isAuthenticated) {
        navigate("/shop");
      } else {
        // If not authenticated, go to login
        navigate("/login");
      }
    }
  }, [isAuthenticated, navigate]);

  const handleYesClick = () => {
    localStorage.setItem("ageVerified", "true");
    
    // Check if user is already authenticated
    if (isAuthenticated) {
      navigate("/shop");
    } else {
      navigate("/login");
    }
  };

  const handleNoClick = () => {
    window.location.href = "https://www.asae.gov.pt/perguntas-frequentes1/area-alimentar/alcool/alcool-na-adolescencia-exposicao-e-suas-consequencias.aspx";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Age Verification Required
          </h1>
          <p className="text-gray-600 mb-6">
            You must be 18 years or older to access this wine shop.
          </p>
          <h2 className="text-2xl font-semibold text-purple-600">
            Are you over 18 years old?
          </h2>
        </div>
        
        <div className="flex gap-4">
          <Button
            onPress={handleNoClick}
            className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
          >
            No
          </Button>
          <Button
            onPress={handleYesClick}
            className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
          >
            Yes
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 text-center mt-6">
          By clicking "Yes", you confirm that you are of legal drinking age in your country.
        </p>
      </div>
    </div>
  );
}