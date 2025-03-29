import { ContentLayout } from "@/components/layout/content-layout";
import { DataError } from "@/components/parts/data-error";
import { CLIENT_PATH, getDetailPath } from "@/consts/clientpath";
import { getVideoById } from "@/repositories/videos";
import { formatDate } from "@/utils/date";
import Link from "next/link";
import { YoutubePlayer } from "./youtube-player";

type Props = {
  id: string;
};

export const ClipsDetailContent = async ({ id }: Props) => {
  const result = await getVideoById(id);

  if (result.isErr()) {
    return <DataError />;
  }

  const video = result.value;

  return (
    <ContentLayout endItem={{ id: id as string, label: video?.title ?? "" }}>
      <div className="flex flex-col gap-4">
        <div className="w-full aspect-video">
          <YoutubePlayer url={video.url} start={video.start} end={video.end} />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-500">{formatDate(video.createdAt)}</p>
          <h1 className="text-2xl font-bold">{video.title}</h1>
          <div className="flex items-center gap-1 text-sm">
            <Link href={getDetailPath(CLIENT_PATH.USERS_DETAIL, video.author.id)}>
              <p className="text-green-500 underline hover:text-green-600 transition-colors">{video.author.name}</p>
            </Link>
            <p className="text-gray-500"> さんが切り抜き</p>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
};
