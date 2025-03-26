import { ListMusic, Scissors, Settings2, Star, Tag } from "lucide-react";

export const SIDEBAR_ITEMS = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: {
    navItems: [
      {
        title: "Clips",
        url: "/clips",
        icon: Scissors,
      },
      {
        title: "Playlists",
        url: "/playlists",
        icon: ListMusic,
      },
      {
        title: "Favorites",
        url: "/favorites",
        icon: Star,
      },
      {
        title: "Tags",
        url: "/tags",
        icon: Tag,
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
