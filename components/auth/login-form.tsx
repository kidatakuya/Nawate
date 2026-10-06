"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({
  setupRequired,
  nextPath,
}: {
  setupRequired: boolean;
  nextPath: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError("メールアドレスまたはパスワードを確認してください。");
        return;
      }
      router.replace(nextPath);
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "ログインに失敗しました。",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <span className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Sprout className="size-6" aria-hidden="true" />
          </span>
          <CardTitle className="text-2xl font-bold">畑ノート</CardTitle>
          <CardDescription>
            管理者アカウントでログインしてください
          </CardDescription>
        </CardHeader>
        <CardContent>
          {setupRequired && (
            <p
              role="alert"
              className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"
            >
              Supabaseの接続情報を設定してください。.env.local の
              NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY
              に値を入力し、開発サーバーを再起動してください。
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                メールアドレス
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                パスワード
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            {/* <Button type="submit" className="w-full" disabled={pending || setupRequired}> */}
            <Button type="submit" className="w-full" disabled={false}>
              <LockKeyhole aria-hidden="true" />
              {pending ? "ログイン中..." : "ログイン"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
