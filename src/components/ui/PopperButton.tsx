import { Popover, Transition } from "@headlessui/react";
import React, { useState, useEffect } from "react";
import { usePopper } from "react-popper";

type Props = {
  button: React.ReactNode;
  tooltip: React.ReactNode;
  onClick?: () => void;
  showOn: "hover" | "click" | "hovermenu";
  buttonClass?: string;
};

const PopperButton = (props: Props) => {
  const { button, tooltip, onClick, showOn, buttonClass } = props;

  const [referenceElement, setReferenceElement] = useState<HTMLButtonElement>();
  const [popperElement, setPopperElement] = useState<HTMLDivElement>();
  const [arrowElement, setArrowElement] = useState<HTMLDivElement>();
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "bottom",
    modifiers: [
      { name: "offset", options: { offset: [0, 10] } },
      { name: "arrow", options: { element: arrowElement, padding: 5 } },
    ],
  });

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [isMouseOver, setIsMouseOver] = useState(false);

  useEffect(() => {
    if (showOn === "hovermenu" && !isMouseOver) {
      const closeTooltip = setTimeout(() => {
        setTooltipOpen(false);
      }, 200);

      return () => clearTimeout(closeTooltip);
    }
  }, [isMouseOver, showOn]);

  return (
    <Popover
      className="relative inline-block"
      onMouseEnter={() => {
        setIsMouseOver(true);
      }}
      onMouseLeave={() => {
        setIsMouseOver(false);
      }}
    >
      {() => (
        <>
          <Popover.Button
            ref={setReferenceElement as React.LegacyRef<HTMLButtonElement>}
            onMouseEnter={() => {
              if (showOn === "hover" || showOn === "hovermenu")
                setTooltipOpen(true);
            }}
            onMouseLeave={() => {
              if (showOn === "hover") setTooltipOpen(false);
            }}
            onClick={() => {
              if (showOn === "click") setTooltipOpen((prev) => !prev);
              if (onClick) onClick();
            }}
            className={`transition-all ${buttonClass}`}
          >
            {button}
          </Popover.Button>
          <Transition
            show={tooltipOpen}
            enter="ease-in-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            className=""
          >
            <Popover.Panel
              static
              className="absolute z-10 "
              ref={setPopperElement as React.LegacyRef<HTMLDivElement>}
              style={styles.popper}
              {...attributes.popper}
            >
              <div
                ref={setArrowElement as React.LegacyRef<HTMLDivElement>}
                style={{
                  ...styles.arrow,
                  clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                }}
                className="-top-[10px] -z-10 h-[10px] w-[20px] bg-neutral-900 before:visible before:rotate-45"
              />
              <div className="m-auto min-w-max rounded-lg bg-neutral-900 p-4">
                {tooltip}
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

export default PopperButton;
