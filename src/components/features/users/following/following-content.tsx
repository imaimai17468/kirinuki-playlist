import { UserCard } from "@/components/features/users/commons/UserCard";
import { ContentLayout } from "@/components/layout/content-layout";
import { BackLink } from "@/components/parts/back-link";
import { DataError } from "@/components/parts/data-error";
import { EmptyState } from "@/components/parts/empty-state";
import { getAuthorWithCounts } from "@/repositories/authors";
import { getUserFollowing } from "@/repositories/follows";
import { Users } from "lucide-react";

interface FollowingContentProps {
  id: string;
}

export async function FollowingContent({ id }: FollowingContentProps) {
  const [authorResult, followingResult] = await Promise.all([getAuthorWithCounts(id), getUserFollowing(id)]);

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
    <ContentLayout
      customItems={[
        { id: id as string, label: `${author.name}'s Following`, position: 0 },
        { id: id as string, label: `${author.name}`, position: 1 },
      ]}
    >
      <div className="flex flex-col gap-8">
        {/* Back link */}
        <BackLink href={`/users/${id}`} text={`Back to ${author.name}'s profile`} />

        {/* Following list */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold tracking-tight">Following {following.length} users</h3>
          <div className="space-y-4">
            {following.length > 0 ? (
              following.map((followedUser) => <UserCard key={followedUser.id} user={followedUser} />)
            ) : (
              <EmptyState
                title="No users followed"
                description="You haven't followed any users yet. When you follow users, they will appear here."
                icon={<Users className="h-12 w-12 text-muted-foreground/50" />}
              />
            )}
          </div>
        </div>
      </div>
    </ContentLayout>
  );
}
