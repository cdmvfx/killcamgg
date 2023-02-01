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
import type { AttachmentSetupWithAttachment } from "../../types/Attachments";
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
      setSelectedAttachments([
        {
          attachment: null,
          horizontal: "0",
          vertical: "0",
        },
      ]);
      setNumOfAttachments(1);
      setSuccess(true);
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
  const [selectedAttachments, setSelectedAttachments] = useState<
    AttachmentSetupWithAttachment[]
  >(
    existingBuild?.attachmentSetups || [
      {
        attachment: null,
        horizontal: "0",
        vertical: "0",
      },
    ]
  );
  const [numOfAttachments, setNumOfAttachments] = useState(
    existingBuild?.attachmentSetups.length || 1
  );

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
    attachmentSetups: [],
  });

  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const [success, setSuccess] = useState(false);

  const addAttachment = () => {
    if (numOfAttachments >= 5) return;
    setNumOfAttachments((current) => current + 1);
    setSelectedAttachments((current) => [
      ...current,
      {
        attachment: null,
        horizontal: "0",
        vertical: "0",
      },
    ]);
  };

  const removeAttachment = (index: number) => {
    console.log("Removing", index, selectedAttachments[index]);
    setSelectedAttachments((current) => current.filter((_, i) => i !== index));
    setNumOfAttachments((current) => current - 1);
  };

  const clickDeleteBuild = () => {
    setErrors({});
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
    setSelectedAttachments(existingBuild?.attachmentSetups || []);
  };

  const handleAttachmentChange = (attachment: Attachment, index: number) => {
    setSelectedAttachments((current) => {
      const newAttachments = [...current];
      newAttachments[index] = {
        attachment: attachment,
        horizontal: "0",
        vertical: "0",
      };
      return newAttachments;
    });
  };

  const handleTuningChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    direction: "vertical" | "horizontal"
  ) => {
    setSelectedAttachments((current) => {
      const newAttachments = [...current];

      (newAttachments[index] as AttachmentSetupWithAttachment)[direction] =
        e.target.value || "0";

      return newAttachments;
    });
  };

  const submitBuild = () => {
    setErrors({});

    if (!session) return;

    const formData = {
      userId: session.user?.id as string,
      title,
      description,
      weaponId: selectedWeapon?.id as number,
      attachmentSetups: selectedAttachments.map((attachmentSetup) => ({
        attachmentId: attachmentSetup.attachment?.id,
        horizontal: attachmentSetup.horizontal,
        vertical: attachmentSetup.vertical,
      })),
    };

    console.log(formData);

    const formSchema = z.object({
      title: z
        .string({
          required_error: "Title is required.",
        })
        .min(5, {
          message: "Title must be at least 5 characters.",
        })
        .max(50, {
          message: "Title must be less than 50 characters.",
        }),
      description: z
        .string()
        .min(50, {
          message: "Description must be at least 50 characters.",
        })
        .max(500, {
          message: "Description must be less than 500 characters.",
        }),
      weaponId: z.number({
        required_error: "You must select a weapon.",
      }),
      attachmentSetups: z
        .array(
          z.object({
            attachmentId: z.number({
              required_error: "You must select an attachment.",
            }),
            horizontal: z.string(),
            vertical: z.string(),
          })
        )
        .min(1, {
          message: "You must select at least one attachment.",
        })
        .max(5, {
          message: "You can only select up to 5 attachments.",
        }),
    });

    try {
      const formDataFinal = formSchema.parse(formData);
      console.log("Final form data", formDataFinal);

      if (existingBuild) {
        const updateData = {
          ...formDataFinal,
          id: existingBuild.id as string,
        };
        updateBuild.mutate(updateData);
        return;
      }

      postBuild.mutate(formDataFinal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log(error.flatten());
        setErrors(error.flatten().fieldErrors as FormErrors);
      }
      return;
    }
  };

  if (
    isLoadingWeapons ||
    isLoadingAttachments ||
    !weaponsByCategory ||
    !attachmentsByCategory
  ) {
    return <Spinner />;
  }

  if (success) {
    return (
      <Alert
        status="success"
        message={existingBuild ? "Build updated!" : "Build submitted!"}
      />
    );
  }

  return (
    <div>
      <Heading>{existingBuild ? "Edit Your Build" : "Submit A Build"}</Heading>
      <div className="flex flex-col gap-4">
        <div>
          <label>Title</label>
          <input
            type="text"
            value={title}
            placeholder="Name your build!"
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
                className="mt-2"
              />
            ))}
        </div>
        <div>
          <label>Description</label>
          <textarea
            value={description}
            placeholder="Give your build a description! Include details like your playstyle, what you like about the build, why you chose certain attachments, etc."
            minLength={5}
            maxLength={100}
            rows={4}
            onChange={(e) => setDescription(e.target.value)}
            className=""
          />
          {errors.description &&
            errors.description.map((error, index) => (
              <Alert
                key={`description-error-${index}`}
                status="error"
                message={error}
                className="mt-2"
              />
            ))}
        </div>
        {!isLoadingWeapons && (
          <div>
            <div className="relative z-20 w-full">
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
              <>
                {Array.from(Array(numOfAttachments).keys()).map(
                  (attachmentNum, index) => {
                    return (
                      <div
                        key={`attachment-${attachmentNum}`}
                        className="relative mb-4 w-full"
                      >
                        <Listbox
                          value={selectedAttachments[index]?.attachment}
                          onChange={(attachment) =>
                            handleAttachmentChange(
                              attachment as Attachment,
                              index
                            )
                          }
                        >
                          <div className="relative flex items-center gap-4">
                            <button
                              onClick={() => removeAttachment(index)}
                              className="tertiary mb-0 w-fit p-0 text-2xl"
                            >
                              <IoMdClose />
                            </button>
                            <Listbox.Button className={"mb-0 w-full"}>
                              {selectedAttachments[index]?.attachment ? (
                                <>
                                  <label>
                                    {
                                      selectedAttachments[index]?.attachment
                                        ?.category
                                    }
                                  </label>
                                  <div>
                                    {
                                      selectedAttachments[index]?.attachment
                                        ?.name
                                    }
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
                                  value={selectedAttachments[index]?.horizontal}
                                  onChange={(e) =>
                                    handleTuningChange(e, index, "horizontal")
                                  }
                                  className="appearance-[textfield] m-0 h-full w-16"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <FaArrowsAltV />
                                <input
                                  type="text"
                                  value={selectedAttachments[index]?.vertical}
                                  onChange={(e) =>
                                    handleTuningChange(e, index, "vertical")
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
                            className={`absolute top-[42px] z-50 max-h-64 w-full cursor-pointer overflow-y-scroll rounded-md shadow-xl`}
                          >
                            <Listbox.Options
                              className={`w-full bg-neutral-800  pb-24`}
                            >
                              {Object.keys(attachmentsByCategory).map(
                                (category) =>
                                  selectedAttachments.some(
                                    (attachmentSetup) =>
                                      attachmentSetup.attachment &&
                                      attachmentSetup.attachment.category ===
                                        category &&
                                      selectedAttachments[index]?.attachment
                                        ?.category !== category
                                  ) ? (
                                    ""
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
                                            state === category ? null : category
                                          )
                                        }
                                      >
                                        {category}
                                      </div>
                                      {openAttachmentCategory === category && (
                                        <div>
                                          {attachmentsByCategory[
                                            category as AttachmentCategory
                                          ].map((attachment) => (
                                            <Listbox.Option
                                              key={`attachment-${index}-${attachment.id}`}
                                              value={attachment}
                                            >
                                              {({ selected }) => (
                                                <li
                                                  className={`border-l-orange-400 py-4 px-8 transition-all hover:text-orange-400 ${
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
              </>
            </Panel>
            {errors.attachmentSetups &&
              errors.attachmentSetups.map((error, index) => (
                <Alert
                  key={`attachmentSetups-error-${index}`}
                  status="error"
                  message={error}
                  className="mt-2"
                />
              ))}
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
                className="mb-2"
              />
              <button className="w-full" onClick={clickDeleteBuildFinal}>
                Delete Build
              </button>
              <button className="secondary w-full" onClick={clickDeleteCancel}>
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
