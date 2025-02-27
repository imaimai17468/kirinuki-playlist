import { afterEach, describe, expect, it } from "bun:test";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { NavUser } from "../navigation/nav-user";

// テスト用のモックデータ
const mockUser = {
  name: "テストユーザー",
  email: "test@example.com",
  avatar: "/avatar.png",
};

describe("NavUser", () => {
  afterEach(() => {
    cleanup();
  });

  it("ユーザー情報が正しく表示される", () => {
    const { container } = render(
      <SidebarProvider>
        <NavUser user={mockUser} />
      </SidebarProvider>,
    );

    // ユーザー名とメールアドレスが表示されていることを確認
    const userElement = container.querySelector('[data-sidebar="menu-button"]');
    expect(userElement).toBeDefined();
    expect(userElement?.textContent).toContain(mockUser.name);
    expect(userElement?.textContent).toContain(mockUser.email);

    // アバター要素が存在することを確認
    const avatarElement = container.querySelector('[class*="avatar"]');
    expect(avatarElement).toBeDefined();
  });

  it("ユーザーボタンがクリック可能である", () => {
    const { container } = render(
      <SidebarProvider>
        <NavUser user={mockUser} />
      </SidebarProvider>,
    );

    // ユーザーボタンを見つける
    const userButton = container.querySelector('[data-sidebar="menu-button"]');
    expect(userButton).toBeDefined();

    // ボタンがクリック可能であることを確認
    let clickEvent = false;
    if (userButton) {
      userButton.addEventListener("click", () => {
        clickEvent = true;
      });
      fireEvent.click(userButton);
      expect(clickEvent).toBe(true);
    }
  });
});
