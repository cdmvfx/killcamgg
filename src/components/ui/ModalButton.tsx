import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

type Props = {
  openButton?: React.ReactNode;
  show: boolean;
  children: React.ReactNode;
  onClose: () => void;
};

const ModalButton = (props: Props) => {
  const { openButton, onClose, show, children } = props;

  return (
    <>
      {openButton}
      <Transition appear show={show} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center overflow-y-auto">
            <div className="flex items-center justify-center md:p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="min-h-full w-full max-w-lg transform overflow-hidden bg-[#274b48] p-4 text-left align-middle shadow-xl transition-all md:rounded-2xl">
                  {children}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default ModalButton;
