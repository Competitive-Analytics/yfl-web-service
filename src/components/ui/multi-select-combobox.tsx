"use client";

import { Check, ChevronsUpDown, X } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectComboboxProps {
  options: MultiSelectOption[];
  selectedValues?: string[];
  onValuesChange?: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  maxDisplayed?: number;
  showSelectAll?: boolean;
  selectAllLabel?: string;
  clearAllLabel?: string;
}

export function MultiSelectCombobox({
  options,
  selectedValues = [],
  onValuesChange,
  placeholder = "Select options...",
  searchPlaceholder = "Search options...",
  emptyMessage = "No options found.",
  className,
  disabled = false,
  maxDisplayed = 2,
  showSelectAll = true,
  clearAllLabel = "Clear All",
}: MultiSelectComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const filteredOptions = React.useMemo(() => {
    return options.filter((option) =>
      option.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  const displayText = React.useMemo(() => {
    if (selectedValues.length === 0) {
      return placeholder;
    }
    if (selectedValues.length === 1) {
      const option = options.find((opt) => opt.value === selectedValues[0]);
      return option?.label || placeholder;
    }
    if (selectedValues.length <= maxDisplayed) {
      return selectedValues
        .map((value) => options.find((opt) => opt.value === value)?.label)
        .filter(Boolean)
        .join(", ");
    }
    return `${placeholder} (${selectedValues.length} selected)`;
  }, [selectedValues, options, placeholder, maxDisplayed]);

  const handleToggle = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onValuesChange?.(newValues);
  };

  const handleSelectAll = () => {
    onValuesChange?.([]);
  };

  const handleClearAll = () => {
    onValuesChange?.([]);
  };

  const handleRemove = (value: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newValues = selectedValues.filter((v) => v !== value);
    onValuesChange?.(newValues);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          <span className="truncate">{displayText}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] min-w-[300px] max-w-[400px] p-0"
        align="start"
      >
        <div className="p-2">
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9"
          />
        </div>

        {showSelectAll && (
          <>
            <div className="flex gap-2 px-2 py-1.5 border-t">
              {/* <Button
                variant="ghost"
                size="sm"
                className="h-7 flex-1 text-xs"
                onClick={handleSelectAll}
                type="button"
              >
                {selectAllLabel}
              </Button> */}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 flex-1 text-xs"
                onClick={handleClearAll}
                type="button"
              >
                {clearAllLabel}
              </Button>
            </div>
          </>
        )}

        <div className="max-h-64 overflow-y-auto border-t">
          {filteredOptions.length === 0 ? (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            <div className="p-1">
              {filteredOptions.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <div
                    key={option.value}
                    className={cn(
                      "flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent",
                      isSelected && "bg-accent/50"
                    )}
                    onClick={() => handleToggle(option.value)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggle(option.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="flex-1">{option.label}</span>
                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {selectedValues.length > 0 && (
          <div className="border-t p-2 max-h-32 overflow-y-auto">
            <div className="flex flex-wrap gap-1">
              {selectedValues.map((value) => {
                const option = options.find((opt) => opt.value === value);
                if (!option) return null;
                return (
                  <div
                    key={value}
                    className="inline-flex items-center gap-1 rounded-md border border-transparent bg-secondary text-secondary-foreground px-2 py-0.5 text-xs font-medium flex-shrink-0"
                  >
                    <span className="truncate max-w-[150px]">
                      {option.label}
                    </span>
                    <button
                      type="button"
                      className="ml-0.5 rounded-full hover:bg-destructive/20 hover:text-destructive transition-colors flex-shrink-0 inline-flex items-center justify-center h-4 w-4 cursor-pointer"
                      onClick={(e) => handleRemove(value, e)}
                      onMouseDown={(e) => e.stopPropagation()}
                      aria-label={`Remove ${option.label}`}
                    >
                      <X className="h-3 w-3 pointer-events-none" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
