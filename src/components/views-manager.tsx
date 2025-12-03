"use client";

import {
  createViewAction,
  deleteViewAction,
  getViewsAction,
  updateViewAction,
} from "@/actions/leaderboard-views";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CreateLeaderboardViewInput } from "@/schemas/leaderboard-views";
import {
  BookmarkIcon,
  ChevronDown,
  Edit2,
  SaveIcon,
  Trash2,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

type SavedView = {
  id: string;
  name: string;
  viewType: string;
  filters: Record<string, unknown>;
  sortBy: string | null;
  sortOrder: string | null;
  columnVisibility: Record<string, boolean>;
  createdAt: Date;
};

type ViewsManagerProps = {
  currentFilters: Record<string, unknown>;
  currentSorting: { id: string; desc: boolean }[];
  currentColumnVisibility: Record<string, boolean>;
  onApplyView: (view: SavedView) => void;
  viewType?: "USER" | "PREDICTION" | "CATEGORY" | "GROUP";
};

export default function ViewsManager({
  currentFilters,
  currentSorting,
  currentColumnVisibility,
  onApplyView,
  viewType = "USER",
}: ViewsManagerProps) {
  const [views, setViews] = useState<SavedView[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<SavedView | null>(null);
  const [viewName, setViewName] = useState("");
  const [isPending, startTransition] = useTransition();

  // Load views on mount filtered by viewType
  useEffect(() => {
    startTransition(async () => {
      const loadedViews = await getViewsAction(viewType);
      setViews(loadedViews as SavedView[]);
    });
  }, [viewType]);

  // Handle create view
  const handleCreateView = async () => {
    if (!viewName.trim()) {
      toast.error("Please enter a view name");
      return;
    }

    const viewData: CreateLeaderboardViewInput = {
      name: viewName.trim(),
      viewType: viewType,
      filters: currentFilters,
      sortBy: currentSorting[0]?.id,
      sortOrder: currentSorting[0]?.desc ? "desc" : "asc",
      columnVisibility: currentColumnVisibility,
    };

    startTransition(async () => {
      const result = await createViewAction(viewData);

      if (result.success && result.data) {
        setViews([...views, result.data as SavedView]);
        setIsCreateDialogOpen(false);
        setViewName("");
        toast.success("View saved successfully");
      } else {
        const errorMessage =
          result.errors?._form?.[0] ||
          result.errors?.name?.[0] ||
          "Failed to save view";
        toast.error(errorMessage);
      }
    });
  };

  // Handle rename view
  const handleRenameView = async () => {
    if (!selectedView || !viewName.trim()) {
      toast.error("Please enter a view name");
      return;
    }

    startTransition(async () => {
      const result = await updateViewAction({
        id: selectedView.id,
        name: viewName.trim(),
      });

      if (result.success && result.data) {
        setViews(
          views.map((v) =>
            v.id === selectedView.id ? { ...v, name: viewName.trim() } : v
          )
        );
        setIsRenameDialogOpen(false);
        setViewName("");
        setSelectedView(null);
        toast.success("View renamed successfully");
      } else {
        const errorMessage =
          result.errors?._form?.[0] ||
          result.errors?.name?.[0] ||
          "Failed to rename view";
        toast.error(errorMessage);
      }
    });
  };

  // Handle delete view
  const handleDeleteView = async () => {
    if (!selectedView) return;

    startTransition(async () => {
      const result = await deleteViewAction(selectedView.id);

      if (result.success) {
        setViews(views.filter((v) => v.id !== selectedView.id));
        setIsDeleteDialogOpen(false);
        setSelectedView(null);
        toast.success("View deleted successfully");
      } else {
        const errorMessage =
          result.errors?._form?.[0] || "Failed to delete view";
        toast.error(errorMessage);
      }
    });
  };

  // Open rename dialog
  const openRenameDialog = (view: SavedView) => {
    setSelectedView(view);
    setViewName(view.name);
    setIsRenameDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (view: SavedView) => {
    setSelectedView(view);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={views.length >= 3}
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <SaveIcon className="mr h-4 w-4" />
          Save View
        </Button>

        {views.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <BookmarkIcon className="h-4 w-4" />
                Views ({views.length}/3)
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[250px]">
              <DropdownMenuLabel>Saved Views</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                {views.map((view) => (
                  <div
                    key={view.id}
                    className="flex items-center justify-between px-2 py-1.5 hover:bg-accent rounded-sm"
                  >
                    <button
                      className="flex-1 text-left text-sm truncate"
                      onClick={() => onApplyView(view)}
                    >
                      {view.name}
                    </button>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          openRenameDialog(view);
                        }}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteDialog(view);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>{" "}
      {/* Create View Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Current View</DialogTitle>
            <DialogDescription>
              Save your current filters, sorting, and column visibility as a
              named view for quick access later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="view-name">View Name</Label>
              <Input
                id="view-name"
                value={viewName}
                onChange={(e) => setViewName(e.target.value)}
                placeholder="e.g., Top Performers, Recent Activity"
                maxLength={50}
                disabled={isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setViewName("");
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateView} disabled={isPending}>
              {isPending ? "Saving..." : "Save View"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Rename View Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename View</DialogTitle>
            <DialogDescription>
              Enter a new name for &quot;{selectedView?.name}&quot;
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rename-view">View Name</Label>
              <Input
                id="rename-view"
                value={viewName}
                onChange={(e) => setViewName(e.target.value)}
                placeholder="Enter new name"
                maxLength={50}
                disabled={isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRenameDialogOpen(false);
                setViewName("");
                setSelectedView(null);
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleRenameView} disabled={isPending}>
              {isPending ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete View Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete View</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedView?.name}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedView(null);
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteView}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
