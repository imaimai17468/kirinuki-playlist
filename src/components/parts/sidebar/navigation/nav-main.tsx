"use client";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useUser } from "@clerk/nextjs";
import { ChevronRight, type LucideIcon, User } from "lucide-react";
import Link from "next/link";

type NavMainProps = {
  navItems: {
    title: string;
    url: string;
    icon: LucideIcon;
  }[];
  myPageNavItems: {
    title: string;
    url: string;
    icon: LucideIcon;
    isDynamic?: boolean;
  }[];
  collapsibleItems: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive: boolean;
    items: {
      title: string;
      url: string;
    }[];
  }[];
};

export const NavMain = ({ navItems, collapsibleItems, myPageNavItems }: NavMainProps) => {
  const user = useUser();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton tooltip={item.title} asChild>
              <Link href={item.url}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
        {user.isSignedIn && (
          <>
            <SidebarSeparator />
            <SidebarGroupLabel>My Space</SidebarGroupLabel>
            {myPageNavItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton tooltip={item.title} asChild>
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem key="my-page">
              <SidebarMenuButton tooltip="My Page" asChild>
                <Link href={`/users/${user.user?.id}`}>
                  <User />
                  <span>My Page</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {collapsibleItems.map((item) => (
              <Collapsible key={item.title} asChild defaultOpen={item.isActive} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
};
