import type {
  Attachment,
  AttachmentCategory,
  Weapon,
  WeaponCategory,
} from "@prisma/client";
import type { WeaponsByCategory } from "../../types/Weapons";
import { useState } from "react";
import type { AttachmentsByCategory } from "../../types/Attachments";

type GroupedDropdownProps = {
  data: WeaponsByCategory | AttachmentsByCategory;
  selectedItem: Weapon | Attachment | null;
  setSelectedItem: (item: Weapon | Attachment | null) => void;
  selectedAttachments?: Attachment[];
};

const GroupedDropdown = ({
  data,
  selectedItem,
  setSelectedItem,
  selectedAttachments,
}: GroupedDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const selectItem = (item: Weapon | Attachment | null) => {
    setSelectedItem(item);
    setIsOpen(false);
  };

  return (
    <div className="relative flex-grow ">
      <div
        className="grouped-dropdown "
        onClick={() => setIsOpen((cur) => !cur)}
      >
        <div className="flex flex-row items-center justify-between">
          <div className="w-fit">
            <div className="text-xs font-bold uppercase tracking-wider">
              {selectedItem?.category}
            </div>
            <div>{selectedItem?.name}</div>
          </div>
          <div className="">{isOpen ? `▲` : `▼`}</div>
        </div>
      </div>
      {isOpen && (
        <div className="absolute top-[55px] left-0 z-10 h-[50vh] w-full overflow-scroll bg-neutral-900">
          {Object.keys(data).map((category) => {
            if (
              selectedAttachments &&
              selectedAttachments.find(
                (attachment) => attachment.category === category
              ) &&
              selectedItem?.category !== category
            ) {
              return <></>;
            }
            return (
              <div key={`category-${category}`} className="mb-4 ">
                <div
                  className="mt-2 py-2 px-4 font-bold hover:bg-neutral-500"
                  onClick={() =>
                    setSelectedCategory((current) => {
                      if (current != category) return category;
                      if (current) return null;
                      return category;
                    })
                  }
                >
                  {category}
                </div>
                {selectedCategory === category &&
                  (
                    data[category as WeaponCategory & AttachmentCategory] as
                      | Weapon[]
                      | Attachment[]
                  ).map((item) => (
                    <div
                      key={`weapon-${item.id}`}
                      className="px-8 py-2 hover:bg-neutral-500"
                      onClick={() => selectItem(item)}
                    >
                      {item.name}
                    </div>
                  ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GroupedDropdown;
