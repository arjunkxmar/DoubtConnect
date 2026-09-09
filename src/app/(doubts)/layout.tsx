import { AppLayout } from "@/components/layout/AppLayout";

export default function DoubtsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
