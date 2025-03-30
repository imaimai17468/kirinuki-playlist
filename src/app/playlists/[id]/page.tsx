import { PlaylistDetailContent } from "@/components/features/playlists/detail/playlist-detail-content";
import { DataLoading } from "@/components/parts/data-loading";
import { Suspense } from "react";

export default function PlaylistDetail({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<DataLoading />}>
      <PlaylistDetailContent id={params.id} />
    </Suspense>
  );
}
