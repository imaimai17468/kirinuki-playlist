import { ContentLayout } from "@/components/layout/content-layout";
import { DataError } from "@/components/parts/data-error";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CLIENT_PATH, getDetailPath } from "@/consts/clientpath";
import { getVideoById } from "@/repositories/videos";
import { formatDate } from "@/utils/date";
import { convertSecondsToTimeFormat } from "@/utils/youtube";
import { CalendarDays, Clock } from "lucide-react";
import Link from "next/link";
import { YoutubePlayer } from "./youtube-player";

type Props = {
  id: string;
};

export const ClipDetailContent = async ({ id }: Props) => {
  const result = await getVideoById(id);

  if (result.isErr()) {
    return <DataError />;
  }

  const video = result.value;

  return (
    <ContentLayout endItem={{ id: id as string, label: video?.title ?? "" }}>
      <div className="space-y-8">
        {/* プレイヤーセクション */}
        <div className="w-full aspect-video rounded-lg overflow-hidden shadow-lg">
          <YoutubePlayer url={video.url} start={video.start} end={video.end} />
        </div>

        {/* タイトルと基本情報 */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">{video.title}</h1>
          <div className="flex items-center gap-4">
            <Link
              href={getDetailPath(CLIENT_PATH.USERS_DETAIL, video.author.id)}
              className="flex items-center gap-2 hover:text-green-600 transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={video.author.iconUrl || ""} alt={video.author.name} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {video.author.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{video.author.name}</span>
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span>{formatDate(video.createdAt)}に切り抜き</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* 詳細情報 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    切り抜き範囲: {convertSecondsToTimeFormat(video.start)} - {convertSecondsToTimeFormat(video.end)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>元動画: </span>
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700 transition-colors underline"
                  >
                    YouTubeで見る
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ContentLayout>
  );
};
