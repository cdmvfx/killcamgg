import BuildsList from "../../components/features/BuildList";
import Heading from "../../components/ui/Heading";

const Builds = () => {
  return (
    <main>
      <div className="py-4">
        <div className="px-4">
          <Heading>All Builds</Heading>
          [filters coming soon]
          <BuildsList />
        </div>
      </div>
    </main>
  );
};

export default Builds;
