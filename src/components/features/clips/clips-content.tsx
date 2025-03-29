import { ContentLayout } from "@/components/layout/content-layout";
import { DataError } from "@/components/parts/data-error";
import { getDetailPath } from "@/consts/clientpath";
import { CLIENT_PATH } from "@/consts/clientpath";
import { getAllVideos } from "@/repositories/videos";
import { formatDate } from "@/utils/date";
import { formatDuration, getYoutubeId } from "@/utils/youtube";
import { Clapperboard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const ClipsContent = async () => {
  const result = await getAllVideos();

  if (result.isErr()) {
    return <DataError />;
  }

  const videos = result.value;

  return (
    <ContentLayout>
      <div className="grid grid-cols-3 gap-y-8 gap-x-4">
        {videos.map((video) => (
          <div key={video.id} className="flex flex-col gap-2">
            <div className="relative group">
              <Link href={getDetailPath(CLIENT_PATH.CLIP_DETAIL, video.id)} className="relative block">
                <Image
                  src={`https://img.youtube.com/vi/${getYoutubeId(video.url)}/0.jpg`}
                  alt={video.title}
                  width={320}
                  height={180}
                  className="rounded-md w-full aspect-video object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 rounded-md">
                  <Clapperboard className="text-white w-12 h-12" />
                </div>
              </Link>
              <p className="absolute bottom-2 right-2 rounded-md bg-black/50 text-white px-2 py-1 text-xs z-10">
                {formatDate(video.createdAt)}
              </p>
              <p className="absolute bottom-2 left-2 rounded-md bg-black/50 text-white px-2 py-1 text-xs z-10">
                {formatDuration(video.start, video.end)}
              </p>
            </div>
            <div className="flex flex-col">
              <Link href={getDetailPath(CLIENT_PATH.CLIP_DETAIL, video.id)} className="w-fit peer" title={video.title}>
                <p className="text-sm font-bold hover:text-green-600 transition-colors line-clamp-1">{video.title}</p>
              </Link>
              <Link
                href={getDetailPath(CLIENT_PATH.USERS_DETAIL, video.authorId)}
                className="w-fit"
                title={video.author?.name}
              >
                <p className="text-xs hover:text-green-600 transition-colors line-clamp-1">
                  作成者: {video.author?.name} さん
                </p>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </ContentLayout>
  );
};
