import BuildsList from "../../components/features/BuildList";
import { useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import type {
  Attachment,
  AttachmentCategory,
  Weapon,
  WeaponCategory,
} from "@prisma/client";
import { trpc } from "../../utils/trpc";
import Spinner from "../../components/ui/Spinner";
import type { WeaponsByCategory } from "../../types/Weapons";
import type { AttachmentsByCategory } from "../../types/Attachments";
import type { SortOption } from "../../types/Filters";
import sortOptions from "../../lib/sortOptions";

const Builds = () => {
  const [selectedWeapons, setSelectedWeapons] = useState<Weapon[]>([]);
  const [selectedAttachments, setSelectedAttachments] = useState<Attachment[]>(
    []
  );
  const [sortBy, setSortBy] = useState<SortOption>({
    name: "Newest",
    value: "newest",
  });

  const { data: weaponsByCategory, isLoading: isLoadingWeapons } =
    trpc.weapon.getAllByCategory.useQuery();

  const { data: attachmentsByCategory, isLoading: isLoadingAttachments } =
    trpc.attachment.getAllByCategory.useQuery();

  return (
    <div className="py-4">
      <div className="px-4">
        <h1 className="mb-4">Browse All Builds</h1>
        {weaponsByCategory &&
        !isLoadingWeapons &&
        attachmentsByCategory &&
        !isLoadingAttachments ? (
          <BuildFilters
            weaponsByCategory={weaponsByCategory}
            selectedWeapons={selectedWeapons}
            setSelectedWeapons={setSelectedWeapons}
            attachmentsByCategory={attachmentsByCategory}
            selectedAttachments={selectedAttachments}
            setSelectedAttachments={setSelectedAttachments}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        ) : (
          <Spinner />
        )}
        <BuildsList
          selectedWeapons={selectedWeapons}
          selectedAttachments={selectedAttachments}
          sortBy={sortBy}
        />
      </div>
    </div>
  );
};

type BuildFiltersProps = {
  weaponsByCategory: WeaponsByCategory;
  selectedWeapons: Weapon[];
  setSelectedWeapons: (weapons: Weapon[]) => void;
  attachmentsByCategory: AttachmentsByCategory;
  selectedAttachments: Attachment[];
  setSelectedAttachments: (attachments: Attachment[]) => void;
  sortBy: SortOption;
  setSortBy: (sortBy: SortOption) => void;
};

const BuildFilters = (props: BuildFiltersProps) => {
  const {
    weaponsByCategory,
    selectedWeapons,
    setSelectedWeapons,
    attachmentsByCategory,
    selectedAttachments,
    setSelectedAttachments,
    sortBy,
    setSortBy,
  } = props;

  const [openWeaponCategory, setOpenWeaponCategory] = useState<string | null>(
    null
  );

  const [openAttachmentCategory, setOpenAttachmentCategory] = useState<
    string | null
  >(null);

  return (
    <div className="mb-4 flex flex-col gap-4 md:flex-row md:gap-8">
      <div className="relative md:w-64">
        <Listbox value={selectedWeapons} onChange={setSelectedWeapons} multiple>
          <Listbox.Label className="mb-2 flex items-center justify-between">
            <div>Filter by weapons</div>
            <button
              className="tertiary m-0 w-fit p-0"
              onClick={() => setSelectedWeapons([])}
            >
              Clear
            </button>
          </Listbox.Label>
          <Listbox.Button className={"mb-4"}>
            {selectedWeapons.length === 0 ? "Any Weapons" : ""}
            {selectedWeapons.map((weapon) => weapon.name).join(", ")}
          </Listbox.Button>
          <Transition
            enter="transform transition duration-150 ease-in-out"
            enterFrom="scale-0 opacity-0"
            enterTo="scale-100 opacity-100"
            leave="transform transition duration-150 ease-in-out"
            leaveFrom="scale-100 opacity-100"
            leaveTo="scale-0 opacity-0"
            className={`absolute top-20 z-10 max-h-64 w-full cursor-pointer overflow-y-scroll rounded-md shadow-xl`}
          >
            <Listbox.Options className={`w-full bg-neutral-800`}>
              {Object.keys(weaponsByCategory).map((category) => (
                <div key={`weapon-filter-category-${category}`}>
                  <div
                    className={`border-l-orange-400 p-4 transition-all hover:text-orange-400 ${
                      openWeaponCategory === category
                        ? "border-l-4 text-orange-400"
                        : ""
                    }`}
                    onClick={() =>
                      setOpenWeaponCategory((state) =>
                        state === category ? null : category
                      )
                    }
                  >
                    {category}
                  </div>
                  {openWeaponCategory === category && (
                    <div>
                      {weaponsByCategory[category as WeaponCategory].map(
                        (weapon) => (
                          <Listbox.Option key={weapon.id} value={weapon}>
                            {({ selected }) => (
                              <li
                                className={`border-l-orange-400 py-4 px-8 transition-all hover:text-orange-400 ${
                                  selected ? "border-l-4 text-orange-400" : ""
                                }`}
                              >
                                {weapon.name}
                              </li>
                            )}
                          </Listbox.Option>
                        )
                      )}
                    </div>
                  )}
                </div>
              ))}
            </Listbox.Options>
          </Transition>
        </Listbox>
      </div>
      <div className="relative md:w-64">
        <Listbox
          value={selectedAttachments}
          onChange={setSelectedAttachments}
          multiple
        >
          <Listbox.Label className="mb-2 flex items-center justify-between">
            <div>Filter by attachments</div>
            <button
              className="tertiary m-0 w-fit p-0"
              onClick={() => setSelectedAttachments([])}
            >
              Clear
            </button>
          </Listbox.Label>
          <Listbox.Button className={"mb-4"}>
            {selectedAttachments.length === 0 ? "Any Attachments" : ""}
            {selectedAttachments
              .map((attachment) => attachment.name)
              .join(", ")}
          </Listbox.Button>
          <Transition
            enter="transform transition duration-150 ease-in-out"
            enterFrom="scale-0 opacity-0"
            enterTo="scale-100 opacity-100"
            leave="transform transition duration-150 ease-in-out"
            leaveFrom="scale-100 opacity-100"
            leaveTo="scale-0 opacity-0"
            className={`absolute top-20 z-10 max-h-64 w-full cursor-pointer overflow-y-scroll rounded-md shadow-xl`}
          >
            <Listbox.Options className={`w-full bg-neutral-800`}>
              {Object.keys(attachmentsByCategory).map((category) => (
                <div key={`weapon-filter-category-${category}`}>
                  <div
                    className={`border-l-orange-400 p-4 transition-all hover:text-orange-400 ${
                      openAttachmentCategory === category
                        ? "border-l-4 text-orange-400"
                        : ""
                    }`}
                    onClick={() =>
                      setOpenAttachmentCategory((state) =>
                        state === category ? null : category
                      )
                    }
                  >
                    {category}
                  </div>
                  {openAttachmentCategory === category && (
                    <div>
                      {attachmentsByCategory[
                        category as AttachmentCategory
                      ].map((attachment) => (
                        <Listbox.Option key={attachment.id} value={attachment}>
                          {({ selected }) => (
                            <li
                              className={`border-l-orange-400 py-4 px-8 transition-all ${
                                selected ? "border-l-4 text-orange-400" : ""
                              }`}
                            >
                              {attachment.name}
                            </li>
                          )}
                        </Listbox.Option>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </Listbox.Options>
          </Transition>
        </Listbox>
      </div>
      <div className="relative md:w-64">
        <Listbox value={sortBy} onChange={setSortBy}>
          <Listbox.Label className="mb-2 flex items-center justify-between">
            <div>Sort By</div>
          </Listbox.Label>
          <Listbox.Button className={"mb-4"}>{sortBy.name}</Listbox.Button>
          <Transition
            enter="transform transition duration-150 ease-in-out"
            enterFrom="scale-0 opacity-0"
            enterTo="scale-100 opacity-100"
            leave="transform transition duration-150 ease-in-out"
            leaveFrom="scale-100 opacity-100"
            leaveTo="scale-0 opacity-0"
            className={`absolute top-20 z-10 max-h-64 w-full cursor-pointer overflow-y-scroll rounded-md shadow-xl`}
          >
            <Listbox.Options className={`w-full bg-neutral-800`}>
              {sortOptions.map((option) => (
                <Listbox.Option
                  key={`sort-option-${option.value}`}
                  value={option}
                >
                  {({ selected }) => (
                    <li
                      className={`border-l-orange-400 py-4 px-8 transition-all ${
                        selected ? "border-l-4 text-orange-400" : ""
                      }`}
                    >
                      {option.name}
                    </li>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </Listbox>
      </div>
    </div>
  );
};

export default Builds;
