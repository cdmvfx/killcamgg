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
    <div>
      <div className="w-full bg-orange-600">
        <div className="flex w-full justify-between">
          <div className="flex h-full items-center">
            <div
              className="cursor-pointer p-4 text-2xl"
              onClick={() => setIsDrawerOpen(true)}
            >
              <IoMdMenu />
            </div>
            <Link href={"/"}>
              <div className="font-jost text-2xl font-bold tracking-widest text-white">
                KILLCAM.GG
              </div>
            </Link>
          </div>
          <div className="flex items-center text-2xl">
            {session?.user && (
              <Link href={`/${session.user.name}`}>
                <div className="p-4">
                  <IoMdPerson />
                </div>
              </Link>
            )}
            <div className="pr-4">
              <IoMdSearch />
            </div>
          </div>
        </div>
      </div>
      <Drawer open={isDrawerOpen} setOpen={setIsDrawerOpen} title="Navigation">
        {navItems.map((item, index) => (
          <Link
            href={item.href}
            key={`nav-item-${index}`}
            onClick={() => setIsDrawerOpen(false)}
          >
            <div className="rounded-md p-4 transition-all hover:bg-neutral-900 hover:text-orange-400">
              {item.name}
            </div>
          </Link>
        ))}
      </Drawer>
    </div>
  );
};

export default Navbar;
