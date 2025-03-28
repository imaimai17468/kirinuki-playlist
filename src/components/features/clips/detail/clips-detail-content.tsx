"use client";

import { ContentLayout } from "@/components/layout/content-layout";
import { DataError } from "@/components/parts/data-error";
import { CLIENT_PATH, getDetailPath } from "@/consts/clientpath";
import { useVideo } from "@/repositories/videos/hooks";
import { formatDate } from "@/utils/date";
import { getYoutubeId } from "@/utils/youtube";
import Link from "next/link";
import { useParams } from "next/navigation";
import YouTube from "react-youtube";
import { createYoutubeOpts } from "./consts";

export const ClipsDetailContent = () => {
  const { id } = useParams();
  const { data: video, isLoading } = useVideo(id as string);

  return (
    <ContentLayout endItem={{ id: id as string, label: video?.title ?? "" }} isLoading={isLoading}>
      {isLoading ? (
        <div>Loading...</div>
      ) : !video ? (
        <DataError />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="w-full aspect-video">
            <YouTube
              videoId={getYoutubeId(video.url)}
              opts={createYoutubeOpts(video.start, video.end)}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-500">{formatDate(video.createdAt)}</p>
            <h1 className="text-2xl font-bold">{video.title}</h1>
            <div className="flex items-center gap-1 text-sm">
              <Link href={getDetailPath(CLIENT_PATH.AUTHOR_DETAIL, video.author.id)}>
                <p className="text-green-500 underline hover:text-green-600 transition-colors">{video.author.name}</p>
              </Link>
              <p className="text-gray-500"> さんが切り抜き</p>
            </div>
          </div>
        </div>
      )}
    </ContentLayout>
  );
};
