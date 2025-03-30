import { afterEach, describe, expect, it, jest } from "bun:test";
import type { Playlist, PlaylistVideo } from "@/repositories/playlists/types";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { MultiVideoPlayer } from "../multi-video-player";
import type { PlayerHandlers, PlayerState } from "../types";

// モックデータ
const mockState: PlayerState = {
  currentIndex: 0,
  isStarted: true,
  isPlaying: true,
  isShuffleMode: false,
  isLoopMode: false,
  isPlayerBarMode: false,
};

// Video型のモックデータを作成
const mockVideoList: PlaylistVideo[] = [
  {
    id: "video-1",
    title: "テスト動画1",
    url: "https://www.youtube.com/watch?v=video1",
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
    order: 0,
  },
  {
    id: "video-2",
    title: "テスト動画2",
    url: "https://www.youtube.com/watch?v=video2",
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
    order: 1,
  },
];

// Playlistのモックも更新
const mockPlaylist: Playlist = {
  id: "playlist-1",
  title: "テストプレイリスト",
  author: {
    id: "author-1",
    name: "テスト作者",
    iconUrl: "https://example.com/icon.png",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  authorId: "author-1",
  videos: mockVideoList,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// 共通のモックハンドラー
const createMockHandlers = (): PlayerHandlers => ({
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
});

describe("MultiVideoPlayer", () => {
  // 各テスト後にクリーンアップ
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it("プレーヤーが正しくレンダリングされる", () => {
    const mockHandlers = createMockHandlers();
    const mockHandlePlayerClose = jest.fn();

    const { container } = render(
      <MultiVideoPlayer
        state={mockState}
        handlers={mockHandlers}
        playlist={mockPlaylist}
        videoList={mockVideoList}
        handlePlayerClose={mockHandlePlayerClose}
      />,
    );

    // 基本情報が表示されていることを確認
    expect(container.textContent).toContain("テストプレイリスト");
    expect(container.textContent).toContain("テスト動画1");
    expect(container.textContent).toContain("テスト動画2");

    // 必要なコントロールボタンが存在することを確認
    expect(container.querySelector('button[aria-label="シャッフル"]')).not.toBeNull();
    expect(container.querySelector('button[aria-label="前の動画"]')).not.toBeNull();
    expect(container.querySelector('button[aria-label="再生/停止"]')).not.toBeNull();
    expect(container.querySelector('button[aria-label="次の動画"]')).not.toBeNull();
    expect(container.querySelector('button[aria-label="ループ"]')).not.toBeNull();
  });

  it("プレーヤーモードの切り替えが正しく動作する", () => {
    const mockHandlers = createMockHandlers();
    const mockHandlePlayerClose = jest.fn();

    // プレーヤーバーモードの場合（非表示）
    const { container, rerender } = render(
      <MultiVideoPlayer
        state={{ ...mockState, isPlayerBarMode: true }}
        handlers={mockHandlers}
        playlist={mockPlaylist}
        videoList={mockVideoList}
        handlePlayerClose={mockHandlePlayerClose}
      />,
    );

    // プレーヤーバーモードの場合、特定のスタイルが適用されていることを確認
    // 実際のクラス名は異なる可能性があるため、コンテナ全体のクラス名を確認
    expect(container.innerHTML).toContain("translate-y-[calc(100%+1rem)]");

    // 通常モードの場合（表示）
    rerender(
      <MultiVideoPlayer
        state={{ ...mockState, isPlayerBarMode: false }}
        handlers={mockHandlers}
        playlist={mockPlaylist}
        videoList={mockVideoList}
        handlePlayerClose={mockHandlePlayerClose}
      />,
    );

    // 通常モードの場合、特定のスタイルが適用されていないことを確認
    expect(container.innerHTML).not.toContain("translate-y-[calc(100%+1rem)]");
  });

  it("再生状態に応じて適切なアイコンが表示される", () => {
    const mockHandlers = createMockHandlers();
    const mockHandlePlayerClose = jest.fn();

    // 再生中の場合
    const { container, rerender } = render(
      <MultiVideoPlayer
        state={{ ...mockState, isPlaying: true }}
        handlers={mockHandlers}
        playlist={mockPlaylist}
        videoList={mockVideoList}
        handlePlayerClose={mockHandlePlayerClose}
      />,
    );

    // Pauseアイコンが表示されることを確認
    expect(container.querySelector(".lucide-pause")).not.toBeNull();
    expect(container.querySelector(".lucide-play")).toBeNull();

    // 一時停止中の場合
    rerender(
      <MultiVideoPlayer
        state={{ ...mockState, isPlaying: false }}
        handlers={mockHandlers}
        playlist={mockPlaylist}
        videoList={mockVideoList}
        handlePlayerClose={mockHandlePlayerClose}
      />,
    );

    // Playアイコンが表示されることを確認
    expect(container.querySelector(".lucide-play")).not.toBeNull();
    expect(container.querySelector(".lucide-pause")).toBeNull();
  });

  it("モード切替ボタンの状態が正しく表示される", () => {
    const mockHandlers = createMockHandlers();
    const mockHandlePlayerClose = jest.fn();

    // 通常モード
    const { container, rerender } = render(
      <MultiVideoPlayer
        state={mockState}
        handlers={mockHandlers}
        playlist={mockPlaylist}
        videoList={mockVideoList}
        handlePlayerClose={mockHandlePlayerClose}
      />,
    );

    // シャッフルとループボタンが通常表示
    const shuffleButton = container.querySelector('button[aria-label="シャッフル"]');
    const loopButton = container.querySelector('button[aria-label="ループ"]');
    expect(shuffleButton?.className).not.toContain("text-green-500");
    expect(loopButton?.className).not.toContain("text-green-500");

    // シャッフルモードオン
    rerender(
      <MultiVideoPlayer
        state={{ ...mockState, isShuffleMode: true }}
        handlers={mockHandlers}
        playlist={mockPlaylist}
        videoList={mockVideoList}
        handlePlayerClose={mockHandlePlayerClose}
      />,
    );

    // シャッフルボタンがハイライト表示
    const shuffleButtonHighlighted = container.querySelector('button[aria-label="シャッフル"]');
    expect(shuffleButtonHighlighted?.className).toContain("text-green-500");

    // ループモードオン
    rerender(
      <MultiVideoPlayer
        state={{ ...mockState, isShuffleMode: false, isLoopMode: true }}
        handlers={mockHandlers}
        playlist={mockPlaylist}
        videoList={mockVideoList}
        handlePlayerClose={mockHandlePlayerClose}
      />,
    );

    // ループボタンがハイライト表示
    const loopButtonHighlighted = container.querySelector('button[aria-label="ループ"]');
    expect(loopButtonHighlighted?.className).toContain("text-green-500");
  });

  it("ユーザーインタラクションが正しく処理される", () => {
    const mockHandlers = createMockHandlers();
    const mockHandlePlayerClose = jest.fn();

    const { container } = render(
      <MultiVideoPlayer
        state={mockState}
        handlers={mockHandlers}
        playlist={mockPlaylist}
        videoList={mockVideoList}
        handlePlayerClose={mockHandlePlayerClose}
      />,
    );

    // 各ボタンをクリックしてハンドラーが呼ばれることを確認
    const buttons = {
      togglePlayerMode: container.querySelector('button[aria-label="video-player-close (player-bar-open)"]'),
      shuffle: container.querySelector('button[aria-label="シャッフル"]'),
      previous: container.querySelector('button[aria-label="前の動画"]'),
      playPause: container.querySelector('button[aria-label="再生/停止"]'),
      next: container.querySelector('button[aria-label="次の動画"]'),
      loop: container.querySelector('button[aria-label="ループ"]'),
      close: container.querySelector('button[aria-label="player-close"]'),
    };

    // 各ボタンをクリック
    if (buttons.togglePlayerMode) fireEvent.click(buttons.togglePlayerMode);
    if (buttons.shuffle) fireEvent.click(buttons.shuffle);
    if (buttons.previous) fireEvent.click(buttons.previous);
    if (buttons.playPause) fireEvent.click(buttons.playPause);
    if (buttons.next) fireEvent.click(buttons.next);
    if (buttons.loop) fireEvent.click(buttons.loop);
    if (buttons.close) fireEvent.click(buttons.close);

    // 各ハンドラーが呼ばれたことを確認
    expect(mockHandlers.togglePlayerMode).toHaveBeenCalledTimes(1);
    expect(mockHandlers.toggleShuffle).toHaveBeenCalledTimes(1);
    expect(mockHandlers.handlePreviousTrack).toHaveBeenCalledTimes(1);
    expect(mockHandlers.handlePlayPause).toHaveBeenCalledTimes(1);
    expect(mockHandlers.handleNextTrack).toHaveBeenCalledTimes(1);
    expect(mockHandlers.toggleLoop).toHaveBeenCalledTimes(1);
    expect(mockHandlePlayerClose).toHaveBeenCalledTimes(1);
  });

  it("プレイリスト内の動画選択が正しく動作する", () => {
    const mockHandlers = createMockHandlers();
    const mockHandlePlayerClose = jest.fn();

    // setStateの動作をシミュレート
    let selectedIndex = -1;
    mockHandlers.setState = jest.fn((callback) => {
      // コールバック関数を実行して結果を保存
      const result = callback({ ...mockState, currentIndex: 0 });
      selectedIndex = result.currentIndex;
      return undefined;
    });

    const { container } = render(
      <MultiVideoPlayer
        state={mockState}
        handlers={mockHandlers}
        playlist={mockPlaylist}
        videoList={mockVideoList}
        handlePlayerClose={mockHandlePlayerClose}
      />,
    );

    // プレイリスト内の動画ボタンを取得
    const videoButtons = container.querySelectorAll("button[type='button']");
    expect(videoButtons.length).toBe(2);

    // 2番目の動画をクリック
    fireEvent.click(videoButtons[1]);

    // setStateが呼ばれることを確認
    expect(mockHandlers.setState).toHaveBeenCalled();

    // 選択されたインデックスが正しいことを確認
    expect(selectedIndex).toBe(1);
  });
});
