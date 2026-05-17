"use client";

import { signIn, signOut } from "next-auth/react";

export function SignInButton() {
  return (
    <button
      className="rounded-md border border-slate-900 bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700"
      onClick={() => signIn("github")}
      type="button"
    >
      GitHub 登录
    </button>
  );
}

export function SignOutButton() {
  return (
    <button
      className="rounded-md border border-line bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
      onClick={() => signOut()}
      type="button"
    >
      退出
    </button>
  );
}
