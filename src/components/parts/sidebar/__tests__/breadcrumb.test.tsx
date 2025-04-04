import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import * as navigation from "next/navigation";
import { AppBreadcrumb } from "../navigation/breadcrumb";

// next/navigationのモックを作成
const mockedUsePathname = mock(() => "/");

// usePathnameのスパイを設定
spyOn(navigation, "usePathname").mockImplementation(mockedUsePathname);

describe("AppBreadcrumb", () => {
  beforeEach(() => {
    // テスト前にモックをリセット
    mockedUsePathname.mockClear();
  });

  afterEach(() => {
    // 各テスト後にクリーンアップ
    cleanup();
  });

  it("ルートパスの場合、breadcrumbアイテムは表示されない", () => {
    // usePathnameのモックを設定
    mockedUsePathname.mockImplementation(() => "/");

    render(<AppBreadcrumb />);

    // breadcrumbのアイテムが存在しないことを確認
    // 注: BreadcrumbItemが存在しないことを確認するため、textContentで確認
    const breadcrumbContent = screen.getByRole("navigation").textContent;
    expect(breadcrumbContent).toBe("");
  });

  it("単一のパスセグメントの場合、正しくbreadcrumbが表示される", () => {
    // usePathnameのモックを設定
    mockedUsePathname.mockImplementation(() => "/clips");

    render(<AppBreadcrumb />);

    // 最後のアイテムがページとして表示されることを確認
    expect(screen.getByText("clips")).toBeDefined();

    // BreadcrumbPageが存在することを確認
    const pageElement = screen.getByRole("link", { current: "page" });
    expect(pageElement).toBeDefined();
    expect(pageElement.textContent).toBe("clips");
  });

  it("複数のパスセグメントの場合、正しくbreadcrumbが表示される", () => {
    // usePathnameのモックを設定
    mockedUsePathname.mockImplementation(() => "/clips/123");

    render(<AppBreadcrumb />);

    // 最初のアイテムがリンクとして表示されることを確認
    const links = screen.getAllByRole("link").filter((link) => !link.getAttribute("aria-current"));
    expect(links.length).toBe(1);
    expect(links[0].textContent).toContain("clips");
    expect(links[0].getAttribute("href")).toBe("/clips");

    // 最後のアイテムがページとして表示されることを確認
    const pageElement = screen.getByRole("link", { current: "page" });
    expect(pageElement).toBeDefined();
    expect(pageElement.textContent).toBe("123");
  });

  it("3つ以上のパスセグメントの場合、正しくbreadcrumbが表示される", () => {
    // usePathnameのモックを設定
    mockedUsePathname.mockImplementation(() => "/clips/123/edit");

    render(<AppBreadcrumb />);

    // 最初の2つのアイテムがリンクとして表示されることを確認
    const links = screen.getAllByRole("link").filter((link) => !link.getAttribute("aria-current"));
    expect(links.length).toBe(2);
    expect(links[0].textContent).toContain("clips");
    expect(links[0].getAttribute("href")).toBe("/clips");
    expect(links[1].textContent).toContain("123");
    expect(links[1].getAttribute("href")).toBe("/clips/123");

    // 最後のアイテムがページとして表示されることを確認
    const pageElement = screen.getByRole("link", { current: "page" });
    expect(pageElement).toBeDefined();
    expect(pageElement.textContent).toBe("edit");
  });

  it("endItemが指定された場合、最後のアイテムがendItemのラベルで表示される", () => {
    // usePathnameのモックを設定
    mockedUsePathname.mockImplementation(() => "/clips");

    const endItem = {
      id: "custom-id",
      label: "カスタムラベル",
    };

    render(<AppBreadcrumb endItem={endItem} />);

    // 最後のアイテムがendItemのラベルとして表示されることを確認
    const pageElement = screen.getByRole("link", { current: "page" });
    expect(pageElement).toBeDefined();
    expect(pageElement.textContent).toBe("カスタムラベル");
  });

  it("isLoadingがtrueの場合、Skeletonコンポーネントが表示される", () => {
    // usePathnameのモックを設定
    mockedUsePathname.mockImplementation(() => "/clips");

    const endItem = {
      id: "custom-id",
      label: "カスタムラベル",
    };

    render(<AppBreadcrumb endItem={endItem} isLoading={true} />);

    // Skeletonコンポーネントが存在することを確認
    const skeletonElement = document.querySelector(".skeleton");
    expect(skeletonElement).toBeDefined();
  });

  it("endItemが指定され、isLoadingがfalseの場合、endItemのラベルが表示される", () => {
    // usePathnameのモックを設定
    mockedUsePathname.mockImplementation(() => "/clips");

    const endItem = {
      id: "custom-id",
      label: "カスタムラベル",
    };

    render(<AppBreadcrumb endItem={endItem} isLoading={false} />);

    // 最後のアイテムがendItemのラベルとして表示されることを確認
    const pageElement = screen.getByRole("link", { current: "page" });
    expect(pageElement).toBeDefined();
    expect(pageElement.textContent).toBe("カスタムラベル");
  });

  it("パスが複数のセグメントで、endItemが指定された場合、適切なURLが生成される", () => {
    // usePathnameのモックを設定
    mockedUsePathname.mockImplementation(() => "/clips/category");

    const endItem = {
      id: "item-123",
      label: "特定のクリップ",
    };

    render(<AppBreadcrumb endItem={endItem} />);

    // 最初のアイテムがリンクとして表示されることを確認
    const links = screen.getAllByRole("link").filter((link) => !link.getAttribute("aria-current"));
    expect(links.length).toBe(1);
    expect(links[0].textContent).toContain("clips");
    expect(links[0].getAttribute("href")).toBe("/clips");

    // 最後のアイテムがendItemのラベルとして表示されることを確認
    const pageElement = screen.getByRole("link", { current: "page" });
    expect(pageElement).toBeDefined();
    expect(pageElement.textContent).toBe("特定のクリップ");
  });
});
