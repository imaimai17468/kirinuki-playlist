import { ListMusic, Scissors, Settings2, Star, Tag, User, UserSearch, Users } from "lucide-react";

export const SIDEBAR_ITEMS = {
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
        title: "Tags",
        url: "/tags",
        icon: Tag,
      },
      {
        title: "Users",
        url: "/users",
        icon: UserSearch,
      },
    ],
    myPageNavItems: [
      {
        title: "Favorites",
        url: "/favorites",
        icon: Star,
      },
      {
        title: "Following",
        url: "/following",
        icon: Users,
      },
      {
        title: "My Clips",
        url: "/my-clips",
        icon: User,
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
