import React from "react";
import { Button } from "./ui/button";

const Navbar: React.FC = () => {
  return (
    <div className="fixed inset-x-0 top-0 bg-white dark:bg-gray-950 z-[10] h-fit border-b border-zinc-300  py-2 ">
      <div className="flex items-center justify-between h-full gap-2 px-8 mx-auto max-w-7xl">
        {/* Logo */}
        <a href={"/"} className="flex items-center gap-2">
          <p className="rounded-lg border-2 border-b-4 border-r-4 border-violet-500 px-2 py-1 text-xl font-bold transition-all hover:-translate-y-[2px] md:block dark:border-white font-Nunito">
            QuiPool
          </p>
        </a>
        <div className="flex items-center space-x-2">
          <Button
            className="block py-2 text-center text-gray-700 hover:text-violet-500 border rounded-lg md:border-none transition-all hover:-translate-y-[2px]" variant={"link"}
          >
            Sign up
          </Button>

          <Button
            className="rounded-lg border-2 border-b-4 border-r-4 border-violet-500 px-2 py-1 text-base font-medium transition-all hover:-translate-y-[2px] md:block dark:border-white font-Nunito" variant={"link"}
          >
            Log in
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
