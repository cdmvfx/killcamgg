import Link from "next/link";
import { IoMdMenu } from "react-icons/io";
import Drawer from "../ui/Drawer";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import PopperButton from "../ui/PopperButton";
import { FaClock, FaFire, FaList, FaMedal, FaUpload } from "react-icons/fa";
import { useRouter } from "next/router";
import Button from "../ui/Button";
import { signOut } from "next-auth/react";

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
    {
      name: "FAQ",
      href: "/faq",
    },
  ];

  const modItems = [
    {
      name: "Mod Dashboard",
      href: "/mod",
    },
  ];

  const accountItems = [
    {
      name: "My Profile",
      href: `/${session?.user?.name}`,
    },
    {
      name: "My Builds",
      href: `/${session?.user?.name}/builds`,
    },
    {
      name: "My Favorites",
      href: `/${session?.user?.name}/favorites`,
    },
    {
      name: "My Reviews",
      href: `/${session?.user?.name}/reviews`,
    },
    {
      name: "Settings",
      href: `/settings`,
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
    <nav className="w-full max-w-none bg-neutral-900">
      <div className="w-full bg-neutral-900 md:mx-auto md:max-w-6xl">
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
          <div className="flex items-center justify-end">
            {session?.user ? (
              <div
                onClick={() => setIsAccountDrawerOpen(true)}
                className="cursor-pointer p-4"
              >
                <Image
                  src={session?.user.image as string}
                  alt=""
                  className="rounded-full"
                  width={30}
                  height={30}
                />
              </div>
            ) : (
              <Link href={`/auth/signin`} className="px-4">
                <Button text="Sign In" />
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
      {session && session.user && (
        <Drawer
          open={isAccountDrawerOpen}
          setOpen={setIsAccountDrawerOpen}
          title="Account"
        >
          <div className="mb-8 flex items-center justify-between gap-4">
            <Link
              href={`/${session.user.name}`}
              className="flex items-center gap-4"
            >
              <div>
                <Image
                  className="rounded-full"
                  src={session.user.image as string}
                  width={50}
                  height={50}
                  alt="Profile Image"
                />
              </div>
              <div className="flex-grow">
                <label>Signed in as</label>
                <div className="text-xl">{session.user.name}</div>
              </div>
            </Link>
            <Button text="Sign Out" variant="tertiary" onClick={signOut} />
          </div>
          {accountItems.map((item, index) => (
            <Link
              key={`account-item-${index}`}
              href={item.href}
              onClick={() => setIsDrawerOpen(false)}
            >
              <div
                className={`mb-2 rounded-md px-4 py-2 font-jost transition-all hover:bg-neutral-900 hover:text-orange-500 ${
                  `/${item.href}` == router.pathname
                    ? "bg-neutral-900 text-orange-500"
                    : ""
                }`}
              >
                {item.name}
              </div>
            </Link>
          ))}
        </Drawer>
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
