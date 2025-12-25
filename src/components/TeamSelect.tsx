"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ABBREVIATION_TO_TEAM } from "@/lib/consts";

const TEAM_SELECT_DATA = Object.keys(ABBREVIATION_TO_TEAM).map((abbr) => ({
  label: ABBREVIATION_TO_TEAM[abbr],
  value: abbr,
}));

interface TeamSelectProps {
  value: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function TeamSelect({
  value,
  onChange = () => {},
  className = "",
}: TeamSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedTeam = TEAM_SELECT_DATA.find((team) => team.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[220px] justify-between", className)}
        >
          {selectedTeam ? selectedTeam.label : "Select team..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0">
        <Command>
          <CommandInput placeholder="Search team..." />
          <CommandList>
            <CommandEmpty>No team found.</CommandEmpty>
            <CommandGroup>
              {TEAM_SELECT_DATA.map((team) => (
                <CommandItem
                  key={team.value}
                  value={team.label}
                  onSelect={() => {
                    onChange(team.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === team.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {team.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface MultiTeamSelectProps {
  value: string[];
  onChange?: (value: string[]) => void;
  className?: string;
}

export function MultiTeamSelect({
  value,
  onChange = () => {},
  className = "",
}: MultiTeamSelectProps) {
  const [open, setOpen] = React.useState(false);

  const toggleTeam = (teamValue: string) => {
    if (value.includes(teamValue)) {
      onChange(value.filter((t) => t !== teamValue));
    } else {
      onChange([...value, teamValue]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[300px] justify-between", className)}
        >
          {value.length > 0 ? `${value.length} teams selected` : "Select teams..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search team..." />
          <CommandList>
            <CommandEmpty>No team found.</CommandEmpty>
            <CommandGroup>
              {TEAM_SELECT_DATA.map((team) => (
                <CommandItem
                  key={team.value}
                  value={team.label}
                  onSelect={() => toggleTeam(team.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(team.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {team.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
