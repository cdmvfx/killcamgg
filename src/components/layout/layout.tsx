import { Transition } from "@headlessui/react";
import { Toaster, ToastIcon, resolveValue } from "react-hot-toast";
import Footer from "./Footer";
import LoadingScreen from "./LoadingScreen";
import Navbar from "./Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>
        {/* <LoadingScreen /> */}
        <div id="content">{children}</div>
        <Toaster>
          {(t) => {
            return (
              <Transition
                appear
                show={t.visible}
                className={`flex transform rounded bg-neutral-800 p-4 shadow-lg`}
                enter="transition-all duration-150"
                enterFrom="opacity-0 scale-50"
                enterTo="opacity-100 scale-100"
                leave="transition-all duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-75"
              >
                <ToastIcon toast={t} />
                <span className="ml-4">{resolveValue(t.message, t)}</span>
              </Transition>
            );
          }}
        </Toaster>
      </main>
      <Footer />
    </>
  );
}
