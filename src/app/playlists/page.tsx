import { PlaylistsContent } from "@/components/features/playlists/playlists-content";
import { DataLoading } from "@/components/parts/data-loading";
import { Suspense } from "react";

export default async function Playlists() {
  return (
    <Suspense fallback={<DataLoading />}>
      <PlaylistsContent />
    </Suspense>
  );
}
