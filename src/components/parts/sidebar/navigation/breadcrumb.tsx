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
import React from "react";

export type CustomBreadcrumbItem = {
  id: string;
  label: string;
  position: number; // パス配列の末尾からの位置 (0が最後、1が最後から2番目...)
};

type BreadcrumbItemType = {
  title: string;
  url: string;
};

type Props = {
  customItems?: CustomBreadcrumbItem[];
};

export const AppBreadcrumb = ({ customItems = [] }: Props) => {
  const pathname = usePathname();

  // 現在のパスからパンくずの初期アイテムを作成
  const pathItems = pathname
    .split("/")
    .slice(1)
    .map((item: string, index: number, array: string[]) => ({
      title: item,
      url: `/${array.slice(0, index + 1).join("/")}`,
    }));

  let breadcrumbItems: BreadcrumbItemType[] = [];

  if (customItems.length > 0) {
    // カスタムアイテムを使用する場合

    // カスタムアイテムをposition順に並べ替え（大きい順＝トップに近い順）
    const sortedCustomItems = [...customItems].sort((a, b) => b.position - a.position);

    // 現在のURLパスの構造（末尾部分）
    const baseUrls = pathItems.map((item) => item.url);
    const currentUrl = baseUrls.length > 0 ? baseUrls[baseUrls.length - 1] : "";

    // カスタムアイテムからパンくずを構築
    breadcrumbItems = sortedCustomItems.map((customItem, index) => {
      // 最後のアイテム（position = 0）の場合、現在のURLに対して構築
      if (customItem.position === 0 && baseUrls.length > 0) {
        return {
          title: customItem.label,
          url: `${currentUrl}/${customItem.id}`,
        };
      }

      // 中間のアイテム - 通常はURLパスの一部を使用
      const pathItemIndex = baseUrls.length - 1 - customItem.position;
      if (pathItemIndex >= 0 && pathItemIndex < baseUrls.length) {
        // 既存のパスアイテムに対応するものがあればそのURLを使用
        return {
          title: customItem.label,
          url: baseUrls[pathItemIndex],
        };
      }

      // パスにない位置のカスタムアイテム（トップに近いもの）
      // 親のURL + IDのパターンでビルド
      const parentIndex = index + 1;
      const parentItem = breadcrumbItems[parentIndex];
      const parentUrl = parentItem ? parentItem.url.split("/").slice(0, -1).join("/") : "";

      return {
        title: customItem.label,
        url: parentUrl ? `${parentUrl}/${customItem.id}` : `/${customItem.id}`,
      };
    });

    // カスタムアイテムが存在しない位置のパスアイテム（もしあれば）を追加
    const customPositions = new Set(customItems.map((item) => item.position));
    const defaultItems = pathItems.filter((_, index, items) => {
      const positionFromEnd = items.length - 1 - index;
      return !customPositions.has(positionFromEnd);
    });

    // 全アイテムをpositionに基づいて結合（カスタムの方を優先）
    breadcrumbItems = [...defaultItems, ...breadcrumbItems].sort((a, b) => {
      // URLのセグメント数でソート（短い方が先）
      const aDepth = a.url.split("/").filter(Boolean).length;
      const bDepth = b.url.split("/").filter(Boolean).length;
      return aDepth - bDepth;
    });
  } else {
    // カスタムアイテムがない場合はそのままpathItemsを使用
    breadcrumbItems = pathItems;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item: BreadcrumbItemType, index: number) => (
          <React.Fragment key={`${item.url}-${index}`}>
            <BreadcrumbItem>
              {index < breadcrumbItems.length - 1 ? (
                <BreadcrumbLink href={item.url}>{item.title}</BreadcrumbLink>
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
