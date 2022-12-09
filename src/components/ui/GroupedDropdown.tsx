import type { Attachment, Weapon } from "@prisma/client";
import type { Dispatch, SetStateAction } from "react";
import type { WeaponsByCategory } from "../../types/Weapons";
import { useState } from "react";

type GroupedDropdownProps = {
  data: WeaponsByCategory;
  selectedItem: Weapon | Attachment | undefined;
  setSelectedItem: Dispatch<SetStateAction<Weapon | Attachment | undefined>>;
};

const GroupedDropdown = ({
  data,
  selectedItem,
  setSelectedItem,
}: GroupedDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    keyof WeaponsByCategory | null
  >(null);

  const selectItem = (item: Weapon | Attachment) => {
    setSelectedItem(item);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div
        className="grouped-dropdown "
        onClick={() => setIsOpen((cur) => !cur)}
      >
        <div className="flex flex-row items-center justify-between">
          <div className="w-fit">{selectedItem?.name}</div>
          <div className="">{isOpen ? `▲` : `▼`}</div>
        </div>
      </div>
      {isOpen && (
        <div className="absolute top-[41px] left-0 h-[50vh] w-full overflow-scroll border border-neutral-400 bg-neutral-600">
          {Object.entries(data).map(([category, items]) => (
            <div key={`category-${category}`} className="mb-4 ">
              <div className="px-4 pt-4 pb-2 text-xl font-bold">{category}</div>
              <div>
                {items.map((item) => (
                  <div
                    key={`weapon-${item.id}`}
                    className="px-6 py-2 hover:bg-neutral-500"
                    onClick={() => selectItem(item)}
                  >
                    {item.name}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupedDropdown;
