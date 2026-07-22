"use client";

import { UnlinkIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";

export function DisconnectRobloxButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    await authClient.deleteUser();
    router.push("/");
    router.refresh();
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <UnlinkIcon />
          Disconnect Roblox account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Disconnect Roblox account?</DialogTitle>
          <DialogDescription>
            Your Bloxinsights account is tied to your Roblox login. Since
            there&apos;s no other way to sign in, disconnecting will permanently
            delete your Bloxinsights account. This can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            disabled={isDisconnecting}
            onClick={() => setOpen(false)}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={isDisconnecting}
            onClick={handleDisconnect}
            variant="destructive"
          >
            {isDisconnecting ? "Disconnecting..." : "Disconnect"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
