import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#070707]">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
