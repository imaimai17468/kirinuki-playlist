import { ClipCard } from "@/components/features/clips/commons/clip-card";
import { ContentLayout } from "@/components/layout/content-layout";
import { DataError } from "@/components/parts/data-error";
import { getAllVideos } from "@/repositories/videos";

export const ClipsContent = async () => {
  const result = await getAllVideos();

  if (result.isErr()) {
    return <DataError />;
  }

  const videos = result.value;

  return (
    <ContentLayout>
      <div className="grid grid-cols-3 gap-y-8 gap-x-4">
        {videos.map((video) => (
          <ClipCard key={video.id} video={video} />
        ))}
      </div>
    </ContentLayout>
  );
};
