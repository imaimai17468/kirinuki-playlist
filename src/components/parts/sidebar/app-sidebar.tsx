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
        url: "#",
        icon: BookOpen,
      },
      {
        title: "Favorites",
        url: "#",
        icon: Star,
      },
      {
        title: "Playlists",
        url: "#",
        icon: ListMusic,
      },
      {
        title: "Tags",
        url: "#",
        icon: Tag,
      },
      {
        title: "Channels",
        url: "#",
        icon: Tv,
      },
    ],
    collapsibleItems: [
      {
        title: "Settings",
        url: "#",
        icon: Settings2,
        isActive: false,
        items: [
          {
            title: "General",
            url: "#",
          },
          {
            title: "Team",
            url: "#",
          },
          {
            title: "Billing",
            url: "#",
          },
          {
            title: "Limits",
            url: "#",
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
