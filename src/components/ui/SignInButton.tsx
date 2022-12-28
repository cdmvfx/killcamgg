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
      bgColor = "bg-[#7289da]";
      break;
    case "twitch":
      bgColor = "bg-[#6441a5]";
      break;
  }

  return (
    <button
      className={`mb-2 flex items-center justify-center gap-2 border-0 ${bgColor}`}
      onClick={() => signIn(platform)}
    >
      <PlatformLogo platform={platform} /> Login with{" "}
      {platform[0]?.toUpperCase() + platform.slice(1)}
    </button>
  );
};

export default SignInButton;
