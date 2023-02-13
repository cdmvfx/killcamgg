import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { BuildGrid } from "../components/features/build";
import Heading from "../components/ui/Heading";
import { trpc } from "../utils/trpc";
import Link from "next/link";
import Button from "../components/ui/Button";
import { DateRange, Sort } from "../types/Filters";
import Spinner from "../components/ui/Spinner";

const Home: NextPage = () => {
  const { data: session, status } = useSession();

  const { data: user } = trpc.user.getOne.useQuery({
    id: session?.user?.id ?? null,
  });

  const { data: builds, isLoading: isLoadingBuilds } =
    trpc.build.getAll.useQuery({
      limit: 3,
      sort: Sort.Hot,
      dateRange: DateRange.ThisMonth,
      weaponId: null,
      attachmentIds: null,
      cursor: null,
    });

  const { data: topBuilds, isLoading: isLoadingTopBuilds } =
    trpc.build.getAll.useQuery({
      limit: 3,
      sort: Sort.Top,
      dateRange: DateRange.ThisMonth,
      weaponId: null,
      attachmentIds: null,
      cursor: null,
    });

  const userFavorites = user
    ? user.favorites.map((favorite) => favorite.id)
    : null;

  return (
    <div className="flex w-full flex-col items-center py-4 px-4">
      <div className="w-full">
        <div id="hero" className="mb-8 rounded-lg px-8 py-8 md:py-20">
          <div className="flex flex-col md:flex-row">
            <div className="md:basis-1/2">
              <div className="mb-4 font-jost text-4xl font-bold md:text-6xl">
                Builds For Guaranteed Dubs.
              </div>
              <div className="mb-4">
                Build, share, and review builds with our community-first system.
              </div>
              <div className="flex flex-col md:flex-row md:gap-8">
                <Link href="/builds">
                  <Button
                    text="Browse Builds"
                    variant="primary"
                    width="full"
                    classNames="px-6 text-xl mb-4"
                  />
                </Link>
                {status !== "loading" && session && (
                  <Link href="/builds/submit" className=" w-full md:w-auto">
                    <Button
                      text="Submit A Build"
                      variant="secondary"
                      width="full"
                      classNames="px-6 text-xl"
                    />
                  </Link>
                )}
                {status !== "loading" && !session && (
                  <Link href="/auth/signin">
                    <Button
                      text="Sign In"
                      variant="secondary"
                      width="full"
                      classNames="px-6 text-xl"
                    />
                  </Link>
                )}
              </div>
            </div>
            <div className="md:basis-1/2"></div>
          </div>
        </div>
        <div className="mb-8">
          <Heading
            primaryAction={
              <Link
                href={"/builds/?view=hot"}
                className="transition-all hover:text-orange-500"
              >
                View All
              </Link>
            }
          >
            Hot Builds of the Month
          </Heading>
          {isLoadingBuilds || !builds ? (
            <Spinner />
          ) : (
            <BuildGrid builds={builds.items} userFavorites={userFavorites} />
          )}
        </div>
        <div className="">
          <Heading
            primaryAction={
              <Link
                href={"/builds/?view=top"}
                className="transition-all hover:text-orange-500"
              >
                View All
              </Link>
            }
          >
            Top Builds of the Month
          </Heading>
          {isLoadingTopBuilds || !topBuilds ? (
            <Spinner />
          ) : (
            <BuildGrid builds={topBuilds.items} userFavorites={userFavorites} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
