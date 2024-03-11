import HideableHeader from "../components/HideableHeader";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div lang="en">
      <HideableHeader />
      {children}
    </div>
  );
}
