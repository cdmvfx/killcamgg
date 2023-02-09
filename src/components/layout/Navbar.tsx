import Link from "next/link";
import { IoMdMenu, IoMdPerson, IoMdSearch } from "react-icons/io";
import Drawer from "../ui/Drawer";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import PopperButton from "../ui/PopperButton";
import { FaClock, FaFire, FaList, FaMedal } from "react-icons/fa";

const Navbar = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false);

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

  const modItems = [
    {
      name: "Mod Dashboard",
      href: "/mod",
    },
  ];

  const isAuthorized: boolean = session?.user
    ? session?.user.role === "MODERATOR" || session?.user.role === "ADMIN"
    : false;

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
            <Link href={"/"} className="group mr-8">
              <div className="hover font-jost text-2xl font-bold tracking-widest transition-all group-hover:text-orange-600">
                KILLCAM
                <span className="text-orange-600 transition-all group-hover:text-white">
                  .GG
                </span>
              </div>
            </Link>
          </div>
          <div className="hidden items-center gap-8 md:flex md:flex-1">
            {navItems.map((item, index) => (
              <PopperButton
                key={`nav-desktop-item-${index}`}
                showOn="hovermenu"
                button={
                  <Link
                    href={item.href}
                    className="p-4 transition-all hover:text-orange-400"
                    key={`nav-desktop-item-${index}`}
                  >
                    <div className="font-jost">{item.name}</div>
                  </Link>
                }
                tooltip={<NavPopover item={item} />}
              />
            ))}
            {isAuthorized &&
              modItems.map((item, index) => (
                <Link
                  href={item.href}
                  className="transition-all hover:text-orange-400"
                  key={`nav-mod-desktop-item-${index}`}
                >
                  <div className="font-jost">{item.name}</div>
                </Link>
              ))}
          </div>
          <div className="flex items-center justify-end text-2xl">
            {session?.user ? (
              <div
                onClick={() => setIsAccountDrawerOpen(true)}
                className="cursor-pointer p-4 transition-all hover:text-orange-600"
              >
                <IoMdPerson />
              </div>
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
            <div className="rounded-md p-4 font-jost transition-all hover:bg-neutral-900 hover:text-orange-600">
              {item.name}
            </div>
          </Link>
        ))}
        {isAuthorized &&
          modItems.map((item, index) => (
            <Link
              href={item.href}
              key={`nav-mod-item-${index}`}
              onClick={() => setIsDrawerOpen(false)}
            >
              <div className="rounded-md p-4 font-jost transition-all hover:bg-neutral-900 hover:text-orange-600">
                {item.name}
              </div>
            </Link>
          ))}
      </Drawer>
      {session && session.user ? (
        <Drawer
          open={isAccountDrawerOpen}
          setOpen={setIsAccountDrawerOpen}
          title="Account"
        >
          <div className="flex items-center gap-4">
            <div>
              <Image
                className="rounded-full"
                src={session.user.image as string}
                width={50}
                height={50}
                alt="Profile Image"
              />
            </div>
            <div>
              <label>Signed in as</label>
              <div className="text-xl">{session.user.name}</div>
            </div>
          </div>
        </Drawer>
      ) : (
        <></>
      )}
    </nav>
  );
};

type NavPopoverProps = {
  item: {
    name: string;
    href: string;
  };
};

const NavPopover = (props: NavPopoverProps) => {
  const { item } = props;

  switch (item.name) {
    case "Builds":
      return (
        <div>
          <div className="text-xl">Builds Menu</div>
          <div className="mb-4">
            Browse through our communities collection of builds, ready for you
            to dominate the warzone.
          </div>
          <div className="grid grid-cols-2 grid-rows-2 gap-4">
            <Link
              href={`/builds/hot`}
              className="flex cursor-pointer items-center gap-4 rounded border border-orange-500 p-4 transition-all hover:text-orange-500"
            >
              <div>
                <FaFire />
              </div>
              <div>Hot Builds</div>
            </Link>
            <Link
              href={`/builds/top`}
              className="flex cursor-pointer items-center gap-4 rounded border border-orange-500 p-4 transition-all hover:text-orange-500"
            >
              <div>
                <FaMedal />
              </div>
              <div>Top Builds</div>
            </Link>
            <Link
              href={`/builds/new`}
              className="flex cursor-pointer items-center gap-4 rounded border border-orange-500 p-4 transition-all hover:text-orange-500"
            >
              <div>
                <FaClock />
              </div>
              <div>New Builds</div>
            </Link>
            <Link
              href={`/builds/all`}
              className="flex cursor-pointer items-center gap-4 rounded border border-orange-500 p-4 transition-all hover:text-orange-500"
            >
              <div>
                <FaList />
              </div>
              <div>All Builds</div>
            </Link>
          </div>
        </div>
      );
    default:
      return <></>;
  }
};

export default Navbar;
