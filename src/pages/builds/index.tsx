import BuildsList from "../../components/features/BuildList";
import Heading from "../../components/ui/Heading";
import { useState } from "react";
import { Listbox } from "@headlessui/react";
import type { Weapon } from "@prisma/client";
import { trpc } from "../../utils/trpc";

const Builds = () => {
  const [selectedWeapons, setSelectedWeapons] = useState<Weapon[]>([]);

  const { data: weapons, isLoading: isLoadingWeapons } =
    trpc.weapon.getAll.useQuery();

  return (
    <main>
      <div className="py-4">
        <div className="px-4">
          <Heading>All Builds</Heading>
          {weapons && !isLoadingWeapons && (
            <BuildFilters
              weapons={weapons}
              selectedWeapons={selectedWeapons}
              setSelectedWeapons={setSelectedWeapons}
            />
          )}
          <BuildsList selectedWeapons={selectedWeapons} />
        </div>
      </div>
    </main>
  );
};

type BuildFiltersProps = {
  weapons: Weapon[];
  selectedWeapons: Weapon[];
  setSelectedWeapons: (weapons: Weapon[]) => void;
};

const BuildFilters = (props: BuildFiltersProps) => {
  const { weapons, selectedWeapons, setSelectedWeapons } = props;

  return (
    <div className="flex flex-col gap-2">
      <label className="mb-0">Filter by Weapon</label>
      <Listbox value={selectedWeapons} onChange={setSelectedWeapons} multiple>
        <Listbox.Button>
          {selectedWeapons.length === 0 ? "Filter weapons" : ""}
          {selectedWeapons.map((weapon) => weapon.name).join(", ")}
        </Listbox.Button>
        <Listbox.Options className={`rounded-md bg-black bg-opacity-50 p-4`}>
          {weapons.map((weapon) => (
            <Listbox.Option
              key={weapon.id}
              value={weapon}
              className={`mb-8 ${
                selectedWeapons.find(
                  (selectedWeapon) => selectedWeapon.id === weapon.id
                )
                  ? "text-orange-400"
                  : ""
              }`}
            >
              {weapon.name}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Listbox>
    </div>
  );
};

export default Builds;
