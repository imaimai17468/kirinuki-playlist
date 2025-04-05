import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Home, Lock, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";

export function LoginRequiredContent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="mx-auto max-w-md p-8 shadow-lg">
        <div className="mb-6 flex flex-col items-center space-y-2 text-center">
          <div className="rounded-full bg-primary/10 p-3">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">ログインが必要です</h1>
          <p className="text-muted-foreground">このページを表示するには、ログインが必要です。</p>
        </div>

        <div className="grid gap-6">
          <SignInButton mode="modal">
            <Button className="w-full" size="lg">
              <LogIn className="mr-2 h-4 w-4" />
              ログイン
            </Button>
          </SignInButton>

          <SignUpButton mode="modal">
            <Button variant="outline" className="w-full" size="lg">
              <UserPlus className="mr-2 h-4 w-4" />
              新規登録
            </Button>
          </SignUpButton>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">または</span>
            </div>
          </div>

          <Link href="/">
            <Button variant="ghost" className="w-full" size="lg">
              <Home className="mr-2 h-4 w-4" />
              ホームに戻る
            </Button>
          </Link>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>サイドバー下の</p>
          <div className="mt-1 inline-flex items-center justify-center gap-2">
            <LogIn className="h-4 w-4" />
            <span>ログイン</span>
          </div>
          <p className="mt-1">ボタンからもログインできます</p>
        </div>
      </Card>
    </div>
  );
}
