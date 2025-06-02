import { LuWine } from "react-icons/lu";
import { IoLogoGithub } from "react-icons/io5";
import {Link} from "@heroui/link";

export default function Footer() {
    return (
        <footer className="" >
            <div className="max-w-7xl mx-auto text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <LuWine className="h-6 w-6 text-purple-400" />
                    <span className="font-bold text-lg">2025 WineShop. All rights reserved.</span>
                              <Link isExternal color="foreground" href="https://github.com/ricardoquintaneiro/IAA_Wine_Shop_VCs">
            <IoLogoGithub size={24} />
          </Link>
                </div>
            </div>
        </footer >
    );
}