import Link from "next/link";
import { IoMdMenu, IoMdPerson, IoMdSearch } from "react-icons/io";
import Drawer from "../ui/Drawer";
import { useState } from "react";
import { useSession } from "next-auth/react";

const Navbar = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data: session } = useSession();

  const navItems = [
    {
      name: "Home",
      href: "/",
    },
    {
      name: "Builds",
      href: "/builds",
    },
    {
      name: "Submit A Build",
      href: "/submit",
    },
    // {
    //   name: "Users",
    //   href: "/users",
    // },
    // {
    //   name: "FAQ",
    //   href: "/faq",
    // },
  ];

  return (
    <nav>
      <div className="w-full bg-neutral-900">
        <div className="flex w-full items-center">
          <div className="flex h-full flex-1 items-center p-4 md:flex-none">
            <div
              className="mr-4 cursor-pointer text-2xl transition-all hover:text-orange-600 md:hidden"
              onClick={() => setIsDrawerOpen(true)}
            >
              <IoMdMenu />
            </div>
            <Link href={"/"} className="group ">
              <div className="hover font-jost text-2xl font-bold tracking-widest transition-all group-hover:text-orange-600">
                KILLCAM
                <span className="text-orange-600 transition-all group-hover:text-white">
                  .GG
                </span>
              </div>
            </Link>
          </div>
          <div className="hidden md:flex md:flex-1">
            {navItems.map((item, index) => (
              <Link
                href={item.href}
                className="p-4 transition-all hover:text-orange-400"
                key={`nav-desktop-item-${index}`}
              >
                <div className="font-jost">{item.name}</div>
              </Link>
            ))}
          </div>
          <div className="flex items-center justify-end text-2xl">
            {session?.user ? (
              <Link href={`/${session.user.name}`}>
                <div className="cursor-pointer p-4 transition-all hover:text-orange-600">
                  <IoMdPerson />
                </div>
              </Link>
            ) : (
              <Link href={`/signin`}>
                <div className="cursor-pointer p-4 transition-all hover:text-orange-600">
                  <IoMdPerson />
                </div>
              </Link>
            )}
            <div
              onClick={() => alert("coming soon bitch")}
              className="cursor-pointer pr-4 transition-all hover:text-orange-600"
            >
              <IoMdSearch />
            </div>
          </div>
        </div>
      </div>
      <Drawer
        open={isDrawerOpen}
        flipped
        setOpen={setIsDrawerOpen}
        title="Navigation"
      >
        {navItems.map((item, index) => (
          <Link
            href={item.href}
            key={`nav-item-${index}`}
            onClick={() => setIsDrawerOpen(false)}
          >
            <div className="rounded-md p-4 transition-all hover:bg-neutral-900 hover:text-orange-600">
              {item.name}
            </div>
          </Link>
        ))}
      </Drawer>
    </nav>
  );
};

export default Navbar;
