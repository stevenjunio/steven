export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-col container mx-auto my-2">{children}</main>
  );
}
