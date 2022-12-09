import { Attachment, Weapon } from "@prisma/client";
import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import GroupedDropdown from "../components/ui/GroupedDropdown";
import Panel from "../components/ui/Panel";
import { WeaponsByCategory } from "../types/Weapons";

import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  const { data: session, status } = useSession();

  console.log(session, status);

  return (
    <main className="flex w-full flex-col items-center px-4 pt-10">
      <h1>Killcam.GG</h1>
      <div className="w-full">
        <div className="mb-4">
          {session ? (
            <>
              <div className="flex flex-col items-center">
                <h2>Hello {session.user?.name}!</h2>
                <button className="tertiary" onClick={() => signOut()}>
                  Logout
                </button>
              </div>
              <BuildForm />
            </>
          ) : (
            <button onClick={() => signIn("discord")} className="w-full">
              Login with Discord
            </button>
          )}
        </div>
        <div className="">
          <Builds />
        </div>
      </div>
    </main>
  );
};

const Builds = () => {
  const { data: builds, isLoading } = trpc.build.getAll.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {builds?.map((build, index) => {
        return (
          <div key={index} className="w-full border border-neutral-300 p-4">
            <p className="text-xl">{build.title}</p>
            <p>{build.description}</p>
            <p>by {build.author.name}</p>
          </div>
        );
      })}
    </div>
  );
};

const BuildForm = () => {
  const { data: session } = useSession();
  const utils = trpc.useContext();
  const { data: weapons, isLoading: isLoadingWeapons } =
    trpc.weapon.getAll.useQuery();
  const { data: attachments, isLoading: isLoadingAttachments } =
    trpc.attachment.getAll.useQuery();

  const { data: weaponsByCategory } = trpc.weapon.getAllByCategory.useQuery();
  console.log("Weapons by Category", weaponsByCategory);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [weapon, setWeapon] = useState<Weapon | Attachment>();
  const [selectedAttachments, setSelectedAttachments] = useState<number[]>([1]);

  const addAttachment = () => {
    setSelectedAttachments((current) => [...current, 1]);
  };

  const removeAttachment = (index: number) => {
    setSelectedAttachments((current) => current.filter((_, i) => i !== index));
  };

  const postBuild = trpc.build.postBuild.useMutation({
    onSettled: () => {
      utils.build.getAll.invalidate();
      setTitle("");
      setDescription("");
    },
  });

  const submitBuild = () => {
    if (!session) return;
    if (!weapon) return;

    if (session !== null) {
      postBuild.mutate({
        userId: session.user?.id as string,
        title,
        description,
        weaponId: weapon.id,
      });
    }
  };

  return (
    <div>
      <input
        type="text"
        value={title}
        placeholder="Your build title"
        minLength={5}
        maxLength={100}
        onChange={(e) => setTitle(e.target.value)}
        className=""
      />
      <textarea
        value={description}
        placeholder="Your build description"
        minLength={5}
        maxLength={100}
        rows={4}
        onChange={(e) => setDescription(e.target.value)}
        className=""
      />
      <label>Select a weapon</label>
      <GroupedDropdown
        selectedItem={weapon}
        setSelectedItem={setWeapon}
        data={weaponsByCategory as WeaponsByCategory}
      />
      <label>Select your attachments</label>
      <Panel>
        <div>
          {selectedAttachments.map((attachmentId, index) => {
            return (
              <div key={`attachment-${attachmentId}`}>
                <div className="mb-4 flex items-center gap-2">
                  <select className="mb-0">
                    {!isLoadingAttachments &&
                      attachments?.map((attachment) => {
                        return (
                          <option
                            key={`attachment-${attachment.id}`}
                            value={attachment.id}
                          >
                            {attachment.name}
                          </option>
                        );
                      })}
                  </select>
                  <div className="p-2" onClick={() => removeAttachment(index)}>
                    &times;
                  </div>
                </div>
              </div>
            );
          })}
          <button className="tertiary w-full" onClick={addAttachment}>
            Add attachment
          </button>
        </div>
      </Panel>
      <button className="w-full" onClick={submitBuild}>
        Submit Build
      </button>
    </div>
  );
};

export default Home;
