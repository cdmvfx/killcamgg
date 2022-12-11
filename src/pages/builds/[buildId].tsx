import type { Attachment, Build, User, Weapon } from "@prisma/client";
import { useRouter } from "next/router";
import Heading from "../../components/ui/Heading";
import Panel from "../../components/ui/Panel";
import UserAvatar from "../../components/ui/UserAvatar";
import { trpc } from "../../utils/trpc";

const BuildPage = () => {
  const router = useRouter();
  const { buildId } = router.query;

  if (!buildId) {
    return <div>Build not found</div>;
  }

  const { data: build, isLoading: isLoadingBuild } = trpc.build.getOne.useQuery(
    {
      id: buildId as string,
    }
  );

  return (
    <main>
      <div>
        <div className="">
          {isLoadingBuild && <div>Loading...</div>}
          {build && (
            <>
              <section className="flex flex-col gap-2 bg-neutral-800 p-4">
                <h1 className="mb-0">{build.title}</h1>
                <div className="">
                  <UserAvatar user={build.author} showAvatar={true} />
                </div>
                <div className="flex gap-8">
                  <div className="basis-1/2">
                    <label>Created</label>
                    <div>{build.createdAt.toDateString()}</div>
                  </div>
                  <div className="basis-1/2">
                    <label>Last Updated</label>
                    <div>{build.updatedAt.toDateString()}</div>
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

type BuildData = {
  build: Build & {
    weapon: Weapon;
    author: User;
    attachments: Attachment[];
  };
};

const BuildRatingSummary = ({ build }: BuildData) => {
  return (
    <section className="mb-4">
      <div className="mb-4 flex items-center gap-4">
        <div className="text-4xl">⭐5.0</div>
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

const BuildInfo = ({ build }: BuildData) => {
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
            <label>Attachments</label>
            <div className="flex flex-col gap-2">
              {build.attachments.map((attachment, index) => {
                return (
                  <div key={index} className="flex gap-2">
                    <div className="h-8 w-8 bg-orange-500"></div>
                    <div>{attachment.name}</div>
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

const BuildReviews = ({ build }: BuildData) => {
  return (
    <section>
      <Heading>Reviews</Heading>
      <Panel>
        <div className="px-4">
          {!build.reviews && (
            <>
              <div className="mb-2 text-center">No reviews yet!</div>
              <button className="mb-0 w-full ">Review this build!</button>
            </>
          )}
        </div>
      </Panel>
    </section>
  );
};

export default BuildPage;
