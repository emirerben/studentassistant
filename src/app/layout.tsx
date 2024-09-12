import type { Metadata } from "next";
// import "./globals.css";

export const metadata: Metadata = {
  title: "Student Assistant",
  description: "Upload documents to get todo lists and calendar events",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}