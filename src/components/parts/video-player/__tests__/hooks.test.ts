import { describe, expect, it, jest } from "bun:test";
import type { Video } from "@/repositories/videos/types";
import { act, renderHook } from "@testing-library/react";
import { useVideoPlayer } from "../hooks";

const videoList: Video[] = [
  {
    id: "video1",
    url: "url1",
    start: 0,
    end: 60,
    title: "Video 1",
    author: {
      id: "author1",
      name: "Author 1",
      iconUrl: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    authorId: "author1",
    tags: [
      {
        id: "tag-1",
        name: "テストタグ1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "video2",
    url: "url2",
    start: 0,
    end: 60,
    title: "Video 2",
    author: {
      id: "author1",
      name: "Author 1",
      iconUrl: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    authorId: "author1",
    tags: [
      {
        id: "tag-1",
        name: "テストタグ1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "video3",
    url: "url3",
    start: 0,
    end: 60,
    title: "Video 3",
    author: {
      id: "author1",
      name: "Author 1",
      iconUrl: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    authorId: "author1",
    tags: [
      {
        id: "tag-1",
        name: "テストタグ1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe("useVideoPlayer", () => {
  it("stateが全て正しく返される", () => {
    const { result } = renderHook(() => useVideoPlayer({ videoList: [] }));
    expect(result.current.state).toEqual({
      currentIndex: 0,
      isStarted: false,
      isPlaying: true,
      isShuffleMode: false,
      isLoopMode: false,
      isPlayerBarMode: false,
    });
  });

  it("toggleShuffleでシャッフルモードが切り替わる", () => {
    const { result } = renderHook(() => useVideoPlayer({ videoList: [] }));

    act(() => {
      result.current.handlers.toggleShuffle();
    });

    expect(result.current.state.isShuffleMode).toBe(true);

    act(() => {
      result.current.handlers.toggleShuffle();
    });

    expect(result.current.state.isShuffleMode).toBe(false);
  });

  it("toggleLoopでループモードが切り替わる", () => {
    const { result } = renderHook(() => useVideoPlayer({ videoList: [] }));

    act(() => {
      result.current.handlers.toggleLoop();
    });

    expect(result.current.state.isLoopMode).toBe(true);

    act(() => {
      result.current.handlers.toggleLoop();
    });

    expect(result.current.state.isLoopMode).toBe(false);
  });

  it("togglePlayerModeでプレイヤーバーモードが切り替わる", () => {
    const { result } = renderHook(() => useVideoPlayer({ videoList: [] }));

    act(() => {
      result.current.handlers.togglePlayerMode();
    });

    expect(result.current.state.isPlayerBarMode).toBe(true);

    act(() => {
      result.current.handlers.togglePlayerMode();
    });

    expect(result.current.state.isPlayerBarMode).toBe(false);
  });

  it("handlePlayPauseで再生/一時停止が切り替わる", () => {
    const { result } = renderHook(() => useVideoPlayer({ videoList: [] }));

    // プレーヤーのモックを作成
    const mockPlayVideo = jest.fn();
    const mockPauseVideo = jest.fn();

    // playerRefを直接変更せず、onReadyを使用してセットする
    const mockEvent = {
      target: {
        playVideo: mockPlayVideo,
        pauseVideo: mockPauseVideo,
      },
    };

    act(() => {
      result.current.handlers.onReady(mockEvent);
    });

    // 初期状態はisPlaying=true
    act(() => {
      result.current.handlers.handlePlayPause();
    });

    // 一時停止に切り替わるはず
    expect(result.current.state.isPlaying).toBe(false);
    expect(mockPauseVideo).toHaveBeenCalled();

    act(() => {
      result.current.handlers.handlePlayPause();
    });

    // 再生に切り替わるはず
    expect(result.current.state.isPlaying).toBe(true);
    expect(mockPlayVideo).toHaveBeenCalled();
  });

  it("handleStartで再生が開始される", () => {
    const { result } = renderHook(() => useVideoPlayer({ videoList: [] }));

    act(() => {
      result.current.handlers.handleStart();
    });

    expect(result.current.state.isStarted).toBe(true);
  });

  it("複数の動画がある場合、handleNextTrackで次の動画に進む", () => {
    const { result } = renderHook(() => useVideoPlayer({ videoList }));

    act(() => {
      result.current.handlers.handleNextTrack();
    });

    expect(result.current.state.currentIndex).toBe(1);
  });

  it("複数の動画がある場合、handlePreviousTrackで前の動画に戻る", () => {
    const { result } = renderHook(() => useVideoPlayer({ videoList }));

    // まず現在のインデックスを1に設定
    act(() => {
      result.current.handlers.setState((prev) => ({
        ...prev,
        currentIndex: 1,
      }));
    });

    act(() => {
      result.current.handlers.handlePreviousTrack();
    });

    expect(result.current.state.currentIndex).toBe(0);
  });

  it("onEndイベントで次の動画に進む", () => {
    const { result } = renderHook(() => useVideoPlayer({ videoList }));

    act(() => {
      result.current.handlers.onEnd();
    });

    expect(result.current.state.currentIndex).toBe(1);
  });

  it("ループモードがオンの場合、最後の動画の後は最初に戻る", () => {
    const { result } = renderHook(() => useVideoPlayer({ videoList }));

    // ループモードをオンにする
    act(() => {
      result.current.handlers.toggleLoop();
    });

    // 最後の動画に設定
    act(() => {
      result.current.handlers.setState((prev) => ({
        ...prev,
        currentIndex: 1,
      }));
    });

    act(() => {
      result.current.handlers.handleNextTrack();
    });

    // 最初の動画に戻るはず
    expect(result.current.state.currentIndex).toBe(0);
  });
});
