import { signIn } from "next-auth/react";
import { FaDiscord, FaTwitch, FaUser } from "react-icons/fa";

type Props = {
  platform: "discord" | "twitch";
};

const PlatformLogo = (props: Props) => {
  switch (props.platform) {
    case "discord":
      return <FaDiscord />;
    case "twitch":
      return <FaTwitch />;
    default:
      return <FaUser />;
  }
};

const SignInButton = (props: Props) => {
  const { platform } = props;

  let bgColor = "bg-gray-500";

  switch (platform) {
    case "discord":
      bgColor = "bg-[#7289da] hover:bg-[#8599de]";
      break;
    case "twitch":
      bgColor = "bg-[#6441a5] hover:bg-[#8265ba]";
      break;
  }

  return (
    <button
      className={`flex w-full items-center justify-center gap-2 rounded border-0 px-4 py-2 transition-all ${bgColor}`}
      onClick={() => signIn(platform)}
    >
      <PlatformLogo platform={platform} /> Login with{" "}
      {platform[0]?.toUpperCase() + platform.slice(1)}
    </button>
  );
};

export default SignInButton;
