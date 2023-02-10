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
      </main>
      <Footer />
    </>
  );
}
