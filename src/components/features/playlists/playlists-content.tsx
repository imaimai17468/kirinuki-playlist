import { PlaylistCard } from "@/components/features/playlists/commons/playlist-card";
import { ContentLayout } from "@/components/layout/content-layout";
import { DataError } from "@/components/parts/data-error";
import { getAllPlaylists } from "@/repositories/playlists";

export const PlaylistsContent = async () => {
  const result = await getAllPlaylists();

  if (result.isErr()) {
    return <DataError />;
  }

  const playlists = result.value;

  return (
    <ContentLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {playlists.map((playlist) => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ))}
      </div>
    </ContentLayout>
  );
};
