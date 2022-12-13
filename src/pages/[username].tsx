import type { Review, User } from "@prisma/client";
import type { GetStaticProps } from "next";
import { prisma } from "../server/db/client";
import Image from "next/image";
import Heading from "../components/ui/Heading";
import { useSession } from "next-auth/react";
import type { CompleteBuildData } from "../types/Builds";
import { BuildCard } from "../components/features/BuildList";
import { ReviewCard } from "../components/features/Reviews";
import type { CompleteReviewData } from "../types/Reviews";

type Props = {
  user: User & {
    createdAt: string;
    favorites: CompleteBuildData[];
    builds: CompleteBuildData[];
    reviews: Review[];
  };
};

const ProfilePage = (props: Props) => {
  const { user } = props;

  const { data: session } = useSession();

  console.log("Session data", session);
  console.log("User data", user);

  return (
    <main>
      <section className="flex flex-col gap-2 bg-neutral-800 p-4">
        <div className="flex items-center gap-4">
          <div>
            <Image
              src={user.image as string}
              alt={`${user.name} profile picture.`}
              width={50}
              height={50}
            />
          </div>
          <div className="flex flex-col">
            <h1 className="mb-0">{user.name}&rsquo;s Profile</h1>
            <div>
              <span className="text-xs">
                Member Since {new Date(user.createdAt).toDateString()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-8">
          <div className="basis-1/3">
            <label>Builds</label>
            <div>{user.builds.length}</div>
          </div>
          <div className="basis-1/3">
            <label>Favorites</label>
            <div>{user.favorites.length}</div>
          </div>
          <div className="basis-1/3">
            <label>Reviews</label>
            <div>{user.reviews.length}</div>
          </div>
        </div>
      </section>
      <section className="p-4">
        <Heading>
          {session && user.id === session.user?.id
            ? "Your Builds"
            : `${user.name}'s Builds`}
        </Heading>
        <div className="flex flex-col gap-4">
          {user.builds.map((build, index) => (
            <BuildCard key={`userbuild-${index}`} build={build} />
          ))}
        </div>
      </section>
      <section className="p-4">
        <Heading>
          {session && user.id === session.user?.id
            ? "Your Favorites"
            : `${user.name}'s Favorites`}
        </Heading>
        <div className="flex flex-col gap-4">
          {user.favorites.map((build, index) => (
            <BuildCard key={`favorite-${index}`} build={build} />
          ))}
        </div>
      </section>
      <section className="p-4">
        <Heading>
          {session && user.id === session.user?.id
            ? "Your Reviews"
            : `${user.name}'s Reviews`}
        </Heading>
        <div className="flex flex-col gap-4">
          {user.reviews.map((review, index) => (
            <ReviewCard
              key={`favorite-${index}`}
              review={review as CompleteReviewData}
            />
          ))}
        </div>
      </section>
    </main>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const { params } = ctx;

  if (!params || !params.username || typeof params.username !== "string") {
    return {
      notFound: true,
    };
  }

  const username = params.username.toLowerCase();

  const userInfo = await prisma.user.findFirst({
    where: { name: { equals: username, mode: "insensitive" } },
    select: {
      name: true,
      image: true,
      createdAt: true,
      id: true,
      builds: {
        include: {
          author: {
            select: {
              name: true,
              image: true,
            },
          },
          weapon: true,
          attachments: true,
        },
      },
      reviews: {
        include: {
          build: true,
        },
      },
      favorites: {
        include: {
          author: true,
          weapon: true,
          attachments: true,
        },
      },
    },
  });

  if (!userInfo) {
    return {
      notFound: true,
    };
  }

  const userSerialized = JSON.parse(JSON.stringify(userInfo));

  return { props: { user: userSerialized }, revalidate: 60 };
};

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export default ProfilePage;
