const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '../src/app');

const routes = [
  '(auth)/login',
  '(auth)/signup',
  '(dashboard)/dashboard',
  '(doubts)/doubts',
  '(doubts)/doubts/[id]',
  '(doubts)/ask-doubt',
  '(community)/community',
  '(subjects)/subjects',
  '(subjects)/subjects/[id]',
  '(ai)/ai-assistant',
  '(messages)/messages',
  '(messages)/messages/[conversationId]',
  '(notifications)/notifications',
  '(profile)/profile',
  '(profile)/profile/[id]',
  '(profile)/settings',
  'about'
];

routes.forEach(route => {
  const dirPath = path.join(baseDir, route);
  fs.mkdirSync(dirPath, { recursive: true });
  
  const pagePath = path.join(dirPath, 'page.tsx');
  const componentName = route.split('/').pop().replace(/\[|\]/g, '').replace(/-./g, x => x[1].toUpperCase());
  const formattedName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
  
  const content = `export default function ${formattedName}Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">${formattedName} Page</h1>
      <p className="text-[#A1A1AA]">This page is currently under construction.</p>
    </div>
  );
}
`;
  if (!fs.existsSync(pagePath)) {
    fs.writeFileSync(pagePath, content);
  }
});

// Create layout for dashboard and other authenticated routes
const dashboardLayoutPath = path.join(baseDir, '(dashboard)', 'layout.tsx');
const dashboardLayoutContent = `import { Sidebar } from "@/components/layout/Sidebar";
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
`;
fs.writeFileSync(dashboardLayoutPath, dashboardLayoutContent);

console.log('Routes scaffolded successfully!');
