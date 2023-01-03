import { Tab } from "@headlessui/react";
import type { GetServerSidePropsContext } from "next";
import { useSession } from "next-auth/react";
import { Fragment } from "react";
import { BuildGrid } from "../../components/features/BuildList";
import Heading from "../../components/ui/Heading";
import Spinner from "../../components/ui/Spinner";
import { getServerAuthSession } from "../../server/common/get-server-auth-session";
import { isAuthorized } from "../../utils/isAuthorized";
import { trpc } from "../../utils/trpc";

const ModPage = () => {
  const { data: session } = useSession();

  console.log("useSession Mod Page", session);

  const { data: pendingBuilds } = trpc.build.getAllPending.useQuery();
  const { data: rejectedBuilds } = trpc.build.getAllRejected.useQuery();

  const buildTabs = ["Pending", "Rejected"];

  return (
    <div className="p-4 md:py-10">
      <h1 className="mb-8">Moderator Dashboard</h1>
      <div>
        <Heading>Builds</Heading>
        <Tab.Group>
          <Tab.List>
            <div className="mb-4 flex gap-4 md:max-w-lg">
              {buildTabs.map((tab) => (
                <Tab key={`build-tab-${tab}`} as={Fragment}>
                  {({ selected }) => (
                    <div
                      className={`${
                        selected
                          ? "border-b-orange-500 text-orange-500"
                          : " border-transparent"
                      } w-full cursor-pointer border-b px-4 py-2 text-center transition-all hover:text-orange-500`}
                    >
                      {tab}
                    </div>
                  )}
                </Tab>
              ))}
            </div>
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel>
              {pendingBuilds ? (
                <BuildGrid builds={pendingBuilds} userFavorites={[]} />
              ) : (
                <Spinner />
              )}
            </Tab.Panel>
            <Tab.Panel>
              {rejectedBuilds ? (
                <BuildGrid builds={rejectedBuilds} userFavorites={[]} />
              ) : (
                <Spinner />
              )}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
        <div></div>
      </div>
    </div>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(ctx);
  const authorized = isAuthorized(session?.user);

  if (!authorized) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default ModPage;
