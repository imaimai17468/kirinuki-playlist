import { UsersList } from "@/components/features/users/commons/UsersList";
import { ContentLayout } from "@/components/layout/content-layout";
import { BackLink } from "@/components/parts/back-link";
import { DataError } from "@/components/parts/data-error";
import { getAuthorById } from "@/repositories/authors";
import { getUserFollowers } from "@/repositories/follows";

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
    <ContentLayout
      customItems={[
        { id: id as string, label: `${author.name}のフォロワー`, position: 0 },
        { id: id as string, label: `${author.name}`, position: 1 },
      ]}
    >
      <div className="flex flex-col gap-8">
        {/* 戻るリンク */}
        <BackLink href={`/users/${id}`} text={`Back to ${author.name}'s profile`} />

        {/* フォロワー一覧 */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold tracking-tight">Followers {followers.length}</h3>
          <UsersList users={followers} emptyMessage="No followers yet" />
        </div>
      </div>
    </ContentLayout>
  );
}
