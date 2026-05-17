import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Simu but Real",
  description: "真实企业开发流程模拟平台，面向 Java 后端求职新人。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
