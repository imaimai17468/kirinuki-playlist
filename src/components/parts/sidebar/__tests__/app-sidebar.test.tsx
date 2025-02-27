import { afterEach, describe, expect, it } from "bun:test";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cleanup, render } from "@testing-library/react";
import { AppSidebar } from "../app-sidebar";

describe("AppSidebar", () => {
  afterEach(() => {
    cleanup();
  });

  it("サイドバーが正しくレンダリングされる", () => {
    const { container } = render(
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>,
    );

    // サイドバーのクラスを確認
    const sidebar = container.querySelector(".group\\/sidebar-wrapper");
    expect(sidebar).toBeDefined();
  });

  it("ヘッダーにアプリ名が表示される", () => {
    const { container } = render(
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>,
    );

    // ヘッダーにアプリ名が表示されていることを確認
    const appName = container.querySelector("p.text-2xl.font-bold");
    expect(appName).toBeDefined();
    expect(appName?.textContent).toContain("Kirinukist");
  });

  it("NavMainコンポーネントが表示される", () => {
    const { container } = render(
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>,
    );

    // NavMainコンポーネントが存在することを確認
    // SidebarContentの中にNavMainが含まれているはず
    const sidebarContent = container.querySelector('[data-sidebar="group"]');
    expect(sidebarContent).toBeDefined();
  });

  it("NavUserコンポーネントが表示される", () => {
    const { container } = render(
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>,
    );

    // NavUserコンポーネントが存在することを確認
    // ユーザー情報を含む要素が存在するか確認
    const userElement = container.querySelector('[data-sidebar="user"]');
    expect(userElement).toBeDefined();
  });
});
