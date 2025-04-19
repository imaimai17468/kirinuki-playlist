import { ClipCard } from "@/components/features/clips/commons/clip-card";
import { ContentLayout } from "@/components/layout/content-layout";
import { DataError } from "@/components/parts/data-error";
import { EmptyState } from "@/components/parts/empty-state";
import { getAuthorBookmarkedVideos } from "@/repositories/authors";
import { Bookmark } from "lucide-react";

type BookmarksContentProps = {
  authorId: string;
};

export const BookmarksContent = async ({ authorId }: BookmarksContentProps) => {
  const result = await getAuthorBookmarkedVideos(authorId);

  if (result.isErr()) {
    return <DataError />;
  }

  const author = result.value;
  const bookmarkedVideos = author.bookmarkedVideos;

  return (
    <ContentLayout>
      <h1 className="text-3xl font-bold mb-4">お気に入り動画</h1>

      {bookmarkedVideos.length === 0 ? (
        <EmptyState
          title="ブックマークされた動画がありません"
          description="気に入った動画をブックマークすると、ここに表示されます。"
          icon={<Bookmark className="h-12 w-12 text-muted-foreground/50" />}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-4">
          {bookmarkedVideos.map((video) => (
            <ClipCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </ContentLayout>
  );
};
