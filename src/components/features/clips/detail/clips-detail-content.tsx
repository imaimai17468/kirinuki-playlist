"use client";

import { ContentLayout } from "@/components/layout/content-layout";
import { CLIENT_PATH, getDetailPath } from "@/consts/clientpath";
import { useVideo } from "@/repositories/videos/hooks";
import { formatDate } from "@/utils/date";
import { getYoutubeId } from "@/utils/youtube";
import Link from "next/link";
import { useParams } from "next/navigation";
import YouTube, { type YouTubeProps } from "react-youtube";

export const ClipsDetailContent = () => {
  const { id } = useParams();
  const { data: video, isLoading } = useVideo(id as string);

  const opts: YouTubeProps["opts"] = {
    width: "100%",
    height: "100%",
    aspectRatio: "16/9",
    playerVars: {
      autoplay: 1,
      start: video?.start,
      end: video?.end,
    },
  };

  console.log(video);

  return (
    <ContentLayout endItem={{ id: id as string, label: video?.title ?? "" }} isLoading={isLoading}>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="w-full aspect-video">
            <YouTube videoId={getYoutubeId(video?.url ?? "")} opts={opts} style={{ width: "100%", height: "100%" }} />
          </div>
          <div className="flex flex-col gap-2">
            {video?.createdAt && <p className="text-sm text-gray-500">{formatDate(video?.createdAt)}</p>}
            <h1 className="text-2xl font-bold">{video?.title}</h1>
            <div className="flex items-center gap-1 text-sm">
              <Link href={getDetailPath(CLIENT_PATH.AUTHOR_DETAIL, video?.author?.id ?? "")}>
                <p className="text-green-500 underline hover:text-green-600 transition-colors">{video?.author?.name}</p>
              </Link>
              <p className="text-gray-500"> さんが切り抜き</p>
            </div>
          </div>
        </div>
      )}
    </ContentLayout>
  );
};
