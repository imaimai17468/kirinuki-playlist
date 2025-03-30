import { afterEach, describe, expect, it, jest } from "bun:test";
import { SidebarProvider } from "@/components/ui/sidebar";
import type { Video } from "@/repositories/videos/types";
import { cleanup, fireEvent, render } from "@testing-library/react";
import type { PlayerHandlers, PlayerState } from "../types";
import { VideoPlayerBar } from "../video-player-bar";

// モックデータ
const mockState: PlayerState = {
  currentIndex: 0,
  isStarted: true,
  isPlaying: true,
  isShuffleMode: false,
  isLoopMode: false,
  isPlayerBarMode: true,
};

// VideoPlayerBarはVideoのリストを受け取るようになったため、Video[]のモックを作成
const mockVideoList: Video[] = [
  {
    id: "video-1",
    title: "テスト動画1",
    url: "https://example.com/video1",
    start: 0,
    end: 60,
    author: {
      id: "author-1",
      name: "テスト作者",
      iconUrl: "https://example.com/icon.png",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    authorId: "author-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "video-2",
    title: "テスト動画2",
    url: "https://example.com/video2",
    start: 0,
    end: 60,
    author: {
      id: "author-1",
      name: "テスト作者",
      iconUrl: "https://example.com/icon.png",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    authorId: "author-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe("VideoPlayerBar", () => {
  // 各テスト後にクリーンアップ
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it("プレーヤーバーが正しくレンダリングされる", () => {
    const mockHandlers: PlayerHandlers = {
      toggleShuffle: jest.fn(),
      toggleLoop: jest.fn(),
      togglePlayerMode: jest.fn(),
      handlePlayPause: jest.fn(),
      handleNextTrack: jest.fn(),
      handlePreviousTrack: jest.fn(),
      handleStart: jest.fn(),
      onReady: jest.fn(),
      onEnd: jest.fn(),
      setState: jest.fn(),
    };
    const mockHandlePlayerClose = jest.fn();

    const { container } = render(
      <SidebarProvider>
        <VideoPlayerBar
          state={mockState}
          handlers={mockHandlers}
          videoList={mockVideoList}
          handlePlayerClose={mockHandlePlayerClose}
        />
      </SidebarProvider>,
    );

    // 現在の動画のタイトルが表示されていることを確認
    expect(container.textContent).toContain("テスト動画1");

    // 各ボタンが存在することを確認
    const togglePlayerModeButton = container.querySelector('button[aria-label="player-bar-close (video-player-open)"]');
    const previousTrackButton = container.querySelector('button[aria-label="前の動画"]');
    const playPauseButton = container.querySelector('button[aria-label="再生/停止"]');
    const nextTrackButton = container.querySelector('button[aria-label="次の動画"]');
    const closePlayerButton = container.querySelector('button[aria-label="player-close"]');

    expect(togglePlayerModeButton).toBeDefined();
    expect(previousTrackButton).toBeDefined();
    expect(playPauseButton).toBeDefined();
    expect(nextTrackButton).toBeDefined();
    expect(closePlayerButton).toBeDefined();
  });

  it("isPlayerBarModeがfalseの場合、プレーヤーバーは非表示になる", () => {
    const mockHandlers: PlayerHandlers = {
      toggleShuffle: jest.fn(),
      toggleLoop: jest.fn(),
      togglePlayerMode: jest.fn(),
      handlePlayPause: jest.fn(),
      handleNextTrack: jest.fn(),
      handlePreviousTrack: jest.fn(),
      handleStart: jest.fn(),
      onReady: jest.fn(),
      onEnd: jest.fn(),
      setState: jest.fn(),
    };
    const mockHandlePlayerClose = jest.fn();

    const { container } = render(
      <SidebarProvider>
        <VideoPlayerBar
          state={{ ...mockState, isPlayerBarMode: false }}
          handlers={mockHandlers}
          videoList={mockVideoList}
          handlePlayerClose={mockHandlePlayerClose}
        />
      </SidebarProvider>,
    );

    // translate-y-full クラスが適用されていることを確認
    const playerBar = container.querySelector("div[class*='fixed bottom-0']");
    expect(playerBar?.className).toContain("translate-y-full");
  });

  it("再生中の場合、一時停止ボタンが表示される", () => {
    const mockHandlers: PlayerHandlers = {
      toggleShuffle: jest.fn(),
      toggleLoop: jest.fn(),
      togglePlayerMode: jest.fn(),
      handlePlayPause: jest.fn(),
      handleNextTrack: jest.fn(),
      handlePreviousTrack: jest.fn(),
      handleStart: jest.fn(),
      onReady: jest.fn(),
      onEnd: jest.fn(),
      setState: jest.fn(),
    };
    const mockHandlePlayerClose = jest.fn();

    const { container } = render(
      <SidebarProvider>
        <VideoPlayerBar
          state={{ ...mockState, isPlaying: true }}
          handlers={mockHandlers}
          videoList={mockVideoList}
          handlePlayerClose={mockHandlePlayerClose}
        />
      </SidebarProvider>,
    );

    // Pauseアイコンが含まれていることを確認
    const pauseIcon = container.querySelector(".lucide-pause");
    expect(pauseIcon).not.toBeNull();
  });

  it("一時停止中の場合、再生ボタンが表示される", () => {
    const mockHandlers: PlayerHandlers = {
      toggleShuffle: jest.fn(),
      toggleLoop: jest.fn(),
      togglePlayerMode: jest.fn(),
      handlePlayPause: jest.fn(),
      handleNextTrack: jest.fn(),
      handlePreviousTrack: jest.fn(),
      handleStart: jest.fn(),
      onReady: jest.fn(),
      onEnd: jest.fn(),
      setState: jest.fn(),
    };
    const mockHandlePlayerClose = jest.fn();

    const { container } = render(
      <SidebarProvider>
        <VideoPlayerBar
          state={{ ...mockState, isPlaying: false }}
          handlers={mockHandlers}
          videoList={mockVideoList}
          handlePlayerClose={mockHandlePlayerClose}
        />
      </SidebarProvider>,
    );

    // Playアイコンが含まれていることを確認
    const playIcon = container.querySelector(".lucide-play");
    expect(playIcon).not.toBeNull();
  });

  it("各ボタンをクリックすると対応するハンドラーが呼ばれる", () => {
    const mockHandlers: PlayerHandlers = {
      toggleShuffle: jest.fn(),
      toggleLoop: jest.fn(),
      togglePlayerMode: jest.fn(),
      handlePlayPause: jest.fn(),
      handleNextTrack: jest.fn(),
      handlePreviousTrack: jest.fn(),
      handleStart: jest.fn(),
      onReady: jest.fn(),
      onEnd: jest.fn(),
      setState: jest.fn(),
    };
    const mockHandlePlayerClose = jest.fn();

    const { container } = render(
      <SidebarProvider>
        <VideoPlayerBar
          state={mockState}
          handlers={mockHandlers}
          videoList={mockVideoList}
          handlePlayerClose={mockHandlePlayerClose}
        />
      </SidebarProvider>,
    );

    // 各ボタンを取得
    const togglePlayerModeButton = container.querySelector('button[aria-label="player-bar-close (video-player-open)"]');
    const previousTrackButton = container.querySelector('button[aria-label="前の動画"]');
    const playPauseButton = container.querySelector('button[aria-label="再生/停止"]');
    const nextTrackButton = container.querySelector('button[aria-label="次の動画"]');
    const closePlayerButton = container.querySelector('button[aria-label="player-close"]');

    // 各ボタンをクリックして、対応するハンドラーが呼ばれることを確認
    if (togglePlayerModeButton) fireEvent.click(togglePlayerModeButton);
    expect(mockHandlers.togglePlayerMode).toHaveBeenCalledTimes(1);

    if (previousTrackButton) fireEvent.click(previousTrackButton);
    expect(mockHandlers.handlePreviousTrack).toHaveBeenCalledTimes(1);

    if (playPauseButton) fireEvent.click(playPauseButton);
    expect(mockHandlers.handlePlayPause).toHaveBeenCalledTimes(1);

    if (nextTrackButton) fireEvent.click(nextTrackButton);
    expect(mockHandlers.handleNextTrack).toHaveBeenCalledTimes(1);

    if (closePlayerButton) fireEvent.click(closePlayerButton);
    expect(mockHandlePlayerClose).toHaveBeenCalledTimes(1);
  });
});
