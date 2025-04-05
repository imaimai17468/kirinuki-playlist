import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { cn } from "@/libs/utils";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { LogIn, UserPlus } from "lucide-react";

export const NavUser = () => {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SignedOut>
          <div className="flex flex-col gap-2">
            <SignInButton mode="modal">
              <SidebarMenuButton tooltip="ログイン" className="w-full">
                <LogIn className="h-4 w-4" />
                <span>ログイン</span>
              </SidebarMenuButton>
            </SignInButton>

            <SignUpButton mode="modal">
              <SidebarMenuButton tooltip="新規登録" className="w-full">
                <UserPlus className="h-4 w-4" />
                <span>新規登録</span>
              </SidebarMenuButton>
            </SignUpButton>
          </div>
        </SignedOut>
        <SignedIn>
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "h-8 w-8 rounded-md",
                userButtonTrigger: cn(
                  "cursor-pointer rounded-md p-2 flex items-center gap-3 w-full justify-start",
                  "ring-offset-background transition-colors",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                ),
                userButtonBox: "flex flex-row-reverse items-center justify-end w-full",
              },
            }}
            showName={true}
          />
        </SignedIn>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
