import { UserCard } from "@/components/features/users/commons/UserCard";
import { ContentLayout } from "@/components/layout/content-layout";
import { BackLink } from "@/components/parts/back-link";
import { DataError } from "@/components/parts/data-error";
import { EmptyState } from "@/components/parts/empty-state";
import { getAuthorWithCounts } from "@/repositories/authors";
import { getUserFollowers } from "@/repositories/follows";
import { UserMinus } from "lucide-react";

interface FollowersContentProps {
  id: string;
}

export async function FollowersContent({ id }: FollowersContentProps) {
  const [authorResult, followersResult] = await Promise.all([getAuthorWithCounts(id), getUserFollowers(id)]);

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
          <div className="space-y-4">
            {followers.length > 0 ? (
              followers.map((follower) => <UserCard key={follower.id} user={follower} />)
            ) : (
              <EmptyState
                title="フォロワーがいません"
                description="まだフォロワーがいません。他のユーザーからフォローされるとここに表示されます。"
                icon={<UserMinus className="h-12 w-12 text-muted-foreground/50" />}
              />
            )}
          </div>
        </div>
      </div>
    </ContentLayout>
  );
}
