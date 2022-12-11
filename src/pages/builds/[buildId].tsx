import type { Attachment, Build, Review, User, Weapon } from "@prisma/client";
import type { GetStaticProps } from "next";
import Link from "next/link";
import { IoMdStar } from "react-icons/io";
import { ReviewCard } from "../../components/features/Reviews";
import Heading from "../../components/ui/Heading";
import Panel from "../../components/ui/Panel";
import UserAvatar from "../../components/ui/UserAvatar";
import { prisma } from "../../server/db/client";
import { CompleteReviewData } from "../../types/Reviews";

type BuildData = Build & {
  weapon: Weapon;
  author: User;
  attachments: Attachment[];
  reviews: CompleteReviewData[];
};

type BuildPageProps = {
  build: BuildData;
};

const BuildPage = (props: BuildPageProps) => {
  const { build } = props;

  console.log("Build data", build);

  return (
    <main>
      <div>
        <div className="">
          {build && (
            <>
              <section className="flex flex-col gap-2 bg-neutral-800 p-4">
                <h1 className="mb-0">{build.title}</h1>
                <Link href={`/${build.author.name}`} className="w-fit">
                  <UserAvatar user={build.author} showAvatar={true} />
                </Link>
                <div className="flex gap-8">
                  <div className="basis-1/2">
                    <label>Created</label>
                    <div>{new Date(build.createdAt).toDateString()}</div>
                  </div>
                  <div className="basis-1/2">
                    <label>Last Updated</label>
                    <div>{new Date(build.updatedAt).toDateString()}</div>
                  </div>
                </div>
              </section>
              <div className="p-4">
                <BuildRatingSummary build={build} />
                <BuildInfo build={build} />
                <BuildReviews build={build} />
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

const BuildRatingSummary = ({ build }: BuildPageProps) => {
  return (
    <section className="mb-4">
      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center text-4xl">
          <span className="text-orange-500">
            <IoMdStar />
          </span>{" "}
          5
        </div>
        <div className="">
          <div>1337 Ratings</div>
        </div>
      </div>
      <div className="">
        <button className="mb-0 w-full ">Review this build!</button>
      </div>
    </section>
  );
};

const BuildInfo = ({ build }: BuildPageProps) => {
  return (
    <section>
      <Heading>Build Information</Heading>
      <Panel>
        <div className="px-4">
          {build.description && (
            <div className="mb-4">
              <label>Description</label>
              <p>{build.description}</p>
            </div>
          )}
          <div className="mb-4">
            <label>{build.weapon.category}</label>
            <div>{build.weapon.name}</div>
          </div>
          <div>
            <div className="flex flex-col justify-center gap-4">
              {build.attachments.map((attachment, index) => {
                return (
                  <div key={index} className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-orange-600"></div>
                    <div className="flex flex-col">
                      <label>{attachment.category}</label>
                      <div>{attachment.name}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div>{build.weapon.unlock_req}</div>
        </div>
      </Panel>
    </section>
  );
};

const BuildReviews = ({ build }: BuildPageProps) => {
  return (
    <section>
      <Heading>Reviews</Heading>
      <div>
        {!build.reviews.length ? (
          <Panel>
            <div className="px-4">
              <div className="mb-2 text-center">No reviews yet!</div>
              <button className="mb-0 w-full ">Review this build!</button>
            </div>
          </Panel>
        ) : (
          <div>
            {build.reviews.map((review) => (
              <ReviewCard
                key={`build-review-${review.id}`}
                build={build}
                review={review}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (!params || !params.buildId || typeof params.buildId !== "string") {
    return {
      notFound: true,
    };
  }

  const buildInfo = await prisma.build.findFirst({
    where: { id: params.buildId },
    include: {
      weapon: true,
      attachments: true,
      author: true,
      reviews: {
        include: {
          author: true,
        },
      },
    },
  });

  if (!buildInfo) {
    return {
      notFound: true,
    };
  }

  const buildSerialized = JSON.parse(JSON.stringify(buildInfo));

  return { props: { build: buildSerialized }, revalidate: 60 };
};

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export default BuildPage;
