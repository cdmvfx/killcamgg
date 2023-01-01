import { trpc } from "../../utils/trpc";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { z } from "zod";
import type {
  Attachment,
  AttachmentCategory,
  Weapon,
  WeaponCategory,
} from "@prisma/client";
import Alert from "../ui/Alert";
import Heading from "../ui/Heading";
import Panel from "../ui/Panel";
import type { AttachmentTuning } from "../../types/Attachments";
import { useSession } from "next-auth/react";
import type { BuildGetOneResult } from "../../types/Builds";
import { useRouter } from "next/router";
import Spinner from "../ui/Spinner";
import { Listbox, Transition } from "@headlessui/react";
import { IoMdClose } from "react-icons/io";
import { FaArrowsAltH, FaArrowsAltV } from "react-icons/fa";

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
      setSelectedWeapon(null);
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
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(
    existingBuild?.weapon || null
  );
  const [selectedAttachments, setSelectedAttachments] = useState<Attachment[]>(
    existingBuild?.attachments || []
  );
  const [numOfAttachments, setNumOfAttachments] = useState(
    existingBuild?.attachments.length || 1
  );

  const [attachmentTunings, setAttachmentTunings] = useState<
    AttachmentTuning[]
  >([
    {
      horizontal: "0",
      vertical: "0",
    },
  ]);

  const [openWeaponCategory, setOpenWeaponCategory] = useState<string | null>(
    null
  );

  const [openAttachmentCategory, setOpenAttachmentCategory] = useState<
    string | null
  >(null);

  const [errors, setErrors] = useState<FormErrors>({
    title: [],
    description: [],
    weaponId: [],
    attachmentIds: [],
  });

  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  // Functions
  const handleAttachmentChange = (attachment: Attachment, index: number) => {
    setSelectedAttachments((current) => {
      const newAttachments = [...current];
      newAttachments[index] = attachment;
      return newAttachments;
    });
  };

  const addAttachment = () => {
    if (numOfAttachments >= 5) return;
    setNumOfAttachments((current) => current + 1);
    setAttachmentTunings((current) => [
      ...current,
      { horizontal: "0", vertical: "0" },
    ]);
  };

  console.log("attachmentTunings", attachmentTunings);

  const removeAttachment = (index: number) => {
    console.log("Removing", index, selectedAttachments[index]);
    setSelectedAttachments((current) => current.filter((_, i) => i !== index));
    setNumOfAttachments((current) => current - 1);
    setAttachmentTunings((current) => current.filter((_, i) => i !== index));
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
    setSelectedWeapon(existingBuild?.weapon || null);
    setSelectedAttachments(existingBuild?.attachments || []);
  };

  const handleAttachmentTuningChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    direction: "vertical" | "horizontal"
  ) => {
    setAttachmentTunings((current) => {
      const newTunings = [...current];

      (newTunings[index] as AttachmentTuning)[direction] =
        e.target.value || "0";

      return newTunings;
    });
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
      weaponId: selectedWeapon?.id as number,
      attachmentIds: selectedAttachments.map((attachment) => attachment.id),
    };

    console.log(formData);

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
        weaponId: selectedWeapon?.id as number,
        attachmentIds: selectedAttachments.map((attachment) => attachment.id),
      };
      updateBuild.mutate(updateData);
      return;
    }

    postBuild.mutate(formData);
  };

  if (
    isLoadingWeapons ||
    isLoadingAttachments ||
    !weaponsByCategory ||
    !attachmentsByCategory
  )
    return <Spinner />;

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
            <div className="relative w-full">
              <Listbox value={selectedWeapon} onChange={setSelectedWeapon}>
                <Listbox.Label className="mb-2 flex items-center justify-between">
                  <div>Weapon</div>
                </Listbox.Label>
                <Listbox.Button
                  className={"mb-4 w-full bg-black bg-opacity-50"}
                >
                  {selectedWeapon ? selectedWeapon.name : "Select a weapon"}
                </Listbox.Button>
                <Transition
                  enter="transform transition duration-150 ease-in-out"
                  enterFrom="scale-0 opacity-0"
                  enterTo="scale-100 opacity-100"
                  leave="transform transition duration-150 ease-in-out"
                  leaveFrom="scale-100 opacity-100"
                  leaveTo="scale-0 opacity-0"
                  className={`absolute top-[70px] z-10 max-h-64 w-full cursor-pointer overflow-y-scroll rounded-md shadow-xl`}
                >
                  <Listbox.Options className={`w-full bg-neutral-800`}>
                    {Object.keys(weaponsByCategory).map((category) => (
                      <div key={`weapon-filter-category-${category}`}>
                        <div
                          className={`border-l-orange-400 p-4 transition-all hover:text-orange-400 ${
                            openWeaponCategory === category
                              ? "border-l-4 text-orange-400"
                              : ""
                          }`}
                          onClick={() =>
                            setOpenWeaponCategory((state) =>
                              state === category ? null : category
                            )
                          }
                        >
                          {category}
                        </div>
                        {openWeaponCategory === category && (
                          <div>
                            {weaponsByCategory[category as WeaponCategory].map(
                              (weapon) => (
                                <Listbox.Option key={weapon.id} value={weapon}>
                                  {({ selected }) => (
                                    <li
                                      className={`border-l-orange-400 py-4 px-8 transition-all hover:text-orange-400 ${
                                        selected
                                          ? "border-l-4 text-orange-400"
                                          : ""
                                      }`}
                                    >
                                      {weapon.name}
                                    </li>
                                  )}
                                </Listbox.Option>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </Listbox.Options>
                </Transition>
              </Listbox>
            </div>
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
                        <div className="relative mb-4 w-full">
                          <Listbox
                            value={selectedAttachments[index]}
                            onChange={(attachment) =>
                              handleAttachmentChange(attachment, index)
                            }
                          >
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => removeAttachment(index)}
                                className="tertiary mb-0 w-fit p-0 text-2xl"
                              >
                                <IoMdClose />
                              </button>
                              <Listbox.Button className={"mb-0 w-full"}>
                                {selectedAttachments[index] ? (
                                  <>
                                    <label>
                                      {selectedAttachments[index]?.category}
                                    </label>
                                    <div>
                                      {selectedAttachments[index]?.name}
                                    </div>
                                  </>
                                ) : (
                                  "Select an attachment"
                                )}
                              </Listbox.Button>
                              <div className="flex flex-col gap-y-1 gap-x-4 lg:flex-row">
                                <div className="flex items-center gap-2">
                                  <FaArrowsAltH />
                                  <input
                                    type="text"
                                    value={attachmentTunings[index]?.horizontal}
                                    onChange={(e) =>
                                      handleAttachmentTuningChange(
                                        e,
                                        index,
                                        "horizontal"
                                      )
                                    }
                                    className="appearance-[textfield] m-0 h-full w-16"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <FaArrowsAltV />
                                  <input
                                    type="text"
                                    value={attachmentTunings[index]?.vertical}
                                    onChange={(e) =>
                                      handleAttachmentTuningChange(
                                        e,
                                        index,
                                        "vertical"
                                      )
                                    }
                                    className="h-full w-16"
                                  />
                                </div>
                              </div>
                            </div>
                            <Transition
                              enter="transform transition duration-150 ease-in-out"
                              enterFrom="scale-0 opacity-0"
                              enterTo="scale-100 opacity-100"
                              leave="transform transition duration-150 ease-in-out"
                              leaveFrom="scale-100 opacity-100"
                              leaveTo="scale-0 opacity-0"
                              className={`absolute top-[42px] z-10 max-h-64 w-full cursor-pointer overflow-y-scroll rounded-md shadow-xl`}
                            >
                              <Listbox.Options
                                className={`w-full bg-neutral-800`}
                              >
                                {Object.keys(attachmentsByCategory).map(
                                  (category) =>
                                    selectedAttachments.some(
                                      (attachment) =>
                                        attachment.category === category &&
                                        selectedAttachments[index]?.category !==
                                          category
                                    ) ? (
                                      <></>
                                    ) : (
                                      <div
                                        key={`weapon-filter-category-${category}`}
                                      >
                                        <div
                                          className={`border-l-orange-400 p-4 transition-all hover:text-orange-400 ${
                                            openAttachmentCategory === category
                                              ? "border-l-4 text-orange-400"
                                              : ""
                                          }`}
                                          onClick={() =>
                                            setOpenAttachmentCategory((state) =>
                                              state === category
                                                ? null
                                                : category
                                            )
                                          }
                                        >
                                          {category}
                                        </div>
                                        {openAttachmentCategory ===
                                          category && (
                                          <div>
                                            {attachmentsByCategory[
                                              category as AttachmentCategory
                                            ].map((attachment) => (
                                              <Listbox.Option
                                                key={attachment.id}
                                                value={attachment}
                                              >
                                                {({ selected }) => (
                                                  <li
                                                    className={`border-l-orange-400 py-4 px-8 transition-all ${
                                                      selected
                                                        ? "border-l-4 text-orange-400"
                                                        : ""
                                                    }`}
                                                  >
                                                    {attachment.name}
                                                  </li>
                                                )}
                                              </Listbox.Option>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )
                                )}
                              </Listbox.Options>
                            </Transition>
                          </Listbox>
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

export default BuildForm;
