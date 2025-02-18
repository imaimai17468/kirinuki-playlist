"use client";

import { BookOpen, ListMusic, Settings2, Star, Tag, Tv } from "lucide-react";
import type * as React from "react";

import { NavMain } from "@/components/parts/sidebar/nav-main";
import { NavUser } from "@/components/parts/sidebar/nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: {
    navItems: [
      {
        title: "Library",
        url: "/library",
        icon: BookOpen,
      },
      {
        title: "Favorites",
        url: "/favorites",
        icon: Star,
      },
      {
        title: "Playlists",
        url: "/playlists",
        icon: ListMusic,
      },
      {
        title: "Tags",
        url: "/tags",
        icon: Tag,
      },
      {
        title: "Channels",
        url: "/channels",
        icon: Tv,
      },
    ],
    collapsibleItems: [
      {
        title: "Settings",
        url: "/settings",
        icon: Settings2,
        isActive: false,
        items: [
          {
            title: "General",
            url: "/settings/general",
          },
          {
            title: "Account",
            url: "/settings/account",
          },
          {
            title: "Billing",
            url: "/settings/billing",
          },
          {
            title: "Notifications",
            url: "/settings/notifications",
          },
        ],
      },
    ],
  },
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <p className="text-2xl font-bold group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0">
          Kirinukist
        </p>
      </SidebarHeader>
      <SidebarContent>
        <NavMain navItems={data.navMain.navItems} collapsibleItems={data.navMain.collapsibleItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
