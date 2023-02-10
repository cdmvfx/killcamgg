import { useState } from "react";
import { Combobox } from "@headlessui/react";
import type { Attachment, Weapon } from "@prisma/client";
import { type DateRange, Sort } from "../../../types/Filters";
import { sortOptions, dateRangeOptions } from "../../../lib/filterOptions";
import { FaTimes } from "react-icons/fa";

type BuildFiltersProps = {
  weapons: Weapon[];
  selectedWeapon: Weapon | null;
  handleWeaponChange: (weapon: Weapon | null) => void;
  attachments: Attachment[];
  selectedAttachments: Attachment[];
  handleAttachmentsChange: (attachments: Attachment | Attachment[]) => void;
  sortBy: Sort;
  handleViewChange: (view: Sort) => void;
  dateRange: DateRange;
  handleDateRangeChange: (dateRange: DateRange) => void;
};

const BuildFilters = (props: BuildFiltersProps) => {
  const {
    weapons,
    selectedWeapon,
    handleWeaponChange,
    attachments,
    selectedAttachments,
    handleAttachmentsChange,
    sortBy,
    handleViewChange,
    dateRange,
    handleDateRangeChange,
  } = props;

  const [weaponQuery, setWeaponQuery] = useState("");
  const [attachmentQuery, setAttachmentQuery] = useState("");

  const filteredWeapons =
    weaponQuery === ""
      ? weapons
      : weapons.filter((weapon) =>
          weapon.name.toLowerCase().includes(weaponQuery.toLowerCase())
        );

  const filteredAttachments =
    attachmentQuery === ""
      ? attachments
      : attachments.filter((attachment) =>
          attachment.name.toLowerCase().includes(attachmentQuery.toLowerCase())
        );

  const removeSelectedAttachment = (attachment: Attachment) => {
    handleAttachmentsChange(attachment);
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
              onClick={() => handleViewChange(option.value as Sort)}
            >
              {option.name}
            </div>
          ))}
        </div>
        <div>Weapon</div>
        <div className="flex items-center gap-4">
          <div>
            <Combobox
              value={selectedWeapon}
              onChange={(val) => handleWeaponChange(val)}
            >
              <div className="relative">
                {selectedWeapon ? (
                  <div
                    onClick={() => handleWeaponChange(null)}
                    className="flex cursor-pointer items-center gap-2 rounded bg-neutral-800 py-2 px-4 transition-all hover:bg-neutral-700"
                  >
                    {selectedWeapon.name} <FaTimes />
                  </div>
                ) : (
                  <Combobox.Input
                    type="search"
                    placeholder="Search for a weapon..."
                    onChange={(event) => setWeaponQuery(event.target.value)}
                  />
                )}
                <Combobox.Options className="absolute z-50 max-h-80 w-full overflow-y-scroll rounded bg-neutral-800">
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
              onChange={(val) => handleAttachmentsChange(val)}
            >
              <div className="relative">
                {selectedAttachments.length < 6 && (
                  <Combobox.Input
                    type="search"
                    placeholder="Search for an attachment..."
                    onChange={(event) => setAttachmentQuery(event.target.value)}
                  />
                )}
                <Combobox.Options className="absolute z-50 max-h-80 w-full overflow-y-scroll rounded bg-neutral-800">
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
                      onClick={() => removeSelectedAttachment(attachment)}
                      className="flex cursor-pointer items-center gap-2 rounded bg-neutral-800 py-2 px-4 transition-all hover:bg-neutral-700"
                    >
                      {attachment.name} <FaTimes />
                    </div>
                  ))}
              </div>
            </Combobox>
          </div>
        </div>
        {sortBy !== Sort.New && (
          <>
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
                  onClick={() =>
                    handleDateRangeChange(option.value as DateRange)
                  }
                >
                  {option.name}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BuildFilters;
