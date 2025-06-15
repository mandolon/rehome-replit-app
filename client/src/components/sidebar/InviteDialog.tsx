
import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Mail, Users, Shield } from "lucide-react";

const ROLES = [
  { key: "team", label: "Team Member", icon: <Users className="w-4 h-4 mr-2" /> },
  { key: "client", label: "Client", icon: <UserPlus className="w-4 h-4 mr-2" /> },
  { key: "admin", label: "Admin", icon: <Shield className="w-4 h-4 mr-2" /> },
];

interface InviteDialogProps {
  triggerButtonClassName?: string;
}

const InviteDialog: React.FC<InviteDialogProps> = ({ triggerButtonClassName }) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("team");
  const [loading, setLoading] = useState(false);
  const [invited, setInvited] = useState(false);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setInvited(true);
      setEmail("");
    }, 1200);
  };

  const handleDialogOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setEmail("");
      setRole("team");
      setInvited(false);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className={triggerButtonClassName}
          type="button"
          tabIndex={0}
        >
          <UserPlus className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">Invite</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite someone to your workspace</DialogTitle>
          <DialogDescription>
            Enter their email address and choose a role. An invitation will be sent to join as a team member, client, or admin.
          </DialogDescription>
        </DialogHeader>
        {invited ? (
          <div className="flex flex-col items-center gap-2 my-6">
            <div className="bg-green-100 flex items-center justify-center w-12 h-12 rounded-full">
              <Mail className="w-7 h-7 text-green-600" />
            </div>
            <span className="text-green-700 font-medium text-sm">Invite sent!</span>
            <DialogClose asChild>
              <Button className="mt-2 w-full" variant="secondary">
                Done
              </Button>
            </DialogClose>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="mt-2 flex flex-col gap-4">
            <div>
              <label
                htmlFor="invite-email"
                className="text-xs font-medium text-gray-700 block mb-1"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                id="invite-email"
                placeholder="email@example.com"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label
                htmlFor="invite-role"
                className="text-xs font-medium text-gray-700 block mb-1"
              >
                Role
              </label>
              <div className="flex gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    aria-pressed={role === r.key}
                    className={`flex items-center border rounded px-3 py-1 text-xs transition-colors ${
                      role === r.key
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background"
                    }`}
                    onClick={() => setRole(r.key)}
                    disabled={loading}
                  >
                    {r.icon}
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={!email || loading}
                className="w-full"
              >
                {loading ? "Sending invite..." : "Send Invite"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InviteDialog;
