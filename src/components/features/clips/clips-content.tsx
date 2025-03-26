"use client";

import { getDetailPath } from "@/consts/clientpath";
import { CLIENT_PATH } from "@/consts/clientpath";
import { useVideos } from "@/repositories/videos/hooks";
import { formatDuration, getYoutubeId } from "@/utils/youtube";
import Image from "next/image";
import Link from "next/link";

export const ClipsContent = () => {
  const { data: videos, isLoading } = useVideos();

  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-3 gap-y-8 gap-x-4">
          {videos?.map((video) => (
            <div key={video.id} className="flex flex-col gap-2">
              <div className="relative">
                <Link
                  href={getDetailPath(CLIENT_PATH.CLIP_DETAIL, video.id)}
                  className="hover:opacity-80 transition-opacity duration-300"
                >
                  <Image
                    src={`https://img.youtube.com/vi/${getYoutubeId(video.url)}/0.jpg`}
                    alt={video.title}
                    width={320}
                    height={180}
                    className="rounded-md w-full aspect-video object-cover"
                  />
                </Link>
                <p className="absolute bottom-2 right-2 rounded-md bg-black/50 text-white px-2 py-1 text-xs">
                  {video.createdAt.toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </p>
                <p className="absolute bottom-2 left-2 rounded-md bg-black/50 text-white px-2 py-1 text-xs">
                  {formatDuration(video.start, video.end)}
                </p>
              </div>
              <div className="flex flex-col">
                <Link
                  href={getDetailPath(CLIENT_PATH.CLIP_DETAIL, video.id)}
                  className="hover:underline w-fit line-clamp-1"
                  title={video.title}
                >
                  <p className="text-sm font-bold">{video.title}</p>
                </Link>
                <Link
                  href={getDetailPath(CLIENT_PATH.AUTHOR_DETAIL, video.authorId)}
                  className="hover:underline w-fit line-clamp-1"
                  title={video.author?.name}
                >
                  <p className="text-xs text-gray-500 dark:text-gray-400">作成者: {video.author?.name} さん</p>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
