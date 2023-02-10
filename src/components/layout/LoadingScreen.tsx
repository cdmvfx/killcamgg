import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { Transition } from "@headlessui/react";
import Lottie from "lottie-react";
import LoadingAK47 from "../../../public/animations/loading-ak47.json";

const LoadingScreen = () => {
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const handleStart = (url: string) => {
      url !== router.asPath && setLoading(true);
    };
    const handleComplete = (url: string) => {
      url === router.asPath && setLoading(false);
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  });

  return (
    <Transition
      show={loading}
      enter="ease-in-out duration-100"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="ease-in-out duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed top-0 left-0 z-50 flex h-screen w-screen items-center justify-center bg-neutral-900">
        <div>
          <Lottie
            style={{ maxWidth: "18rem" }}
            animationData={LoadingAK47}
            loop={true}
          />
        </div>
      </div>
    </Transition>
  );
};

export default LoadingScreen;
