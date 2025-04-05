import { ContentLayout } from "@/components/layout/content-layout";
import { DataError } from "@/components/parts/data-error";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getDetailPath } from "@/consts/clientpath";
import { getAllAuthors } from "@/repositories/authors";
import { formatDate } from "@/utils/date";
import { CalendarDays } from "lucide-react";
import Link from "next/link";

export const UsersContent = async () => {
  const result = await getAllAuthors();

  if (result.isErr()) {
    return <DataError />;
  }

  const authors = result.value;

  return (
    <ContentLayout>
      <div className="divide-y">
        {authors.map((author) => (
          <div key={author.id} className="flex items-center gap-4 py-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={author.iconUrl || ""} alt={author.name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {author.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link href={getDetailPath("USER_DETAIL", author.id)} className="hover:text-green-600 transition-colors">
                  <h3 className="text-base font-medium truncate">{author.name}</h3>
                </Link>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarDays className="h-3 w-3" />
                  <span>{formatDate(author.createdAt)}に参加</span>
                </div>
              </div>
              {author.bio && <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{author.bio}</p>}
            </div>
          </div>
        ))}
      </div>
    </ContentLayout>
  );
};
