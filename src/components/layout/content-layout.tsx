import { ModeToggle } from "@/components/parts/mode-toggle";
import { AppBreadcrumb, type CustomBreadcrumbItem } from "@/components/parts/sidebar/navigation/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

type Props = {
  children: React.ReactNode;
  customItems?: CustomBreadcrumbItem[];
};

export const ContentLayout: React.FC<Props> = ({ children, customItems }) => {
  return (
    <div className="flex flex-col mb-16">
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex justify-between w-full pr-4">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <AppBreadcrumb customItems={customItems} />
          </div>
          <ModeToggle />
        </div>
      </header>
      {children}
    </div>
  );
};
