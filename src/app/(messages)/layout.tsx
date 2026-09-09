import { Navbar } from "@/components/layout/Navbar";

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#070707]">
      <Navbar />
      <main className="pt-16">
        {children}
      </main>
    </div>
  )
}
