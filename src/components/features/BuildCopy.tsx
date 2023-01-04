import { FaCopy, FaLink } from "react-icons/fa";

type Props = {
  buildId: string;
};

// Component to copy the build id to the clipboard
const BuildCopyButton = ({ buildId }: Props) => {
  const buildUrl = `https://killcam.gg/builds/${buildId}`;

  console.log("NEXTAUTH_URL", process.env.NEXTAUTH_URL);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(buildUrl);
  };

  // Input field with build ID and copy button
  return (
    <div className="flex flex-row items-center">
      <input
        className="flex-grow rounded-l-md rounded-r-none border border-gray-300"
        type="text"
        value={buildUrl}
        readOnly
      />
      <button className="tertiary" onClick={copyToClipboard}>
        <FaLink />
      </button>
    </div>
  );
};

export default BuildCopyButton;
