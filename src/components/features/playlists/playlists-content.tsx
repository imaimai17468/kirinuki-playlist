import { ContentLayout } from "@/components/layout/content-layout";
import { DataError } from "@/components/parts/data-error";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getDetailPath } from "@/consts/clientpath";
import { getAllPlaylists } from "@/repositories/playlists";
import { formatDate } from "@/utils/date";
import { getYoutubeId } from "@/utils/youtube";
import { ListMusic, Music } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const PlaylistsContent = async () => {
  const result = await getAllPlaylists();

  if (result.isErr()) {
    return <DataError />;
  }

  const playlists = result.value;

  return (
    <ContentLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {playlists.map((playlist) => {
          // 最大3つまでのサムネイルを表示
          const videos = playlist.videos || [];
          const videoCount = videos.length;

          // メインサムネイルは最初の動画または代替画像
          const mainThumbnail =
            videoCount > 0
              ? `https://img.youtube.com/vi/${getYoutubeId(videos[0].url)}/0.jpg`
              : "/images/playlist-placeholder.jpg";

          return (
            <div key={playlist.id} className="flex flex-col gap-3">
              <div className="relative group">
                <Link href={getDetailPath("PLAYLIST_DETAIL", playlist.id)} className="relative block">
                  <div className="aspect-video rounded-md overflow-hidden bg-muted">
                    {/* メインサムネイル */}
                    <Image
                      src={mainThumbnail}
                      alt={playlist.title}
                      width={320}
                      height={180}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* 動画のプレビュー (2つ目と3つ目の動画) */}
                    {videoCount > 1 && (
                      <div className="absolute right-2 top-2 space-y-1">
                        {videos.slice(1, 3).map((video, index) => (
                          <div
                            key={video.id}
                            className="h-16 w-28 rounded overflow-hidden border-2 border-white/80 shadow-md transform transition-transform duration-300 group-hover:translate-x-1"
                            style={{ transitionDelay: `${index * 50}ms` }}
                          >
                            <Image
                              src={`https://img.youtube.com/vi/${getYoutubeId(video.url)}/0.jpg`}
                              alt={video.title}
                              width={112}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-md">
                      <ListMusic className="text-white w-12 h-12" />
                    </div>
                  </div>
                </Link>
                <Badge className="absolute bottom-2 left-2 z-10 bg-black/70 hover:bg-black/70">
                  <Music className="h-3 w-3 mr-1" />
                  {videoCount} songs
                </Badge>
                <p className="absolute bottom-2 right-2 rounded-md bg-black/50 text-white px-2 py-1 text-xs z-10">
                  {formatDate(playlist.createdAt)}
                </p>
              </div>

              <div className="flex gap-3 items-center">
                {/* 作成者アバター */}
                <Link href={getDetailPath("USER_DETAIL", playlist.authorId)} className="flex-shrink-0">
                  <Avatar className="h-8 w-8 hover:opacity-80 transition-opacity duration-300">
                    <AvatarImage src={playlist.author.iconUrl || ""} alt={playlist.author.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {playlist.author.name.slice(0, 2).toUpperCase() || "PL"}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                <div className="flex flex-col min-w-0">
                  <Link href={getDetailPath("PLAYLIST_DETAIL", playlist.id)} className="group" title={playlist.title}>
                    <h3 className="text-sm font-medium line-clamp-2 group-hover:text-green-600 transition-colors">
                      {playlist.title}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-1 mt-1">
                    <Link
                      href={getDetailPath("USER_DETAIL", playlist.authorId)}
                      className="hover:text-green-600 transition-colors"
                      title={playlist.author.name}
                    >
                      <p className="text-xs text-muted-foreground truncate">{playlist.author.name || "不明な作成者"}</p>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ContentLayout>
  );
};
