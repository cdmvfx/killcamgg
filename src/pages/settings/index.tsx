import { TRPCClientError } from "@trpc/client";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import Image from "next/image";
import { useState } from "react";
import { z } from "zod";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Heading from "../../components/ui/Heading";
import Panel from "../../components/ui/Panel";
import Spinner from "../../components/ui/Spinner";
import Toast from "../../components/ui/Toast";
import { settingsFormSchema } from "../../lib/formSchemas";
import { getServerAuthSession } from "../../server/common/get-server-auth-session";
import { createContextServerSideProps } from "../../server/trpc/context";
import { appRouter } from "../../server/trpc/router/_app";
import getBase64 from "../../utils/getBase64";
import { trpc } from "../../utils/trpc";

type PageProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const SettingsPage: NextPage<PageProps> = (props) => {
  const { settings } = props;

  const [toast, setToast] = useState({
    message: "",
    status: "success" as "success" | "error" | "warning" | "info",
    isVisible: false,
    setIsVisible: (isVisible: boolean) =>
      setToast((prev) => ({ ...prev, isVisible })),
  });

  const [username, setUsername] = useState(settings.name);
  const [displayName, setDisplayName] = useState(settings.displayName);
  const [image, setImage] = useState(settings.image);
  const [socials, setSocials] = useState({
    twitter: settings.socials?.twitter || "",
    twitch: settings.socials?.twitch || "",
    discord: settings.socials?.discord || "",
    youtube: settings.socials?.youtube || "",
    instagram: settings.socials?.instagram || "",
    tiktok: settings.socials?.tiktok || "",
  });

  type SettingsErrors = {
    username: string[] | null;
    displayName: string[] | null;
    image: string[] | null;
    socials: string[] | null;
  };

  const [errors, setErrors] = useState<SettingsErrors>({
    username: null,
    displayName: null,
    image: null,
    socials: null,
  });

  const [showChangePhoto, setShowChangePhoto] = useState(false);

  const { mutate: updateSettings, isLoading: isLoadingSettingsUpdate } =
    trpc.settings.saveSettings.useMutation({
      onSuccess: (data) => {
        console.log("Saved", data);
        setToast((prev) => ({
          ...prev,
          message: "Settings saved successfully.",
          status: "success",
          isVisible: true,
        }));
      },
      onError: (error) => {
        if (error instanceof TRPCClientError) {
          console.log(error.message);
          if (
            error.message === "User with that name already exists" ||
            error.message === "Invalid username"
          ) {
            setErrors((prev) => ({
              ...prev,
              username: [error.message],
            }));
            return;
          }
          setToast((prev) => ({
            ...prev,
            message: error.message,
            status: "error",
            isVisible: true,
          }));
          return;
        }
        setToast((prev) => ({
          ...prev,
          message: "Failed to save settings.",
          status: "error",
          isVisible: true,
        }));
      },
    });

  const handleSocialChange = (platform: string, username: string) => {
    setSocials((prev) => {
      return { ...prev, [platform]: username };
    });
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (!file) return;

    getBase64(file, (result) => {
      if (!result) {
        setToast((prev) => ({
          ...prev,
          message: "Failed to encode image.",
          status: "error",
          isVisible: true,
        }));
      }
      setImage(result as string);
    });
    return;
  };

  const cancelImageUpload = () => {
    setShowChangePhoto(false);
    setImage(settings.image);
  };

  const handleSave = () => {
    setErrors({
      username: null,
      displayName: null,
      image: null,
      socials: null,
    });
    try {
      const newSettings = settingsFormSchema.parse({
        username,
        displayName,
        image: settings.image === image ? undefined : image,
        socials,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(error.flatten().fieldErrors as SettingsErrors);
      }
      return;
    }

    updateSettings({
      username,
      displayName,
      image: settings.image === image ? undefined : image,
      socials,
    });
  };

  const socialInputs = [
    {
      platform: "twitter",
      label: "twitter.com/",
    },
    {
      platform: "twitch",
      label: "twitch.tv/",
    },
    {
      platform: "discord",
      label: "Discord Username",
    },
    {
      platform: "youtube",
      label: "youtube.com/",
    },
    {
      platform: "instagram",
      label: "instagram.com/",
    },
    {
      platform: "tiktok",
      label: "tiktok.com/@",
    },
  ] as const;

  return (
    <div className="p-4">
      <Toast {...toast} />
      <Heading>Settings</Heading>
      <Panel className="flex flex-col gap-8">
        <div className="flex flex-wrap border-b border-b-black pb-8 md:flex-nowrap">
          <div className="mb-2 w-56">
            <label>Username</label>
          </div>
          <div>
            <input
              type="text"
              value={username}
              className="mb-2 w-auto"
              onChange={(e) => setUsername(e.target.value)}
            />
            <div className="text-sm text-neutral-300">
              You may change your username as often as you want. This will be
              the URL of your profile. Example: killcam.gg/{settings.name}
            </div>
            {errors.username && errors.username[0] && (
              <Alert
                className="mt-2"
                status="error"
                message={errors.username[0]}
              />
            )}
          </div>
        </div>
        <div className="flex flex-wrap border-b border-b-black pb-8 md:flex-nowrap">
          <div className="mb-2 w-56">
            <label>Display Name</label>
          </div>
          <div>
            <input
              type="text"
              value={displayName}
              className="mb-2 w-auto"
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <div className="text-sm text-neutral-300">
              This is the name that will appear publicly on your profile,
              builds, and reviews.
            </div>
            {errors.displayName && errors.displayName[0] && (
              <Alert
                className="mt-2"
                status="error"
                message={errors.displayName[0]}
              />
            )}
          </div>
        </div>
        <div className="flex flex-wrap border-b border-b-black pb-8 md:flex-nowrap">
          <div className="mb-2 w-56">
            <label>Profile Picture</label>
          </div>
          <div className="flex items-center gap-4">
            <Image
              src={image}
              width={80}
              height={80}
              className="flex-shrink-0 rounded-full object-contain"
              alt="Your profile photo"
            />
            {showChangePhoto ? (
              <>
                <input
                  type="file"
                  onChange={handleImageFileChange}
                  className="w-auto"
                />
                <Button
                  variant="tertiary"
                  text="Cancel"
                  onClick={cancelImageUpload}
                />
              </>
            ) : (
              <div>
                <Button
                  text="Update Profile Picture"
                  variant="primary"
                  classNames="mb-2"
                  onClick={() => setShowChangePhoto(true)}
                />
                <div className="text-sm text-neutral-300">
                  Must be a PNG, JPG, or GIF and cannot exceed 2MB.
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap md:flex-nowrap">
          <div className="mb-2 w-56 flex-shrink-0">
            <label>Socials</label>
          </div>
          <div>
            <div className="mb-4 flex flex-wrap gap-4">
              {socialInputs.map((social) => {
                return (
                  <div key={social.platform}>
                    <label>{social.label}</label>
                    <input
                      type="text"
                      className="w-auto"
                      value={socials[social.platform]}
                      onChange={(e) =>
                        handleSocialChange(social.platform, e.target.value)
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          {isLoadingSettingsUpdate ? (
            <Spinner />
          ) : (
            <Button text="Save Settings" onClick={handleSave} />
          )}
        </div>
      </Panel>
    </div>
  );
};
export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(ctx);

  if (!session) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  const trpcContext = await createContextServerSideProps(ctx);

  const caller = appRouter.createCaller(trpcContext);

  const settings = await caller.settings.getSettings();

  if (!settings) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  return { props: { settings } };
};

export default SettingsPage;
