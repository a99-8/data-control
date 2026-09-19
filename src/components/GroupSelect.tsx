import React from "react";
import * as Select from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";
import type { Group } from "@/src/other/types";

interface GroupSelectProps {
  groups: Group[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  noGroupsText: string;
  dir?: "rtl" | "ltr";
}

export const GroupSelect: React.FC<GroupSelectProps> = ({
  groups,
  selectedValue,
  onValueChange,
  placeholder,
  noGroupsText,
  dir = "rtl",
}) => {
  const selectedGroup = groups[Number(selectedValue)];

  return (
    <Select.Root value={selectedValue} onValueChange={onValueChange} dir={dir}>
      <Select.Trigger
        className="form-select form-select-sm bg-dark text-white border-secondary mb-3 d-flex justify-content-between align-items-center"
        style={{ width: "100%", cursor: "pointer" }}
      >
        <Select.Value placeholder={placeholder}>
          {selectedGroup ? selectedGroup.name : placeholder}
        </Select.Value>
        <Select.Icon>
          <ChevronDown size={16} className="text-secondary" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className="bg-dark text-white border border-secondary rounded shadow-lg p-1 z-3"
          position="popper"
          sideOffset={5}
          style={{ width: "var(--radix-select-trigger-width)", zIndex: 9999 }}
        >
          <Select.Viewport>
            {groups && groups.length > 0 ? (
              groups.map((grp, idx) => (
                <Select.Item
                  key={grp.id || idx}
                  value={String(idx)}
                  className="p-2 rounded d-flex align-items-center justify-content-between text-white cursor-pointer hover-bg-secondary select-item"
                  style={{ outline: "none", cursor: "pointer" }}
                >
                  <Select.ItemText>{grp.name}</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check size={14} className="text-primary" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))
            ) : (
              <div className="p-2 text-muted small text-center">
                {noGroupsText}
              </div>
            )}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};
