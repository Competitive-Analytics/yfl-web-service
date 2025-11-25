"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Filter } from "lucide-react";
import { useState } from "react";

type ViewType = "USER" | "PREDICTION" | "CATEGORY" | "GROUP";

type LeaderboardSidebarProps = {
  children: React.ReactNode; // The LeaderboardFilters component
  viewType: ViewType;
};

export default function LeaderboardSidebar({
  children,
  viewType,
}: LeaderboardSidebarProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const getTitle = () => {
    switch (viewType) {
      case "USER":
        return "User Leaderboard Filters";
      case "PREDICTION":
        return "Prediction Leaderboard Filters";
      case "CATEGORY":
        return "Category Leaderboard Filters";
      default:
        return "Leaderboard Filters";
    }
  };

  const TriggerButton = (
    <Button variant="outline" size="sm" className="gap-2">
      <Filter className="h-4 w-4" />
      Filters
    </Button>
  );

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerTrigger asChild>{TriggerButton}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{getTitle()}</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-4 overflow-y-auto">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}
