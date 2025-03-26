"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { usePathname } from "next/navigation";
import React from "react";

type Props = {
  endItem?: {
    id: string;
    label: string;
  };
  isLoading?: boolean;
};

export const AppBreadcrumb = ({ endItem, isLoading }: Props) => {
  const pathname = usePathname();

  const pathItems = pathname
    .split("/")
    .slice(1)
    .map((item, index, array) => ({
      title: item,
      url: `/${array.slice(0, index + 1).join("/")}`,
    }));

  const breadcrumbItems =
    endItem && pathItems.length > 0
      ? [
          ...pathItems.slice(0, -1),
          {
            title: endItem.label,
            url: `${pathItems[pathItems.length - 1].url}/${endItem.id}`,
          },
        ]
      : pathItems;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.url}>
            <BreadcrumbItem>
              {index < breadcrumbItems.length - 1 ? (
                <BreadcrumbLink href={item.url}>{item.title}</BreadcrumbLink>
              ) : isLoading && endItem ? (
                <BreadcrumbPage>
                  <Skeleton className="h-4 w-24" />
                </BreadcrumbPage>
              ) : (
                <BreadcrumbPage>{item.title}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
