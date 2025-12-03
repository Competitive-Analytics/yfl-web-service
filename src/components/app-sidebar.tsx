"use client";

import {
  IconDashboard,
  IconEaseOutControlPoint,
  IconGraph,
  IconInnerShadowTop,
  IconListDetails,
  IconSettings,
  type Icon,
  type IconProps,
} from "@tabler/icons-react";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Router from "@/constants/router";
import { Role } from "@/generated/prisma";

import Link from "next/link";
import SuperAdminAction from "./main-action";
import OrgAdminAction from "./org-admin-action";

const superAdminNavItems: NavItem[] = [
  {
    title: "Dashboard",
    url: Router.HOME,
    icon: IconDashboard,
  },
  {
    title: "Organizations",
    url: Router.ORGANIZATIONS,
    icon: IconListDetails,
  },
];

const orgAdminNavItems: NavItem[] = [
  {
    title: "Dashboard",
    url: Router.HOME,
    icon: IconDashboard,
  },
  {
    title: "Leaderboard",
    url: Router.LEADERBOARD_USERS,
    icon: IconListDetails,
  },
  {
    title: "Forecasts",
    url: Router.FORECASTS,
    icon: IconEaseOutControlPoint,
    items: [
      {
        title: "All Forecasts",
        url: Router.FORECASTS,
      },
      {
        title: "AI Assistant",
        url: Router.ORG_ADMIN_AI_CONVERSATIONS,
      },
    ],
  },
  {
    title: "Settings",
    url: Router.SETTINGS,
    icon: IconSettings,
  },
];

const userNavItems: NavItem[] = [
  {
    title: "Forecasts",
    url: Router.HOME,
    icon: IconEaseOutControlPoint,
  },
  {
    title: "Leaderboard",
    url: Router.LEADERBOARD_USERS,
    icon: IconListDetails,
  },
  {
    title: "Summary",
    url: Router.SUMMARY,
    icon: IconGraph,
  },
];

export interface NavItem {
  title: string;
  url: string;
  icon?: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<Icon>>;
  items?: {
    title: string;
    url: string;
  }[];
  isActive?: boolean;
}

export interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  role: Role;
  user: {
    name: string | null;
    email: string | null;
  };
}

export function AppSidebar({ role, user, ...props }: AppSidebarProps) {
  const navItems =
    role === Role.SUPER_ADMIN
      ? superAdminNavItems
      : role === Role.ORG_ADMIN
      ? orgAdminNavItems
      : userNavItems;

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href={Router.HOME}>
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">ŷFL</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              <SidebarMenuItem className="flex items-center gap-2">
                {role === Role.SUPER_ADMIN ? (
                  <SuperAdminAction />
                ) : role === Role.ORG_ADMIN ? (
                  <OrgAdminAction />
                ) : null}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
