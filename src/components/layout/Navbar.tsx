import Link from "next/link";
import { IoMdMenu, IoMdPerson, IoMdSearch } from "react-icons/io";
import Drawer from "../ui/Drawer";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import PopperButton from "../ui/PopperButton";
import { FaClock, FaFire, FaList, FaMedal, FaUpload } from "react-icons/fa";
import { useRouter } from "next/router";

const Navbar = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false);

  const { data: session } = useSession();

  let navItems = [
    {
      name: "Home",
      href: "/",
    },
    {
      name: "Builds",
      href: "/builds",
      tooltip: <BuildMenu />,
      children: [
        {
          name: "Hot Builds",
          href: "/builds/?view=hot",
        },
        {
          name: "New Builds",
          href: "/builds/?view=new",
        },
        {
          name: "Top Builds",
          href: "/builds/?view=top",
        },
        {
          name: "Worst Builds",
          href: "/builds/?view=worst",
        },
      ],
    },
  ];

  const modItems = [
    {
      name: "Mod Dashboard",
      href: "/mod",
    },
  ];

  const router = useRouter();

  const isAuthorized: boolean = session?.user
    ? session?.user.role === "MODERATOR" || session?.user.role === "ADMIN"
    : false;

  if (isAuthorized) {
    navItems = navItems.concat(modItems);
  }

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
            {navItems.map((item, index) => {
              if (item.tooltip) {
                return (
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
                    tooltip={item.tooltip}
                  />
                );
              } else {
                return (
                  <Link
                    href={item.href}
                    className="p-4 transition-all hover:text-orange-400"
                    key={`nav-desktop-item-${index}`}
                  >
                    <div className="font-jost">{item.name}</div>
                  </Link>
                );
              }
            })}
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
            <div
              className={`mb-4 rounded-md p-4 font-jost transition-all hover:bg-neutral-900 hover:text-orange-500 ${
                item.href == router.pathname
                  ? "bg-neutral-900 text-orange-500"
                  : ""
              }`}
            >
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

const BuildMenu = () => {
  return (
    <div className="max-w-md">
      <div className="mb-2 text-xl">Builds</div>
      <div className="mb-4">
        Browse through our communities collection of builds, ready for you to
        dominate the warzone.
      </div>
      <div className="grid grid-cols-2 grid-rows-3 gap-4">
        <Link
          href={`/builds/?view=hot`}
          className="flex cursor-pointer items-center gap-4 rounded border border-orange-500 p-4 transition-all hover:text-orange-500"
        >
          <div>
            <FaFire />
          </div>
          <div>Hot Builds</div>
        </Link>
        <Link
          href={`/builds/?view=top`}
          className="flex cursor-pointer items-center gap-4 rounded border border-orange-500 p-4 transition-all hover:text-orange-500"
        >
          <div>
            <FaMedal />
          </div>
          <div>Top Builds</div>
        </Link>
        <Link
          href={`/builds/?view=new`}
          className="flex cursor-pointer items-center gap-4 rounded border border-orange-500 p-4 transition-all hover:text-orange-500"
        >
          <div>
            <FaClock />
          </div>
          <div>New Builds</div>
        </Link>
        <Link
          href={`/builds/?view=worst`}
          className="flex cursor-pointer items-center gap-4 rounded border border-orange-500 p-4 transition-all hover:text-orange-500"
        >
          <div>
            <FaList />
          </div>
          <div>Worst Builds</div>
        </Link>
        <Link
          href={`/builds/submit`}
          className="col-span-2 flex cursor-pointer items-center justify-center gap-4 rounded border border-orange-500 p-4 transition-all hover:text-orange-500"
        >
          <div>
            <FaUpload />
          </div>
          <div>Submit A Build</div>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
