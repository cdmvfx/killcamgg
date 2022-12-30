import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { IoMdClose } from "react-icons/io";

type DrawerProps = {
  open: boolean;
  setOpen: (state: boolean) => void;
  title: string;
  children: React.ReactNode;
  flipped?: boolean;
};

const Drawer = (props: DrawerProps) => {
  const { open, setOpen, title, children, flipped = true } = props;

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        static
        open={open}
        className="relative z-10"
        onClose={setOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className={`pointer-events-none fixed inset-y-0 flex max-w-full ${
                flipped ? "left-0 pr-10" : "right-0 pl-10"
              }`}
            >
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom={flipped ? "-translate-x-full" : "translate-x-full"}
                enterTo={flipped ? "translate-x-0" : "translate-x-0"}
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom={flipped ? "translate-x-0" : "translate-x-0"}
                leaveTo={flipped ? "-translate-x-full" : "translate-x-full"}
              >
                <Dialog.Panel className="pointer-events-auto relative w-screen max-w-md">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div
                      className={`absolute top-0 flex pt-4 pr-2 sm:-ml-10 sm:pr-4 ${
                        flipped
                          ? "right-0 -mr-8 pl-2 sm:-mr-10 sm:pl-4"
                          : "left-0 -ml-8 pr-2 sm:-ml-10 sm:pr-4"
                      }`}
                    >
                      <button
                        type="button"
                        className="tertiary m-0 rounded-md p-0 text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                        onClick={() => setOpen(false)}
                      >
                        <span className="sr-only">Close panel</span>
                        <IoMdClose className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="flex h-full flex-col overflow-hidden bg-neutral-800 py-6 shadow-xl">
                    <div className="px-4 sm:px-6">
                      <Dialog.Title className="text-xl font-medium">
                        {title}
                      </Dialog.Title>
                    </div>
                    <div className="relative mt-6 flex-1 px-4 sm:px-6">
                      {children}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default Drawer;
