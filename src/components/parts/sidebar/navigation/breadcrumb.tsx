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
import * as R from "remeda";

export type CustomBreadcrumbItem = {
  id: string;
  label: string;
  position: number; // パス配列の末尾からの位置 (0が最後、1が最後から2番目...)
};

type Props = {
  customItems?: CustomBreadcrumbItem[];
};

export const AppBreadcrumb = ({ customItems = [] }: Props) => {
  const pathname = usePathname();

  // 全処理を一度にパイプラインで処理
  const breadcrumbItems = R.pipe(
    // 1. パス文字列からパンくずアイテムを作成
    pathname
      .split("/")
      .slice(1),
    R.map((segment, index, array) => ({
      title: segment,
      url: `/${array.slice(0, index + 1).join("/")}`,
    })),
    // 2. カスタムアイテムがあれば適用
    (pathItems) => {
      if (R.isEmpty(customItems)) return pathItems;

      // 3. URLのベース部分とカスタムアイテムの準備
      const baseUrls = R.map(pathItems, (item) => item.url);
      const currentUrl = R.last(baseUrls) ?? "";
      const sortedCustoms = R.sortBy(customItems, (item) => -item.position);

      // 4. カスタム位置とデフォルト位置を取得
      const positions = new Set(R.map(customItems, (item) => item.position));

      // 5. デフォルトアイテムとカスタムアイテムを処理して結合
      return R.pipe(
        [
          // デフォルトアイテム（カスタムで置き換えられていないもの）
          ...R.filter(pathItems, (_, index) => !positions.has(pathItems.length - 1 - index)),

          // カスタムアイテム
          ...R.map(sortedCustoms, (customItem, index) => {
            // 最後のアイテム（position = 0）の場合
            if (customItem.position === 0) {
              return {
                title: customItem.label,
                url: `${currentUrl}/${customItem.id}`,
              };
            }

            // 中間のアイテム - 通常はURLパスの一部を使用
            const pathIdx = baseUrls.length - 1 - customItem.position;
            if (pathIdx >= 0 && pathIdx < baseUrls.length) {
              return {
                title: customItem.label,
                url: baseUrls[pathIdx],
              };
            }

            // パスにない位置のカスタムアイテム
            const parentIdx = index + 1;
            const parentUrl =
              parentIdx < sortedCustoms.length
                ? (baseUrls[baseUrls.length - 1 - sortedCustoms[parentIdx].position] || "")
                    .split("/")
                    .slice(0, -1)
                    .join("/")
                : "";

            return {
              title: customItem.label,
              url: parentUrl ? `${parentUrl}/${customItem.id}` : `/${customItem.id}`,
            };
          }),
        ],
        // URLの深さでソート
        R.sortBy((item) => item.url.split("/").filter(Boolean).length),
      );
    },
  );

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
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
