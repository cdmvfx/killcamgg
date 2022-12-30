import { trpc } from "../../utils/trpc";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { z } from "zod";
import type { Attachment, Weapon } from "@prisma/client";
import Alert from "../ui/Alert";
import GroupedDropdown from "../ui/GroupedDropdown";
import Heading from "../ui/Heading";
import Panel from "../ui/Panel";
import type { AttachmentsByCategory } from "../../types/Attachments";
import type { WeaponsByCategory } from "../../types/Weapons";
import { useSession } from "next-auth/react";
import type { BuildGetOneResult } from "../../types/Builds";
import { useRouter } from "next/router";
import Spinner from "../ui/Spinner";

type FormErrors = {
  [key: string]: string[];
};

type BuildFormProps = {
  existingBuild?: BuildGetOneResult;
  setShowBuildForm?: Dispatch<SetStateAction<boolean>>;
};

const BuildForm = (props: BuildFormProps) => {
  const { existingBuild, setShowBuildForm } = props;

  const { data: session } = useSession();

  const router = useRouter();
  const utils = trpc.useContext();

  // Queries and mutations
  const { data: weaponsByCategory, isLoading: isLoadingWeapons } =
    trpc.weapon.getAllByCategory.useQuery();

  const { data: attachmentsByCategory, isLoading: isLoadingAttachments } =
    trpc.attachment.getAllByCategory.useQuery();

  const postBuild = trpc.build.post.useMutation({
    onSettled: () => {
      utils.build.getAll.invalidate();
      setTitle("");
      setDescription("");
      setWeapon(null);
      setSelectedAttachments([]);
    },
  });

  const updateBuild = trpc.build.update.useMutation({
    onSuccess: () => {
      utils.build.getOne.invalidate({ id: existingBuild?.id as string });
      if (setShowBuildForm) setShowBuildForm(false);
    },
  });

  const deleteBuild = trpc.build.delete.useMutation({
    onSuccess: () => {
      router.push("/builds");
    },
  });

  // States
  const [title, setTitle] = useState(existingBuild?.title || "");
  const [description, setDescription] = useState(
    existingBuild?.description || ""
  );
  const [weapon, setWeapon] = useState<Weapon | null>(
    existingBuild?.weapon || null
  );
  const [selectedAttachments, setSelectedAttachments] = useState<Attachment[]>(
    existingBuild?.attachments || []
  );
  const [numOfAttachments, setNumOfAttachments] = useState(
    existingBuild?.attachments.length || 1
  );

  const [errors, setErrors] = useState<FormErrors>({
    title: [],
    description: [],
    weaponId: [],
    attachmentIds: [],
  });

  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  // Functions
  const handleWeaponChange = (weapon: Weapon | Attachment | null) => {
    setWeapon(weapon as Weapon);
  };

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

  const clickDeleteBuild = () => {
    setShowDeleteAlert(true);
  };

  const clickDeleteCancel = () => {
    setShowDeleteAlert(false);
  };

  const clickDeleteBuildFinal = () => {
    if (!existingBuild) return;
    deleteBuild.mutate({
      id: existingBuild.id,
    });
  };

  const cancelBuildEdit = () => {
    if (setShowBuildForm) setShowBuildForm(false);
    setTitle(existingBuild?.title || "");
    setDescription(existingBuild?.description || "");
    setWeapon(existingBuild?.weapon || null);
    setSelectedAttachments(existingBuild?.attachments || []);
  };

  const submitBuild = () => {
    setErrors({});

    if (!session) return;

    const formSchema = z.object({
      title: z
        .string({
          required_error: "Title is required",
        })
        .min(5, {
          message: "Title must be at least 5 characters",
        })
        .max(50, {
          message: "Title must be less than 50 characters",
        }),
      description: z.string().max(500, {
        message: "Description must be less than 500 characters",
      }),
      weaponId: z.number({
        required_error: "You must select a weapon",
      }),
      attachmentIds: z
        .array(z.number())
        .min(0, {
          message: "You must select at least 1 attachment",
        })
        .max(5),
    });

    const formData = {
      userId: session.user?.id as string,
      title,
      description,
      weaponId: weapon?.id as number,
      attachmentIds: selectedAttachments.map((attachment) => attachment.id),
    };

    try {
      formSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log(error.flatten());
        setErrors(error.flatten().fieldErrors as FormErrors);
      }
      return;
    }

    if (existingBuild) {
      const updateData = {
        id: existingBuild.id as string,
        title,
        description,
        weaponId: weapon?.id as number,
        attachmentIds: selectedAttachments.map((attachment) => attachment.id),
      };
      updateBuild.mutate(updateData);
      return;
    }

    postBuild.mutate(formData);
  };

  return (
    <div>
      <Heading>{existingBuild ? "Edit Your Build" : "Submit A Build"}</Heading>
      <div className="flex flex-col gap-4">
        <div>
          <label>Title</label>
          <input
            type="text"
            value={title}
            placeholder="S1ck3st M4 LAZERBEAM"
            minLength={5}
            maxLength={100}
            onChange={(e) => setTitle(e.target.value)}
            className=""
          />
          {errors.title &&
            errors.title.map((error, index) => (
              <Alert
                key={`title-error-${index}`}
                status="error"
                message={error}
              />
            ))}
        </div>
        <div>
          <label>Description</label>
          <textarea
            value={description}
            placeholder=""
            minLength={5}
            maxLength={100}
            rows={4}
            onChange={(e) => setDescription(e.target.value)}
            className=""
          />
        </div>
        {!isLoadingWeapons && (
          <div>
            <label>Select a weapon</label>
            <GroupedDropdown
              selectedItem={weapon}
              setSelectedItem={handleWeaponChange}
              data={weaponsByCategory as WeaponsByCategory}
            />
            {errors.weaponId &&
              errors.weaponId.map((error, index) => (
                <Alert
                  key={`weapon-error-${index}`}
                  status="error"
                  message={error}
                />
              ))}
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
                            data={
                              attachmentsByCategory as AttachmentsByCategory
                            }
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
                {errors.attachmentIds &&
                  errors.attachmentIds.map((error, index) => (
                    <Alert
                      key={`attachments-error-${index}`}
                      status="error"
                      message={error}
                    />
                  ))}
              </div>
            </Panel>
          </div>
        )}
        <div>
          {isLoadingWeapons ||
          isLoadingAttachments ||
          postBuild.isLoading ||
          updateBuild.isLoading ||
          deleteBuild.isLoading ? (
            <Spinner />
          ) : !showDeleteAlert ? (
            <>
              <button className="w-full" onClick={submitBuild}>
                {existingBuild ? "Save Build" : "Submit Build"}
              </button>
              {existingBuild && (
                <>
                  <button
                    className="secondary w-full"
                    onClick={clickDeleteBuild}
                  >
                    Delete Build
                  </button>
                  <button className="tertiary w-full" onClick={cancelBuildEdit}>
                    Cancel
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <Alert
                status="error"
                message="Are you sure you want to delete this build? This process is not reversable."
              />
              <button onClick={clickDeleteBuildFinal}>Delete Build</button>
              <button className="secondary" onClick={clickDeleteCancel}>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
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
  const handleAttachmentChange = (selectedItem: Weapon | Attachment | null) => {
    setSelectedAttachments((current) => {
      const newAttachments = [...current];
      newAttachments[index] = selectedItem as Attachment;
      return newAttachments;
    });
  };

  return (
    <GroupedDropdown
      key={`attachment-dropdown-${index}`}
      data={data}
      selectedItem={selectedAttachments[index] || null}
      setSelectedItem={handleAttachmentChange}
      selectedAttachments={selectedAttachments}
    />
  );
};

export default BuildForm;
