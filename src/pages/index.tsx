import type { Attachment, Weapon } from "@prisma/client";
import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import { Dispatch, SetStateAction, useState } from "react";
import GroupedDropdown from "../components/ui/GroupedDropdown";
import Panel from "../components/ui/Panel";
import UserAvatar from "../components/ui/UserAvatar";
import type { AttachmentsByCategory } from "../types/Attachments";
import type { WeaponsByCategory } from "../types/Weapons";

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
            <div className="flex ">
              <div className="basis-4/12">
                <div>
                  <p className="text-xl">{build.title}</p>
                  <p>{build.description}</p>
                </div>
                <div>
                  <UserAvatar user={build.author} />
                </div>
              </div>
              <div>
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
        );
      })}
    </div>
  );
};

const BuildForm = () => {
  const { data: session } = useSession();
  const utils = trpc.useContext();
  const { data: weaponsByCategory, isLoading: isLoadingWeapons } =
    trpc.weapon.getAllByCategory.useQuery();
  const { data: attachmentsByCategory, isLoading: isLoadingAttachments } =
    trpc.attachment.getAllByCategory.useQuery();

  console.log("Weapons by Category", weaponsByCategory);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [weapon, setWeapon] = useState<Weapon | Attachment>();
  const [selectedAttachments, setSelectedAttachments] = useState<Attachment[]>(
    []
  );
  const [numOfAttachments, setNumOfAttachments] = useState(1);

  const addAttachment = () => {
    if (numOfAttachments >= 5) return;
    setNumOfAttachments((current) => current + 1);
    console.log(numOfAttachments);
  };

  const removeAttachment = (index: number) => {
    console.log("Removing", index, selectedAttachments[index]);
    setSelectedAttachments((current) => current.filter((_, i) => i !== index));
    setNumOfAttachments((current) => current - 1);
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
        attachmentIds: selectedAttachments.map((attachment) => attachment.id),
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
      {!isLoadingWeapons && (
        <div>
          <label>Select a weapon</label>
          <GroupedDropdown
            selectedItem={weapon}
            setSelectedItem={setWeapon}
            data={weaponsByCategory as WeaponsByCategory}
          />
        </div>
      )}
      {!isLoadingAttachments && (
        <div>
          <label>Select your attachments</label>
          <Panel>
            <div>
              {Array.from(Array(numOfAttachments).keys()).map(
                (attachmentNum, index) => {
                  return (
                    <div key={`attachment-${attachmentNum}`}>
                      <div className="mb-4 flex items-center gap-2">
                        <AttachmentDropdown
                          data={attachmentsByCategory as AttachmentsByCategory}
                          index={index}
                          selectedAttachments={selectedAttachments}
                          setSelectedAttachments={setSelectedAttachments}
                        />
                        <div
                          className="mb-2 cursor-pointer p-2 text-center text-white"
                          onClick={() => removeAttachment(index)}
                        >
                          &times;
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
              {numOfAttachments < 5 && (
                <button className="tertiary w-full" onClick={addAttachment}>
                  Add attachment
                </button>
              )}
            </div>
          </Panel>
        </div>
      )}
      <button className="w-full" onClick={submitBuild}>
        Submit Build
      </button>
    </div>
  );
};

type AttachmentDropdownProps = {
  data: AttachmentsByCategory;
  selectedAttachments: Attachment[];
  setSelectedAttachments: Dispatch<SetStateAction<Attachment[]>>;
  index: number;
};

const AttachmentDropdown = ({
  data,
  selectedAttachments,
  setSelectedAttachments,
  index,
}: AttachmentDropdownProps) => {
  const changeAttachment = (selectedItem: Weapon | Attachment | undefined) => {
    console.log("Selected: ", index, selectedItem);
    setSelectedAttachments((current) => {
      const newAttachments: Attachment[] = [...current];
      newAttachments[index] = selectedItem as Attachment;
      return newAttachments;
    });
  };

  return (
    <GroupedDropdown
      data={data}
      selectedItem={selectedAttachments[index]}
      setSelectedItem={changeAttachment}
      selectedAttachments={selectedAttachments}
    />
  );
};

export default Home;
