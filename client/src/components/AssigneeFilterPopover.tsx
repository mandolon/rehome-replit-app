
import React, { useState } from "react";
import { User, Users } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Dummy people list for the demonstration
const TEAM_MEMBERS = [
  { name: "Alice", avatar: "bg-blue-500" },
  { name: "Bob", avatar: "bg-pink-500" },
  { name: "Charlie", avatar: "bg-green-500" },
  { name: "ME", avatar: "bg-gray-500" }
];

type Person = { name: string; avatar: string; };

interface AssigneeFilterPopoverProps {
  selectedPeople: string[];
  onChange: (people: string[]) => void;
}

const AssigneeFilterPopover = ({ selectedPeople, onChange }: AssigneeFilterPopoverProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredMembers = TEAM_MEMBERS.filter(member =>
    member.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = (person: Person) => {
    if (selectedPeople.includes(person.name)) {
      onChange(selectedPeople.filter(name => name !== person.name));
    } else {
      onChange([...selectedPeople, person.name]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-700"
        >
          <Users className="w-3 h-3" />
          Assignee
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2 z-[1100]">
        <Input
          placeholder="Search people"
          size={9}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mb-2 text-xs"
        />
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {filteredMembers.map(member => (
            <button
              key={member.name}
              onClick={() => handleToggle(member)}
              className={`flex items-center w-full px-2 py-1 text-xs rounded hover:bg-accent
                ${selectedPeople.includes(member.name) ? "bg-accent" : ""}
              `}
              type="button"
            >
              <span
                className={`w-5 h-5 rounded-full mr-2 flex items-center justify-center text-white text-[11px] font-semibold ${member.avatar}`}
              >
                {member.name[0]}
              </span>
              {member.name}
              {selectedPeople.includes(member.name) && (
                <span className="ml-auto text-xs text-green-600 font-semibold">✔</span>
              )}
            </button>
          ))}
          {filteredMembers.length === 0 && (
            <div className="text-xs text-muted-foreground px-2 py-1">No people found.</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AssigneeFilterPopover;

