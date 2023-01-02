import Footer from "./Footer";
import LoadingScreen from "./LoadingScreen";
import Navbar from "./Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LoadingScreen />
      <Navbar />
      <main>
        <div id="content">{children}</div>
      </main>
      <Footer />
    </>
  );
}
