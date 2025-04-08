import { UsersList } from "@/components/features/users/commons/UsersList";
import { ContentLayout } from "@/components/layout/content-layout";
import { BackLink } from "@/components/parts/back-link";
import { DataError } from "@/components/parts/data-error";
import { getAuthorById } from "@/repositories/authors";
import { getUserFollowing } from "@/repositories/follows";

interface FollowingContentProps {
  id: string;
}

export async function FollowingContent({ id }: FollowingContentProps) {
  const [authorResult, followingResult] = await Promise.all([getAuthorById(id), getUserFollowing(id)]);

  // エラー処理
  if (authorResult.isErr()) {
    return <DataError />;
  }

  if (followingResult.isErr()) {
    return <DataError />;
  }

  const author = authorResult.value;
  const following = followingResult.value;

  return (
    <ContentLayout endItem={{ id: id as string, label: `${author.name}のフォロー中` }}>
      <div className="flex flex-col gap-8">
        {/* 戻るリンク */}
        <BackLink href={`/users/${id}`} text={`Back to ${author.name}'s profile`} />

        {/* フォロー中一覧 */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold tracking-tight">フォロー中 {following.length}人</h3>
          <UsersList users={following} emptyMessage="フォロー中のユーザーはいません" />
        </div>
      </div>
    </ContentLayout>
  );
}
