"use client";

import type * as React from "react";

import { NavMain } from "@/components/parts/sidebar/navigation/nav-main";
import { NavUser } from "@/components/parts/sidebar/navigation/nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import { SIDEBAR_ITEMS } from "./consts";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <p className="text-2xl font-bold group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0">
          Kirinukist
        </p>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          navItems={SIDEBAR_ITEMS.navMain.navItems}
          myPageNavItems={SIDEBAR_ITEMS.navMain.myPageNavItems}
          collapsibleItems={SIDEBAR_ITEMS.navMain.collapsibleItems}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
