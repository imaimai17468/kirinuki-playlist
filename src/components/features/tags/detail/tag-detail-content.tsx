import { ContentLayout } from "@/components/layout/content-layout";
import { BackLink } from "@/components/parts/back-link";
import { DataError } from "@/components/parts/data-error";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getDetailPath } from "@/consts/clientpath";
import { CLIENT_PATH } from "@/consts/clientpath";
import { getTagById } from "@/repositories/tags";
import { formatDate } from "@/utils/date";
import { formatDuration, getYoutubeId } from "@/utils/youtube";
import { Clapperboard, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface TagDetailContentProps {
  id: string;
}

export const TagDetailContent = async ({ id }: TagDetailContentProps) => {
  const result = await getTagById(id);

  if (result.isErr()) {
    return <DataError />;
  }

  const tag = result.value;

  return (
    <ContentLayout customItems={[{ id: id as string, label: tag?.name ?? "", position: 0 }]}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <BackLink href={CLIENT_PATH.TAGS} text="Back to Tags" />
          <div className="flex items-center gap-2">
            <Tag className="h-6 w-6 text-green-600" />
            <h1 className="text-2xl font-bold">{tag.name}</h1>
          </div>
        </div>

        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span>Related videos</span>
          <Badge variant="secondary" className="text-sm font-normal">
            {tag.videos.length} videos
          </Badge>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-4">
          {tag.videos.map((video) => (
            <div key={video.id} className="flex flex-col gap-3">
              <div className="relative group">
                <Link href={getDetailPath("CLIP_DETAIL", video.id)} className="relative block">
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

              <div className="flex gap-3 items-start">
                {/* アバター */}
                {video.author && (
                  <Link href={getDetailPath("USER_DETAIL", video.authorId)} className="flex-shrink-0">
                    <Avatar className="h-8 w-8 hover:opacity-80 transition-opacity duration-300">
                      <AvatarImage src={video.author.iconUrl || ""} alt={video.author.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {video.author.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                )}

                <div className="flex flex-col min-w-0">
                  <Link href={getDetailPath("CLIP_DETAIL", video.id)} className="group" title={video.title}>
                    <h3 className="text-sm font-medium line-clamp-2 group-hover:text-green-600 transition-colors">
                      {video.title}
                    </h3>
                  </Link>

                  {video.author && (
                    <div className="flex items-center gap-1 mt-1">
                      <Link
                        href={getDetailPath("USER_DETAIL", video.authorId)}
                        className="hover:text-green-600 transition-colors"
                        title={video.author.name}
                      >
                        <p className="text-xs text-muted-foreground truncate hover:text-green-600 transition-colors">
                          {video.author.name}
                        </p>
                      </Link>
                    </div>
                  )}

                  {/* 他のタグ */}
                  {video.tags && video.tags.length > 1 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {video.tags
                        .filter((t) => t.id !== id)
                        .slice(0, 3)
                        .map((tagItem) => (
                          <Badge key={tagItem.id} variant="outline" className="px-2 py-0 text-xs cursor-pointer">
                            <Link
                              href={getDetailPath("TAG_DETAIL", tagItem.id)}
                              className="hover:text-green-600 transition-colors flex items-center"
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {tagItem.name}
                            </Link>
                          </Badge>
                        ))}
                      {video.tags.length > 4 && (
                        <Badge variant="outline" className="px-2 py-0 text-xs cursor-pointer">
                          <Link
                            href={`${getDetailPath("CLIP_DETAIL", video.id)}#tags`}
                            title="すべてのタグを表示"
                            className="hover:text-green-600 transition-colors"
                          >
                            +{video.tags.length - 4}
                          </Link>
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {tag.videos.length === 0 && (
          <div className="text-center py-10 border rounded-lg">
            <p className="text-muted-foreground">No videos related to this tag</p>
          </div>
        )}
      </div>
    </ContentLayout>
  );
};
