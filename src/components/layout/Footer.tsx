import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-neutral-900 p-4 text-center">
      <div className="font-jost text-xl">Killcam v0.1</div>
      <div>
        Coded by{" "}
        <Link className="text-orange-600" href="https://twitter.com/cdmvfx">
          @cdm.vfx
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
