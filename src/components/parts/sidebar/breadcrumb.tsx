"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";

export function AppBreadcrumb() {
  const pathname = usePathname();
  const breadcrumbItems = pathname
    .split("/")
    .slice(1)
    .map((item) => ({
      title: item,
      url: `/${item}`,
    }));

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <BreadcrumbItem key={item.url}>
            {index < breadcrumbItems.length - 1 ? (
              <>
                <BreadcrumbLink href={item.url}>{item.title}</BreadcrumbLink>
                <BreadcrumbSeparator />
              </>
            ) : (
              <BreadcrumbPage>{item.title}</BreadcrumbPage>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
