import Image from "next/image";
import Heading from "../../components/ui/Heading";
import { BuildGrid } from "../../components/features/build";
import { ReviewGrid } from "../../components/features/reviews";
import Panel from "../../components/ui/Panel";
import { createContextServerSideProps } from "../../server/trpc/context";
import { appRouter } from "../../server/trpc/router/_app";
import {
  FaDiscord,
  FaInstagram,
  FaTiktok,
  FaTwitch,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";

import type {
  NextPage,
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { FaCheckCircle } from "react-icons/fa";
import PopperButton from "../../components/ui/PopperButton";
import Link from "next/link";
import { RankBadge } from "../../components/ui/RankBadge";
import { RoleBadge } from "../../components/ui/RoleBadge";
import UserModMenu from "../../components/features/moderation/UserModMenu";
import { trpc } from "../../utils/trpc";
import ReportUser from "../../components/features/profile/ReportUser";

type PageProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const ProfilePage: NextPage<PageProps> = (props) => {
  const { user: initialUser, sessionUser } = props;

  const { data: user } = trpc.user.getProfileData.useQuery(
    { name: initialUser.name },
    {
      initialData: initialUser,
    }
  );

  if (!user) {
    return <>No User</>;
  }

  const isCurrentUser = sessionUser && user.id === sessionUser.id;

  const userFavorites = user.favorites.map((favorite) => favorite.id);

  return (
    <div className="flex flex-col gap-8 p-0 md:p-4">
      <section className="flex flex-col justify-between gap-4 bg-black bg-opacity-50 p-4 md:flex-row md:items-center md:rounded-lg">
        <div className="flex gap-4">
          <div>
            <Image
              src={user.image as string}
              alt={`${user.name} profile picture.`}
              width={50}
              height={50}
              className="rounded-full"
            />
          </div>
          <div className="">
            <div className="flex items-center gap-4">
              <h1 className="mb-0">{user.displayName}</h1>
              {user.isVerified && (
                <PopperButton
                  showOn="hover"
                  tooltip={user.name + " is verified."}
                  button={<FaCheckCircle className="text-orange-500" />}
                />
              )}
              <RoleBadge role={user.role} />
              <RankBadge score={user.score} />
              {sessionUser && <ReportUser userId={user.id} />}
              {sessionUser &&
                (sessionUser.role === "ADMIN" ||
                  sessionUser.role === "MODERATOR") && (
                  <UserModMenu user={user} />
                )}
            </div>
            <div className="mb-2 h-fit text-xs leading-tight">
              Member Since {new Date(user.createdAt).toDateString()}
            </div>
            {user.socials && (
              <div className="flex gap-4 text-lg leading-4">
                {user.socials.discord.length > 3 && (
                  <PopperButton
                    showOn="hovermenu"
                    tooltip={user.socials.discord}
                    button={<FaDiscord />}
                  />
                )}
                {user.socials.twitch.length > 3 && (
                  <Link
                    target="_blank"
                    href={`https://twitch.tv/${user.socials.twitch}`}
                  >
                    <FaTwitch />
                  </Link>
                )}
                {user.socials.twitter.length > 3 && (
                  <Link
                    target="_blank"
                    href={`https://twitter.com/${user.socials.twitter}`}
                  >
                    <FaTwitter />
                  </Link>
                )}
                {user.socials.tiktok.length > 3 && (
                  <Link
                    target="_blank"
                    href={`https://tiktok.com/@${user.socials.tiktok}`}
                  >
                    <FaTiktok />
                  </Link>
                )}
                {user.socials.youtube.length > 3 && (
                  <Link
                    target="_blank"
                    href={`https://youtube.com/${user.socials.youtube}`}
                  >
                    <FaYoutube />
                  </Link>
                )}
                {user.socials.instagram.length > 3 && (
                  <Link
                    target="_blank"
                    href={`https://instagram.com/${user.socials.instagram}`}
                  >
                    <FaInstagram />
                  </Link>
                )}
              </div>
            )}
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
      <section className="p-4 md:p-0">
        <Heading
          primaryAction={
            <Link
              className="transition-all hover:text-orange-500"
              href={`/${user.name}/builds`}
            >
              View All
            </Link>
          }
        >
          {isCurrentUser ? "Your Builds" : `${user.name}'s Builds`}
        </Heading>
        <div className="flex flex-col gap-4">
          <BuildGrid builds={user.builds} userFavorites={userFavorites} />
        </div>
      </section>
      <section className="p-4 md:p-0">
        <Heading
          primaryAction={
            <Link
              className="transition-all hover:text-orange-500"
              href={`/${user.name}/favorites`}
            >
              View All
            </Link>
          }
        >
          {isCurrentUser ? "Your Favorites" : `${user.name}'s Favorites`}
        </Heading>
        <div className="flex flex-col gap-4">
          <BuildGrid builds={user.favorites} userFavorites={userFavorites} />
        </div>
      </section>
      <section className="p-4 md:p-0">
        <Heading
          primaryAction={
            <Link
              className="transition-all hover:text-orange-500"
              href={`/${user.name}/reviews`}
            >
              View All
            </Link>
          }
        >
          {isCurrentUser ? "Your Reviews" : `${user.name}'s Reviews`}
        </Heading>
        <div className="flex flex-col gap-4">
          {user.reviews.length === 0 ? (
            <Panel>
              <div className="text-center">No reviews yet!</div>
            </Panel>
          ) : (
            <ReviewGrid reviews={user.reviews} />
          )}
        </div>
      </section>
    </div>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const { params } = ctx;

  if (!params || !params.username || typeof params.username !== "string") {
    return {
      notFound: true,
    };
  }

  const trpcContext = await createContextServerSideProps(ctx);

  const caller = appRouter.createCaller(trpcContext);

  const sessionUser = await caller.user.getSelf();

  const user = await caller.user.getProfileData({
    name: params.username,
  });

  if (!user) {
    return {
      notFound: true,
    };
  }

  return { props: { user, sessionUser } };
};

export default ProfilePage;
