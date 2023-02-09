import { useState } from "react";
import { Listbox, Transition, Combobox } from "@headlessui/react";
import type {
  Attachment,
  AttachmentCategory,
  Weapon,
  WeaponCategory,
} from "@prisma/client";
import type { WeaponsByCategory } from "../../../types/Weapons";
import type { AttachmentsByCategory } from "../../../types/Attachments";
import type { DateRange, Sort } from "../../../types/Filters";
import { sortOptions, dateRangeOptions } from "../../../lib/filterOptions";
import Button from "../../../components/ui/Button";
import { FaTimes } from "react-icons/fa";
import type { Dispatch, SetStateAction } from "react";

type BuildFiltersProps = {
  weaponsByCategory: WeaponsByCategory;
  selectedWeapon: Weapon | null;
  setSelectedWeapon: (weapons: Weapon | null) => void;
  attachmentsByCategory: AttachmentsByCategory;
  selectedAttachments: Attachment[];
  setSelectedAttachments: Dispatch<SetStateAction<Attachment[]>>;
  sortBy: Sort;
  setSortBy: (sortBy: Sort) => void;
  dateRange: DateRange;
  setDateRange: (dateRange: DateRange) => void;
};

const BuildFilters = (props: BuildFiltersProps) => {
  const {
    weaponsByCategory,
    selectedWeapon,
    setSelectedWeapon,
    attachmentsByCategory,
    selectedAttachments,
    setSelectedAttachments,
    sortBy,
    setSortBy,
    dateRange,
    setDateRange,
  } = props;

  const [openWeaponCategory, setOpenWeaponCategory] = useState<string | null>(
    null
  );

  const [openAttachmentCategory, setOpenAttachmentCategory] = useState<
    string | null
  >(null);

  const [weaponQuery, setWeaponQuery] = useState("");
  const [attachmentQuery, setAttachmentQuery] = useState("");

  const allWeapons = Object.values(weaponsByCategory).flat();

  const filteredWeapons =
    weaponQuery === ""
      ? allWeapons.slice(0, 10)
      : allWeapons
          .filter((weapon) =>
            weapon.name.toLowerCase().includes(weaponQuery.toLowerCase())
          )
          .slice(0, 10);

  const allAttachments = Object.values(attachmentsByCategory).flat();

  const filteredAttachments =
    attachmentQuery === ""
      ? allAttachments.slice(0, 10)
      : allAttachments
          .filter((attachment) =>
            attachment.name
              .toLowerCase()
              .includes(attachmentQuery.toLowerCase())
          )
          .slice(0, 10);

  const removeSelectedAttachment = (id: number) => {
    setSelectedAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  return (
    <div className="mb-4">
      <div className="grid grid-cols-[auto,1fr] grid-rows-3 items-center gap-4 rounded bg-black bg-opacity-30 p-4">
        <div>View</div>
        <div className="flex gap-4">
          {sortOptions.map((option) => (
            <div
              key={`date-range-option-${option.value}`}
              className={`flex cursor-pointer items-center gap-2 rounded py-2 px-4 transition-all  ${
                sortBy === option.value
                  ? "bg-orange-600 hover:bg-orange-500"
                  : "bg-neutral-800 hover:bg-neutral-700"
              }`}
              onClick={() => setSortBy(option.value as Sort)}
            >
              {option.name}
            </div>
          ))}
        </div>
        <div>Weapon</div>
        <div className="flex items-center gap-4">
          <div>
            <Combobox value={selectedWeapon} onChange={setSelectedWeapon}>
              <div className="relative">
                {selectedWeapon ? (
                  <div
                    onClick={() => setSelectedWeapon(null)}
                    className="flex cursor-pointer items-center gap-2 rounded bg-neutral-800 py-2 px-4 transition-all hover:bg-neutral-700"
                  >
                    {selectedWeapon.name} <FaTimes />
                  </div>
                ) : (
                  <Combobox.Input
                    placeholder="Search for a weapon..."
                    onChange={(event) => setWeaponQuery(event.target.value)}
                  />
                )}
                <Combobox.Options className="absolute z-50 w-full rounded bg-neutral-800">
                  {filteredWeapons.map((weapon) => (
                    <Combobox.Option
                      key={`weapon-id-${weapon.id}`}
                      value={weapon}
                      className="cursor-pointer px-8 py-4 transition-all hover:text-orange-500"
                    >
                      {weapon.name}
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              </div>
            </Combobox>
          </div>
        </div>
        <div>Attachments</div>
        <div className="flex items-center gap-4">
          <div className="flex gap-4">
            <Combobox
              multiple
              value={selectedAttachments}
              onChange={(val) => setSelectedAttachments(val)}
            >
              <div className="relative">
                {selectedAttachments.length < 6 && (
                  <Combobox.Input
                    placeholder="Search for an attachment..."
                    onChange={(event) => setAttachmentQuery(event.target.value)}
                  />
                )}
                <Combobox.Options className="absolute w-full rounded bg-neutral-800">
                  {filteredAttachments.map((attachment) => (
                    <Combobox.Option
                      key={`weapon-id-${attachment.id}`}
                      value={attachment}
                      className={`cursor-pointer border-l-orange-400 px-8 py-4 transition-all hover:text-orange-500 ${
                        selectedAttachments.some(
                          (selectedAttachment) =>
                            selectedAttachment.id === attachment.id
                        )
                          ? "border-l-4 text-orange-400"
                          : ""
                      }`}
                    >
                      {attachment.name}
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              </div>

              <div className="flex gap-4">
                {selectedAttachments.length > 0 &&
                  selectedAttachments.map((attachment) => (
                    <div
                      key={`selected-attachment-id-${attachment.id}`}
                      onClick={() => removeSelectedAttachment(attachment.id)}
                      className="flex cursor-pointer items-center gap-2 rounded bg-neutral-800 py-2 px-4 transition-all hover:bg-neutral-700"
                    >
                      {attachment.name} <FaTimes />
                    </div>
                  ))}
              </div>
            </Combobox>
          </div>
        </div>
        <div>Date Range</div>
        <div className="flex gap-4">
          {dateRangeOptions.map((option) => (
            <div
              key={`date-range-option-${option.value}`}
              className={`flex cursor-pointer items-center gap-2 rounded py-2 px-4 transition-all  ${
                dateRange === option.value
                  ? "bg-orange-600 hover:bg-orange-500"
                  : "bg-neutral-800 hover:bg-neutral-700"
              }`}
              onClick={() => setDateRange(option.value as DateRange)}
            >
              {option.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BuildFilters;
