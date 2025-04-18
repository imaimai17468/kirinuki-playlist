import { UserCard } from "@/components/features/users/commons/UserCard";
import { ContentLayout } from "@/components/layout/content-layout";
import { DataError } from "@/components/parts/data-error";
import { getAllAuthorsWithCounts } from "@/repositories/authors";

export const UsersContent = async () => {
  const result = await getAllAuthorsWithCounts();

  if (result.isErr()) {
    return <DataError />;
  }

  const authors = result.value;

  return (
    <ContentLayout>
      <h1 className="text-3xl font-bold mb-4">Creators List</h1>
      <div className="space-y-4">
        {authors.map((author) => (
          <UserCard key={author.id} user={author} />
        ))}
      </div>
    </ContentLayout>
  );
};
