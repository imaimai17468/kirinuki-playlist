import { UsersList } from "@/components/features/users/UsersList";
import { ContentLayout } from "@/components/layout/content-layout";
import { DataError } from "@/components/parts/data-error";
import { getAuthorById } from "@/repositories/authors";
import { getUserFollowers } from "@/repositories/follows";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface FollowersContentProps {
  id: string;
}

export async function FollowersContent({ id }: FollowersContentProps) {
  const [authorResult, followersResult] = await Promise.all([getAuthorById(id), getUserFollowers(id)]);

  // エラー処理
  if (authorResult.isErr()) {
    return <DataError />;
  }

  if (followersResult.isErr()) {
    return <DataError />;
  }

  const author = authorResult.value;
  const followers = followersResult.value;

  return (
    <ContentLayout endItem={{ id: id as string, label: `${author.name}のフォロワー` }}>
      <div className="flex flex-col gap-8">
        {/* 戻るリンク */}
        <div>
          <Link
            href={`/users/${id}`}
            className="flex items-center text-sm text-muted-foreground hover:text-green-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {author.name}のプロフィールに戻る
          </Link>
        </div>

        {/* フォロワー一覧 */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold tracking-tight">フォロワー {followers.length}人</h3>
          <UsersList users={followers} emptyMessage="フォロワーはまだいません" />
        </div>
      </div>
    </ContentLayout>
  );
}
