import { ContentLayout } from "@/components/layout/content-layout";
import { DataError } from "@/components/parts/data-error";
import { getDetailPath } from "@/consts/clientpath";
import { getAllTags } from "@/repositories/tags";
import { Tag, Video } from "lucide-react";
import Link from "next/link";

export const TagsContent = async () => {
  const result = await getAllTags();

  if (result.isErr()) {
    return <DataError />;
  }

  const tags = result.value;

  return (
    <ContentLayout>
      <h1 className="text-3xl font-bold mb-4">Tags</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tags.map((tag) => (
          <Link key={tag.id} href={getDetailPath("TAG_DETAIL", tag.id)} className="group">
            <div className="border rounded-lg p-4 hover:border-green-500 transition-colors duration-300 h-full">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-medium group-hover:text-green-600 transition-colors">{tag.name}</h3>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Video className="h-3 w-3" />
                <span>Related videos {tag.videos.length}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </ContentLayout>
  );
};
