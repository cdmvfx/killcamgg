import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";

const BuildsList = () => {
  const { data: builds, isLoading } = trpc.build.getAll.useQuery();
  const router = useRouter();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const visitBuild = (buildId: string) => {
    router.push(`/builds/${buildId}`);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      {builds?.map((build, index) => {
        return (
          <div
            key={index}
            className="w-full cursor-pointer bg-neutral-800"
            onClick={() => visitBuild(build.id)}
          >
            <div className="min-h-36 flex py-2">
              <div className="flex basis-4/12 flex-col items-center justify-center gap-2 px-2">
                <div className="text-4xl">⭐5.0</div>
                <div className="text-center text-xs">1337 Ratings</div>
              </div>
              <div className="basis-8/12 px-2">
                <div className="p-2">
                  <div className="text-xl">
                    <p>{build.title}</p>
                  </div>
                  <div className="text-xs">
                    by{" "}
                    <span className="text-orange-500">{build.author.name}</span>{" "}
                    -{" "}
                    {build.updatedAt.getTime() === build.createdAt.getTime()
                      ? build.createdAt.toDateString()
                      : build.updatedAt.toDateString()}
                  </div>
                </div>
                <div className="p-2">
                  <div className="mb-2">{build.weapon.name}</div>
                  <div className="flex w-full flex-row gap-2 ">
                    {build.attachments.map((attachment, index) => {
                      return (
                        <div key={index} className="text-sm">
                          <div className="h-4 w-4 bg-orange-500"></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BuildsList;
