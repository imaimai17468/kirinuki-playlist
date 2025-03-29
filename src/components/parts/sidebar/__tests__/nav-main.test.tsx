import { afterEach, describe, expect, it } from "bun:test";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { Clapperboard, ListMusic, Settings, User } from "lucide-react";
import { NavMain } from "../navigation/nav-main";

// モックデータ
const mockNavItems = [
  {
    title: "Clips",
    url: "/clips",
    icon: Clapperboard,
  },
  {
    title: "Playlists",
    url: "/playlists",
    icon: ListMusic,
  },
];

const mockMyPageNavItems = [
  {
    title: "プロフィール",
    url: "/profile",
    icon: User,
  },
];

const mockCollapsibleItems = [
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    isActive: false,
    items: [
      {
        title: "General",
        url: "/settings/general",
      },
      {
        title: "Account",
        url: "/settings/account",
      },
    ],
  },
];

describe("NavMain", () => {
  // 各テスト後にクリーンアップ
  afterEach(() => {
    cleanup();
  });

  it("通常のナビゲーション項目が正しくレンダリングされる", () => {
    const { container } = render(
      <SidebarProvider>
        <NavMain navItems={mockNavItems} collapsibleItems={[]} myPageNavItems={mockMyPageNavItems} />
      </SidebarProvider>,
    );

    // "Clips"と"Playlists"が表示されていることを確認
    const clipsElement = container.querySelector('a[href="/clips"]');
    const playlistsElement = container.querySelector('a[href="/playlists"]');

    expect(clipsElement).toBeDefined();
    expect(playlistsElement).toBeDefined();

    // テキストが正しいことを確認
    expect(clipsElement?.textContent).toContain("Clips");
    expect(playlistsElement?.textContent).toContain("Playlists");

    // リンクが正しいURLを指していることを確認
    expect(clipsElement?.getAttribute("href")).toBe("/clips");
    expect(playlistsElement?.getAttribute("href")).toBe("/playlists");
  });

  it("マイページのナビゲーション項目が正しくレンダリングされる", () => {
    const { container } = render(
      <SidebarProvider>
        <NavMain navItems={[]} collapsibleItems={[]} myPageNavItems={mockMyPageNavItems} />
      </SidebarProvider>,
    );

    // プロフィールリンクが表示されていることを確認
    const profileElement = container.querySelector('a[href="/profile"]');
    expect(profileElement).toBeDefined();
    expect(profileElement?.textContent).toContain("プロフィール");
  });

  it("折りたたみ可能な項目が正しくレンダリングされる", () => {
    const { container } = render(
      <SidebarProvider>
        <NavMain navItems={[]} collapsibleItems={mockCollapsibleItems} myPageNavItems={mockMyPageNavItems} />
      </SidebarProvider>,
    );

    // "Settings"が表示されていることを確認
    const settingsElement = container.querySelector(".group\\/collapsible");
    expect(settingsElement).toBeDefined();
    const settingsButton = settingsElement?.querySelector("button");
    expect(settingsButton?.textContent).toContain("Settings");

    // 初期状態では子項目は表示されていないことを確認
    const generalElement = container.querySelector('a[href="/settings/general"]');
    const accountElement = container.querySelector('a[href="/settings/account"]');

    // 要素は存在するが表示されていないはず
    expect(generalElement).toBeNull();
    expect(accountElement).toBeNull();
  });

  it("折りたたみ可能な項目をクリックすると子項目が表示される", () => {
    const { container } = render(
      <SidebarProvider>
        <NavMain navItems={[]} collapsibleItems={mockCollapsibleItems} myPageNavItems={mockMyPageNavItems} />
      </SidebarProvider>,
    );

    // "Settings"ボタンを見つけてクリック
    const settingsElement = container.querySelector(".group\\/collapsible");
    const settingsButton = settingsElement?.querySelector("button");
    expect(settingsButton).toBeDefined();

    if (settingsButton) {
      fireEvent.click(settingsButton);
    }

    // 子項目が表示されることを確認
    const generalElement = container.querySelector('a[href="/settings/general"]');
    const accountElement = container.querySelector('a[href="/settings/account"]');

    expect(generalElement).toBeDefined();
    expect(accountElement).toBeDefined();

    // テキストが正しいことを確認
    expect(generalElement?.textContent).toContain("General");
    expect(accountElement?.textContent).toContain("Account");

    // リンクが正しいURLを指していることを確認
    expect(generalElement?.getAttribute("href")).toBe("/settings/general");
    expect(accountElement?.getAttribute("href")).toBe("/settings/account");
  });

  it("isActiveがtrueの場合、初期状態で子項目が表示される", () => {
    const activeCollapsibleItems = [
      {
        ...mockCollapsibleItems[0],
        isActive: true,
      },
    ];

    const { container } = render(
      <SidebarProvider>
        <NavMain navItems={[]} collapsibleItems={activeCollapsibleItems} myPageNavItems={mockMyPageNavItems} />
      </SidebarProvider>,
    );

    // 初期状態で子項目が表示されていることを確認
    const generalElement = container.querySelector('a[href="/settings/general"]');
    const accountElement = container.querySelector('a[href="/settings/account"]');

    expect(generalElement).toBeDefined();
    expect(accountElement).toBeDefined();

    // テキストが正しいことを確認
    expect(generalElement?.textContent).toContain("General");
    expect(accountElement?.textContent).toContain("Account");
  });

  it("すべての項目が正しくレンダリングされる", () => {
    const { container } = render(
      <SidebarProvider>
        <NavMain navItems={mockNavItems} collapsibleItems={mockCollapsibleItems} myPageNavItems={mockMyPageNavItems} />
      </SidebarProvider>,
    );

    // 通常のナビゲーション項目が表示されていることを確認
    const clipsElement = container.querySelector('a[href="/clips"]');
    const playlistsElement = container.querySelector('a[href="/playlists"]');
    const profileElement = container.querySelector('a[href="/profile"]');

    expect(clipsElement).toBeDefined();
    expect(playlistsElement).toBeDefined();
    expect(profileElement).toBeDefined();

    // 折りたたみ可能な項目が表示されていることを確認
    const settingsElement = container.querySelector(".group\\/collapsible");
    expect(settingsElement).toBeDefined();

    // Settingsテキストを含むボタン要素を検索
    const settingsButton = settingsElement?.querySelector("button");
    expect(settingsButton?.textContent).toContain("Settings");
  });
});
