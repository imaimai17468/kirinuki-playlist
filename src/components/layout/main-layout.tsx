import { Header } from "@/components/parts/header";
import { AppSidebar } from "@/components/parts/sidebar/app-sidebar";
import { AppBreadcrumb } from "@/components/parts/sidebar/breadcrumb";
import { VideoPlayer } from "@/components/parts/video-player";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

type MainLayoutProps = {
  children: React.ReactNode;
};

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <AppBreadcrumb />
          </div>
        </header>
        <main className="px-4">
          <Header />
          <VideoPlayer />
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
