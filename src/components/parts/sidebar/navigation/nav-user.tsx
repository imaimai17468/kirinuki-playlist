import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CLIENT_PATH } from "@/consts/clientpath";
import { cn } from "@/libs/utils";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { LogIn, UserPlus } from "lucide-react";

export const NavUser = () => {
  const { state, isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SignedOut>
          <div className="flex flex-col gap-2">
            <SignInButton mode="modal" forceRedirectUrl={CLIENT_PATH.CLIPS}>
              <SidebarMenuButton tooltip="ログイン" className="w-full">
                <LogIn className="h-4 w-4" />
                <span>ログイン</span>
              </SidebarMenuButton>
            </SignInButton>

            <SignUpButton mode="modal" forceRedirectUrl={CLIENT_PATH.CLIPS}>
              <SidebarMenuButton tooltip="新規登録" className="w-full">
                <UserPlus className="h-4 w-4" />
                <span>新規登録</span>
              </SidebarMenuButton>
            </SignUpButton>
          </div>
        </SignedOut>
        <SignedIn>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full">
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: cn(
                        "h-8 w-8 rounded-md shrink-0",
                        "group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6",
                      ),
                      userButtonTrigger: cn(
                        "cursor-pointer rounded-md p-2 flex items-center gap-3 w-full justify-start",
                        "ring-offset-background transition-colors",
                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        "group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 group-data-[collapsible=icon]:justify-center",
                      ),
                      userButtonBox: cn(
                        "flex flex-row-reverse items-center justify-end w-full",
                        "group-data-[collapsible=icon]:flex-row group-data-[collapsible=icon]:justify-center",
                      ),
                      userButtonOuterIdentifier: "group-data-[collapsible=icon]:hidden",
                    },
                  }}
                  showName={true}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" align="center" hidden={state !== "collapsed" || isMobile}>
              プロフィール
            </TooltipContent>
          </Tooltip>
        </SignedIn>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
