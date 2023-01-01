import { prisma } from "../server/db/client";
import Image from "next/image";
import Heading from "../components/ui/Heading";
import { useSession } from "next-auth/react";
import { BuildGrid } from "../components/features/BuildList";
import { ReviewGrid } from "../components/features/Reviews";
import { trpc } from "../utils/trpc";

import type {
  NextPage,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from "next";
import Panel from "../components/ui/Panel";

type PageProps = InferGetStaticPropsType<typeof getStaticProps>;

const ProfilePage: NextPage<PageProps> = (props) => {
  const { user: userData } = props;

  const { data: session } = useSession();

  const { data: user } = trpc.user.getProfileData.useQuery(
    {
      name: userData.name as string,
    },
    {
      initialData: userData,
      enabled: false,
      onSuccess: () => {
        console.log("Fetched profile data.");
      },
    }
  );

  if (!user) return <div>Loading user...</div>;

  const isCurrentUser = session && user.id === session.user?.id;

  const userFavorites = user.favorites.map((favorite) => favorite.id);

  console.log("User data", user);

  return (
    <div className="flex flex-col gap-8 p-0 md:p-4">
      <section className="flex flex-col justify-between gap-4 bg-black bg-opacity-50 p-4 md:flex-row md:rounded-lg">
        <div className="flex items-center gap-4">
          <div>
            <Image
              src={user.image as string}
              alt={`${user.name} profile picture.`}
              width={50}
              height={50}
              className="rounded-full"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="mb-0">{user.name}</h1>
            <div className="h-fit text-xs leading-tight">
              Member Since {new Date(user.createdAt).toDateString()}
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
      <section>
        <Heading>
          {isCurrentUser ? "Your Builds" : `${user.name}'s Builds`}
        </Heading>
        <div className="flex flex-col gap-4">
          <BuildGrid builds={user.builds} userFavorites={userFavorites} />
        </div>
      </section>
      <section>
        <Heading>
          {isCurrentUser ? "Your Favorites" : `${user.name}'s Favorites`}
        </Heading>
        <div className="flex flex-col gap-4">
          <BuildGrid builds={user.favorites} userFavorites={userFavorites} />
        </div>
      </section>
      <section>
        <Heading>
          {isCurrentUser ? "Your Reviews" : `${user.name}'s Reviews`}
        </Heading>
        <div className="flex flex-col gap-4">
          <ReviewGrid reviews={user.reviews} />
          {user.reviews.length === 0 && (
            <Panel>
              <div className="text-center">No reviews yet!</div>
            </Panel>
          )}
        </div>
      </section>
    </div>
  );
};

export const getStaticProps = async (ctx: GetStaticPropsContext) => {
  const { params } = ctx;

  if (!params || !params.username || typeof params.username !== "string") {
    return {
      notFound: true,
    };
  }

  const username = params.username.toLowerCase();

  const profileData = await prisma.user.findFirst({
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
              id: true,
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
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          weapon: true,
          attachments: true,
        },
      },
    },
  });

  if (!profileData) {
    return {
      notFound: true,
    };
  }

  return { props: { user: profileData }, revalidate: 60 };
};

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export default ProfilePage;
