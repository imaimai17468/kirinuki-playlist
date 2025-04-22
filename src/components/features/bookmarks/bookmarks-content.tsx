import { ClipCard } from "@/components/features/clips/commons/clip-card";
import { PlaylistCard } from "@/components/features/playlists/commons/playlist-card";
import { ContentLayout } from "@/components/layout/content-layout";
import { DataError } from "@/components/parts/data-error";
import { EmptyState } from "@/components/parts/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAuthorWithVideosPlaylistsAndBookmarks } from "@/repositories/authors";
import { Bookmark, ListMusic, Music } from "lucide-react";

type BookmarksContentProps = {
  authorId: string;
};

export const BookmarksContent = async ({ authorId }: BookmarksContentProps) => {
  const result = await getAuthorWithVideosPlaylistsAndBookmarks(authorId);

  if (result.isErr()) {
    return <DataError />;
  }

  const author = result.value;
  const { bookmarkedVideos, bookmarkedPlaylists } = author;
  const hasBookmarks = bookmarkedVideos.length > 0 || bookmarkedPlaylists.length > 0;

  return (
    <ContentLayout>
      <h1 className="text-3xl font-bold mb-4">Favorites</h1>

      {!hasBookmarks ? (
        <EmptyState
          title="No favorites yet"
          description="Bookmark your favorite videos and playlists to see them here."
          icon={<Bookmark className="h-12 w-12 text-muted-foreground/50" />}
        />
      ) : (
        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              <span>Videos ({bookmarkedVideos.length})</span>
            </TabsTrigger>
            <TabsTrigger value="playlists" className="flex items-center gap-2">
              <ListMusic className="h-4 w-4" />
              <span>Playlists ({bookmarkedPlaylists.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos">
            {bookmarkedVideos.length === 0 ? (
              <EmptyState
                title="No favorite videos"
                description="Bookmark your favorite videos to see them here."
                icon={<Music className="h-12 w-12 text-muted-foreground/50" />}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-4">
                {bookmarkedVideos.map((video) => (
                  <ClipCard key={video.id} video={video} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="playlists">
            {bookmarkedPlaylists.length === 0 ? (
              <EmptyState
                title="No favorite playlists"
                description="Bookmark your favorite playlists to see them here."
                icon={<ListMusic className="h-12 w-12 text-muted-foreground/50" />}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-4">
                {bookmarkedPlaylists.map((playlist) => (
                  <PlaylistCard key={playlist.id} playlist={playlist} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </ContentLayout>
  );
};
