import { Tab } from "@headlessui/react";
import type { GetServerSidePropsContext } from "next";
import { Fragment } from "react";
import { BuildGrid } from "../../components/features/build";
import ReportItem from "../../components/features/moderation/ReportItem";
import Heading from "../../components/ui/Heading";
import Spinner from "../../components/ui/Spinner";
import { getServerAuthSession } from "../../server/common/get-server-auth-session";
import { isAuthorized } from "../../utils/isAuthorized";
import { trpc } from "../../utils/trpc";

const ModPage = () => {
  const { data: pendingBuilds } = trpc.mod.getAllPendingBuilds.useQuery();
  const { data: rejectedBuilds } = trpc.mod.getAllRejectedBuilds.useQuery();

  const { data: reports } = trpc.mod.getAllReports.useQuery();

  const buildTabs = ["Pending", "Rejected"];

  return (
    <div className="p-4 md:py-10">
      <h1 className="mb-8">Moderator Dashboard</h1>
      <div className="mb-8">
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
      <div>
        <Heading>Reports</Heading>
        <div className="flex flex-col gap-4">
          {reports?.map((report) => (
            <ReportItem key={report.id} report={report} />
          ))}
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(ctx);
  const authorized = isAuthorized(session?.user || null);

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
