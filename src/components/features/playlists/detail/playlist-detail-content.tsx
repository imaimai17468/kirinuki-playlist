import { PlaylistBookmarkButton } from "@/components/features/playlists/commons/playlist-bookmark-button";
import { PlayPlaylistButton } from "@/components/features/playlists/detail/play-playlist-button";
import { ContentLayout } from "@/components/layout/content-layout";
import { BackLink } from "@/components/parts/back-link";
import { DataError } from "@/components/parts/data-error";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CLIENT_PATH, getDetailPath } from "@/consts/clientpath";
import { getPlaylistById } from "@/repositories/playlists";
import { formatDate } from "@/utils/date";
import { convertSecondsToTimeFormat, getYoutubeId } from "@/utils/youtube";
import { CalendarDays, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Props = {
  id: string;
};

export const PlaylistDetailContent = async ({ id }: Props) => {
  const result = await getPlaylistById(id);

  if (result.isErr()) {
    return <DataError />;
  }

  const playlist = result.value;
  const videos = playlist.videos || [];
  const videoCount = videos.length;
  const mainThumbnail =
    videoCount > 0
      ? `https://img.youtube.com/vi/${getYoutubeId(videos[0].url)}/0.jpg`
      : "/images/playlist-placeholder.jpg";

  return (
    <ContentLayout customItems={[{ id: id as string, label: playlist?.title ?? "", position: 0 }]}>
      <div className="space-y-8">
        {/* ヘッダーセクション */}
        <BackLink href={CLIENT_PATH.PLAYLISTS} text="Back to Playlists" />

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-1/3 aspect-video rounded-lg overflow-hidden shadow-lg bg-muted flex-shrink-0">
            <Image
              src={mainThumbnail}
              alt={playlist.title}
              width={320}
              height={180}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">{playlist.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Link
                  href={getDetailPath("USER_DETAIL", playlist.author.id)}
                  className="flex items-center gap-2 hover:text-green-600 transition-colors"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={playlist.author.iconUrl || ""} alt={playlist.author.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {playlist.author.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{playlist.author.name}</span>
                </Link>
                <span>•</span>
                <span>{videoCount} songs</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  <span>Created on {formatDate(playlist.createdAt)}</span>
                </div>
              </div>
            </div>
            {/* 再生ボタンとブックマークボタン */}
            {videoCount > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <PlayPlaylistButton playlist={playlist} />
                <PlaylistBookmarkButton playlistId={playlist.id} showText={true} />
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* 動画リスト */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">プレイリストの内容 ({videoCount}曲)</h2>
          {videoCount > 0 ? (
            <div className="divide-y divide-border rounded-lg border border-border">
              {videos
                .sort((a, b) => a.order - b.order) // orderでソート
                .map((video, index) => (
                  <Card
                    key={video.id}
                    className="flex gap-4 p-4 items-center first:rounded-t-lg last:rounded-b-lg border-0 first:border-t-0 last:border-b-0"
                  >
                    <span className="text-sm font-mono text-muted-foreground w-6 text-center">{index + 1}</span>
                    <div className="w-28 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
                      <Image
                        src={`https://img.youtube.com/vi/${getYoutubeId(video.url)}/0.jpg`}
                        alt={video.title}
                        width={112}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium truncate mb-1">{video.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        切り抜き範囲: {convertSecondsToTimeFormat(video.start)} -{" "}
                        {convertSecondsToTimeFormat(video.end)}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={getDetailPath("CLIP_DETAIL", video.id)}>
                        <Play className="h-4 w-4 mr-2" />
                        クリップを見る
                      </Link>
                    </Button>
                  </Card>
                ))}
            </div>
          ) : (
            <p className="text-muted-foreground">このプレイリストにはまだ動画が追加されていません。</p>
          )}
        </div>
      </div>
    </ContentLayout>
  );
};
