"use client";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Button } from "@/components/shared/button";

interface ConfirmDeleteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  loading?: boolean;
}

export function ConfirmDelete({
  open, onOpenChange, onConfirm,
  title = "Delete this item?",
  description = "This action cannot be undone.",
  loading,
}: ConfirmDeleteProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-lg border bg-card p-6 shadow-lg">
          <AlertDialog.Title className="text-base font-semibold mb-1">{title}</AlertDialog.Title>
          <AlertDialog.Description className="text-sm text-muted-foreground mb-6">{description}</AlertDialog.Description>
          <div className="flex justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <Button variant="outline" size="sm">Cancel</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button variant="destructive" size="sm" loading={loading} onClick={onConfirm}>
                Delete
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
