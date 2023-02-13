import { Disclosure, Transition } from "@headlessui/react";

type AccordionProps = {
  heading: string;
  children: React.ReactNode;
};
const Accordion = ({ heading, children }: AccordionProps) => {
  return (
    <Disclosure as="div" className="mb-4 border-b pb-4 ">
      <Disclosure.Button className=" text-xl transition-all hover:text-orange-500">
        <label className="cursor-pointer text-lg">{heading}</label>
      </Disclosure.Button>
      <Transition
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <Disclosure.Panel className="mt-4">{children}</Disclosure.Panel>
      </Transition>
    </Disclosure>
  );
};

export default Accordion;
