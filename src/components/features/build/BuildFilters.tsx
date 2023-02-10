import { useState } from "react";
import { Combobox } from "@headlessui/react";
import type { Attachment, Weapon } from "@prisma/client";
import { type DateRange, Sort } from "../../../types/Filters";
import { sortOptions, dateRangeOptions } from "../../../lib/filterOptions";
import { FaTimes, FaClock, FaFire, FaMedal, FaTrash } from "react-icons/fa";

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

  const viewIcon = (name: Sort) => {
    switch (name) {
      case Sort.Hot:
        return <FaFire />;
      case Sort.New:
        return <FaClock />;
      case Sort.Top:
        return <FaMedal />;
      case Sort.Worst:
        return <FaTrash />;
    }
  };

  return (
    <div className="mb-4">
      <div className="grid grid-cols-1 grid-rows-none items-center gap-4 rounded bg-black bg-opacity-30 p-4 md:grid-cols-[8rem,1fr] md:gap-4">
        <div>View</div>
        <div className="grid w-full grid-cols-2 gap-2 md:grid-cols-[repeat(4,fit-content(100%))] md:gap-4">
          {sortOptions.map((option) => (
            <div
              key={`view-option-${option.value}`}
              className={`flex cursor-pointer items-center gap-2 rounded py-2 px-4 transition-all  ${
                sortBy === option.value
                  ? "bg-orange-600 hover:bg-orange-500"
                  : "bg-black bg-opacity-50 hover:bg-neutral-800"
              }`}
              onClick={() => handleViewChange(option.value as Sort)}
            >
              {viewIcon(option.value as Sort)}
              {option.name}
            </div>
          ))}
        </div>
        {sortBy !== Sort.Hot && (
          <>
            <div>Weapon</div>
            <div className="flex w-full items-center gap-4">
              <Combobox
                value={selectedWeapon}
                onChange={(val) => handleWeaponChange(val)}
              >
                <div className="relative w-full md:w-fit">
                  {selectedWeapon ? (
                    <div
                      onClick={() => handleWeaponChange(null)}
                      className="flex w-fit cursor-pointer items-center gap-2 rounded bg-orange-600 py-2 px-4 transition-all hover:bg-orange-500"
                    >
                      {selectedWeapon.name} <FaTimes />
                    </div>
                  ) : (
                    <Combobox.Input
                      type="search"
                      placeholder="Search for a weapon..."
                      className="w-full md:w-auto"
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
            <div>Attachments</div>
            <div className="flex w-full items-center gap-4">
              <div className="flex w-full flex-wrap items-center gap-4 md:flex-nowrap">
                <Combobox
                  multiple
                  value={selectedAttachments}
                  onChange={(val) => handleAttachmentsChange(val)}
                >
                  <div className="relative w-full md:w-fit">
                    {selectedAttachments.length < 5 && (
                      <Combobox.Input
                        type="search"
                        className="w-full md:w-auto"
                        placeholder="Search for an attachment..."
                        onChange={(event) =>
                          setAttachmentQuery(event.target.value)
                        }
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

                  {selectedAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 md:gap-2">
                      {selectedAttachments.map((attachment) => (
                        <div
                          key={`selected-attachment-id-${attachment.id}`}
                          onClick={() => removeSelectedAttachment(attachment)}
                          className="flex cursor-pointer items-center gap-2 rounded bg-orange-600 py-2 px-4 transition-all hover:bg-orange-500"
                        >
                          {attachment.name} <FaTimes />
                        </div>
                      ))}
                    </div>
                  )}
                </Combobox>
              </div>
            </div>
            {sortBy !== Sort.New && (
              <>
                <div>Date Range</div>
                <div className="grid w-full grid-cols-2 gap-2 md:grid-cols-[repeat(4,fit-content(100%))] md:gap-4">
                  {dateRangeOptions.map((option) => (
                    <div
                      key={`date-range-option-${option.value}`}
                      className={`flex cursor-pointer items-center gap-2 rounded py-2 px-4 transition-all  ${
                        dateRange === option.value
                          ? "bg-orange-600 hover:bg-orange-500"
                          : "bg-black bg-opacity-50 hover:bg-neutral-800"
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
          </>
        )}
      </div>
    </div>
  );
};

export default BuildFilters;
