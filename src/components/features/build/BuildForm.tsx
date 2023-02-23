import { trpc } from "../../../utils/trpc";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { z } from "zod";
import type {
  Attachment,
  AttachmentCategory,
  Weapon,
  WeaponCategory,
} from "@prisma/client";
import Alert from "../../ui/Alert";
import Heading from "../../ui/Heading";
import type { AttachmentSetupWithAttachment } from "../../../types/Attachments";
import { useSession } from "next-auth/react";
import type { BuildGetOneResult } from "../../../types/Builds";
import { useRouter } from "next/router";
import Spinner from "../../ui/Spinner";
import { Listbox, Transition } from "@headlessui/react";
import { IoMdClose } from "react-icons/io";
import { FaArrowsAltH, FaArrowsAltV } from "react-icons/fa";
import Button from "../../ui/Button";
import { buildFormSchema } from "../../../lib/formSchemas";
import { TRPCClientError } from "@trpc/client";
import toast from "react-hot-toast";
import { Editor } from "@tinymce/tinymce-react";

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

  /** Queries and Mutations */

  const { data: weaponsByCategory, isLoading: isLoadingWeapons } =
    trpc.weapon.getAllByCategory.useQuery();

  const { data: attachmentsByCategory, isLoading: isLoadingAttachments } =
    trpc.attachment.getAllByCategory.useQuery();

  const postBuild = trpc.build.post.useMutation({
    onSuccess: (data) => {
      utils.build.getAll.invalidate();
      setSuccess(true);
      toast.success("Build submitted successfully!");
      router.push(`/builds/${data.id}`);
    },
    onError: (error) => {
      if (error instanceof TRPCClientError) {
        setErrors((prev) => ({
          ...prev,
          form: [error.message],
        }));
        return;
      }
      setErrors((prev) => ({
        ...prev,
        form: ["There was an error submitting your build."],
      }));
      return;
    },
  });

  const updateBuild = trpc.build.update.useMutation({
    onSuccess: () => {
      utils.build.getOne.invalidate({ id: existingBuild?.id as string });
      toast.success("Build updated successfully!");
      if (setShowBuildForm) setShowBuildForm(false);
    },
  });

  const deleteBuild = trpc.build.delete.useMutation({
    onSuccess: () => {
      router.push("/builds");
    },
  });

  /** States */

  const [title, setTitle] = useState(existingBuild?.title || "");
  const [description, setDescription] = useState(
    existingBuild?.description ||
      "<p>Give your build a guide! Include details like your playstyle, what you like about the build, why you chose certain attachments, etc.</p>"
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
    form: [],
  });

  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const [success, setSuccess] = useState(false);

  /** Functions */

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

    try {
      const formDataFinal = buildFormSchema.parse(formData);

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
        {!isLoadingWeapons && (
          <div>
            <div className="relative z-20 w-full">
              <Listbox value={selectedWeapon} onChange={setSelectedWeapon}>
                <Listbox.Label className="mb-2 flex items-center justify-between">
                  <div>Weapon</div>
                </Listbox.Label>
                <Listbox.Button
                  className={
                    "w-full rounded-lg border border-transparent bg-black bg-opacity-50 py-4 transition-all hover:border-orange-500"
                  }
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
                  className={`absolute z-10 max-h-64 w-full cursor-pointer overflow-y-scroll rounded-md shadow-xl`}
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
            <label className="mb-2">Select your attachments</label>
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
                          <Button
                            onClick={() => removeAttachment(index)}
                            classNames="text-xl p-2 transition-all hover:text-orange-500"
                            width="fit"
                            variant="plain"
                            text={<IoMdClose />}
                          />

                          <Listbox.Button
                            className={
                              "w-full rounded-lg border border-transparent bg-black bg-opacity-50 py-2 transition-all hover:border-orange-500"
                            }
                          >
                            {selectedAttachments[index]?.attachment ? (
                              <>
                                <label>
                                  {
                                    selectedAttachments[index]?.attachment
                                      ?.category
                                  }
                                </label>
                                <div>
                                  {selectedAttachments[index]?.attachment?.name}
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
                <Button
                  classNames="mx-auto"
                  variant="secondary"
                  text="Add attachment"
                  onClick={addAttachment}
                />
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
          <label>Guide</label>
          <Editor
            apiKey="d8niriv801opbhxnynq8zexo3xjm9f8zq48lfq2tnb3jtgry"
            value={description}
            onEditorChange={setDescription}
            init={{
              height: 500,
              menubar: false,
              toolbar_mode: "wrap",
              toolbar:
                "undo redo | formatselect | bold italic strikethrough backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | h1 h2 h3 | removeformat ",
              skin: "oxide-dark",
              content_css: "dark",
              content_style: `
							body {
								font-family: -apple-system, BlinkMacSystemFont, 'Inter', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
								line-height: 1.4;
								margin: 1rem;
								color: white;
								background-color: #222222;
							}
							`,
            }}
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
        <div>
          {isLoadingWeapons ||
          isLoadingAttachments ||
          postBuild.isLoading ||
          updateBuild.isLoading ||
          deleteBuild.isLoading ? (
            <Spinner />
          ) : !showDeleteAlert ? (
            <>
              {errors.form &&
                errors.form.map((error, index) => (
                  <Alert
                    key={`form-error-${index}`}
                    status="error"
                    className="mb-4"
                    message={error}
                  />
                ))}
              <Button
                text={existingBuild ? "Save Build" : "Submit Build"}
                onClick={submitBuild}
                width="full"
              />
              {existingBuild && (
                <>
                  <Button
                    variant="secondary"
                    width="full"
                    classNames="mt-2"
                    onClick={clickDeleteBuild}
                    text="Delete Build"
                  />
                  <Button
                    width="full"
                    classNames="mt-2"
                    text="Cancel"
                    variant="tertiary"
                    onClick={cancelBuildEdit}
                  />
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
              <Button
                text="Delete Build"
                variant="primary"
                onClick={clickDeleteBuildFinal}
              />

              <Button
                text="Cancel"
                variant="secondary"
                onClick={clickDeleteCancel}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuildForm;
