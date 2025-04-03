import { ContentLayout } from "@/components/layout/content-layout";
import { DataError } from "@/components/parts/data-error";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CLIENT_PATH } from "@/consts/clientpath";
import { getAuthorById } from "@/repositories/authors";
import { formatDate } from "@/utils/date";
import { ArrowLeft, CalendarDays, Clock, Link as LinkIcon } from "lucide-react";
import Link from "next/link";

type Props = {
  id: string;
};

export const UserDetailContent = async ({ id }: Props) => {
  const result = await getAuthorById(id);

  if (result.isErr()) {
    return <DataError />;
  }

  const author = result.value;

  return (
    <ContentLayout endItem={{ id: id as string, label: author.name }}>
      <div className="space-y-8">
        {/* 一覧に戻るリンク */}
        <Link
          href={CLIENT_PATH.USERS}
          className="flex items-center text-sm text-muted-foreground hover:text-green-600 transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          ユーザー一覧に戻る
        </Link>

        {/* プロフィールヘッダー */}
        <div className="flex flex-col items-center gap-6 py-8">
          <Avatar className="h-32 w-32">
            <AvatarImage src={author.iconUrl || ""} alt={author.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-4xl">
              {author.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight mb-2">{author.name}</h1>
            {author.bio && <p className="text-muted-foreground max-w-2xl text-center">{author.bio}</p>}
          </div>
        </div>

        <Separator />

        {/* 詳細情報 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="text-sm font-medium">アカウント情報</CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                <span>{formatDate(author.createdAt)}に参加</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>最終更新: {formatDate(author.updatedAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <LinkIcon className="h-4 w-4" />
                <span>ID: {author.id}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-sm font-medium">統計情報</CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">今後、プレイリスト数やクリップ数などの統計情報を表示予定</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ContentLayout>
  );
};
