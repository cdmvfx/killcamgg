import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { FilteredBuildGrid } from "../components/features/build";
import Heading from "../components/ui/Heading";
import { trpc } from "../utils/trpc";
import { useRouter } from "next/router";
import Link from "next/link";
import Button from "../components/ui/Button";

const Home: NextPage = () => {
  const { data: session, status } = useSession();

  const { data: user } = trpc.user.getOne.useQuery({
    id: session?.user?.id ?? null,
  });

  const userFavorites = user
    ? user.favorites.map((favorite) => favorite.id)
    : null;

  const router = useRouter();

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
                Build, share, and review builds and loadouts with our
                community-first system.
              </div>
              <div className="flex flex-col md:flex-row md:gap-8">
                <Link href="/builds">
                  <Button
                    text="Browse Builds"
                    variant="primary"
                    classNames="px-6 text-xl"
                  />
                </Link>
                {status !== "loading" && session && (
                  <Link href="/submit">
                    <Button
                      text="Submit A Build"
                      variant="secondary"
                      classNames="px-6 text-xl"
                    />
                  </Link>
                )}
                {status !== "loading" && !session && (
                  <Link href="/signin">
                    <Button
                      text="Sign In"
                      variant="secondary"
                      classNames="px-6 text-xl"
                    />
                  </Link>
                )}
              </div>
            </div>
            <div className="md:basis-1/2"></div>
          </div>
        </div>
        <div className="">
          <Heading
            primaryAction={{
              label: "View All",
              onClick: () => router.push("/builds"),
            }}
          >
            Top Rated Builds
          </Heading>
          <FilteredBuildGrid
            userFavorites={userFavorites}
            sortBy={{ name: "Rating (High to Low)", value: "rating-desc" }}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
