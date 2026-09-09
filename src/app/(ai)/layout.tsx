import { AppLayout } from "@/components/layout/AppLayout";

export default function AiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
