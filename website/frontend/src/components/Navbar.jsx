import React from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/navbar";
import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import logo from "../assets/wine_shop_logo.png";
import { jwtDecode } from 'jwt-decode';
import { ImCross } from "react-icons/im";

export default function MyNavbar() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [username, setUsername] = React.useState("");

  React.useEffect(() => {

    const checkAuthStatus = () => {
      const accessToken = localStorage.getItem("access_token");
      if (accessToken) {
        try {
          const decodedToken = jwtDecode(accessToken);

          if (decodedToken.exp && decodedToken.exp < Date.now() / 1000) {
            throw new Error('Token expired');
          }

          setIsLoggedIn(true);
          setUsername(decodedToken.sub);
        } catch (error) {
          // Token is invalid or expired
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          setIsLoggedIn(false);
          setUsername("");
        }
      } else {
        setIsLoggedIn(false);
        setUsername("");
      }
    };

    checkAuthStatus();

    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("authStatusChange", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authStatusChange", handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");

    // Update state
    setIsLoggedIn(false);
    setUsername("");

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent("authStatusChange"));

    // Redirect to home page
    window.location.href = "/";
  };

  return (
    <Navbar isBordered>
      <NavbarBrand>
        <Link color="foreground" href="/">
          <img
            src={logo}
            alt="Wine Shop logo"
            className="h-14 rounded-md"
          />
        </Link>
      </NavbarBrand>
      <NavbarContent justify="end">
        {isLoggedIn ? (
          // Authenticated user content
          <>
            <NavbarItem className="lg:flex">
              <span className="text-default-600">Welcome, {username}</span>
            </NavbarItem>
            <NavbarItem>
              <Button
                color="danger"
                variant="light"
                size="sm"
                onPress={handleLogout}
                className="min-w-unit-8 w-8 h-8 p-0"
                isIconOnly
              >
              <ImCross/>
              </Button>
            </NavbarItem>
          </>
        ) : (
          <>
            <NavbarItem className="lg:flex">
              <Link color="default" href="login">Login</Link>
            </NavbarItem>
            <NavbarItem>
              <Button as={Link} color="default" href="register" variant="flat">
                Sign Up
              </Button>
            </NavbarItem>
          </>
        )}
      </NavbarContent>
    </Navbar>
  );
}