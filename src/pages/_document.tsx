import { Html, Head, Main, NextScript } from "next/document";
import { IoMdMenu } from "react-icons/io";

export default function Document() {
  return (
    <Html>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cutive+Mono&family=Jost:wght@200;400;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <nav>
          <div className="w-full bg-orange-600">
            <div className="flex h-full items-center justify-between">
              <div className="p-4">
                <span className="font-jost text-2xl font-bold tracking-widest text-white">
                  KILLCAM.GG
                </span>
              </div>
              <div className="p-4 text-2xl">
                <IoMdMenu />
              </div>
            </div>
          </div>
        </nav>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
