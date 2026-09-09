import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardRenderer } from "@/components/dashboard/DashboardRenderer";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as any;
  const year = user.academicYear || "1st Year";

  const topSeniors = await prisma.user.findMany({
    where: { id: { not: user.id } },
    orderBy: { points: "desc" },
    take: 3,
    select: { id: true, fullName: true, branch: true, academicYear: true, points: true }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardRenderer user={user} year={year} topSeniors={topSeniors} />
    </div>
  );
}
