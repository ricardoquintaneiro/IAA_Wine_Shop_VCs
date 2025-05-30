import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
} from "@heroui/navbar";
import {Link} from "@heroui/link";
import { Button } from "@heroui/button"
import logo from "../../public/wine_shop_logo.png";

export default function MyNavbar() {


  const navLinks = [
    { label: "Equipa", href: "equipa" },
    { label: "Manifestos", href: "manifesto" },
  ];

  return (
    <Navbar isBordered>
      {/* Left Content */}
      <NavbarContent>
        <NavbarMenuToggle
          className="sm:hidden"
        />
        <NavbarBrand
        >
          <Link color="foreground" href="/">
          <img
              src={logo}
              alt="Logo da loja"
              className="h-auto sm:h-9 w-auto dark:invert-0 invert" // Adjust height and width as needed
            />
          </Link>
        </NavbarBrand>
      </NavbarContent>

      {/* Center Content */}
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {navLinks.map((link) => (
          <NavbarItem key={link.href}>
            <Link color="foreground" href={link.href}>
              {link.label}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      {/* Right Content */}
      <NavbarContent justify="end">
        <NavbarItem className="hidden sm:flex">
          <Button className="text-green-500"> Hello NextUI!</Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
