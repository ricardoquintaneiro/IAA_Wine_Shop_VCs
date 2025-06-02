import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
} from "@heroui/navbar";
import {Link} from "@heroui/link";
import { Button } from "@heroui/button"
import logo from "../assets/wine_shop_logo.png";

export default function MyNavbar() {

  return (
        <Navbar isBordered>
      <NavbarBrand>
           <Link color="foreground" href="/">
           <img
               src={logo}
               alt="Logo da loja"
               className="h-14 rounded-md" // Adjust height and width as needed
             />
           </Link>
      </NavbarBrand>
      <NavbarContent justify="end">
        <NavbarItem className="lg:flex">
          <Link color="default" href="signin">Login</Link>
        </NavbarItem>
        <NavbarItem>
          <Button as={Link} color="default" href="signup" variant="flat">
            Sign Up
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
