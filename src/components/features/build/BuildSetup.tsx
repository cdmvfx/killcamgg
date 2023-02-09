import { FaArrowsAltH, FaArrowsAltV } from "react-icons/fa";
import type { BuildGetOneResult } from "../../../types/Builds";
import PopperButton from "../../ui/PopperButton";

type Props = {
  build: NonNullable<BuildGetOneResult>;
};

const BuildSetup = (props: Props) => {
  const { build } = props;

  return (
    <div className="basis-full md:basis-auto">
      <div className="mb-4 md:text-center">
        <label>{build.weapon.category}</label>
        <div className="mb-4 text-2xl">
          <PopperButton
            buttonClass="hover:text-orange-600 text-left"
            button={build.weapon.name}
            showOn="hover"
            tooltip={build.weapon.unlock_req || "No unlock requirements"}
          />
        </div>
        {/* <div className="relative m-auto h-24 w-full">
          <Image
            src="/images/kastov-762.webp"
            className="max-w-md object-contain"
            fill
            alt=""
          />
        </div> */}
      </div>
      <div className="flex w-full flex-col justify-center gap-8 md:items-center">
        {build.attachmentSetups.map((attachmentSetup, index) => {
          return (
            <div
              key={index}
              className="grid w-full  grid-cols-[3rem,auto,5rem] items-center gap-2"
            >
              <div
                className="h-10 w-10 bg-orange-600"
                style={{
                  clipPath: "polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%)",
                }}
              ></div>
              <div className="flex max-w-sm flex-col">
                <label>{attachmentSetup.attachment.category}</label>
                <div className="block">
                  <PopperButton
                    buttonClass="hover:text-orange-600 text-left"
                    button={attachmentSetup.attachment.name}
                    showOn="hover"
                    tooltip={attachmentSetup.attachment.unlock_req}
                  />
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 ">
                <div className="flex items-center gap-2">
                  <FaArrowsAltH />
                  {parseFloat(attachmentSetup.horizontal).toFixed(2)}
                </div>
                <div className="flex items-center gap-2">
                  <FaArrowsAltV />
                  {parseFloat(attachmentSetup.vertical).toFixed(2)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BuildSetup;
