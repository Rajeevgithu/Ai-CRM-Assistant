import Header from "@/components/Header";
import LeadList from "@/components/LeadList";

export default function PipelinePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground">Sales Pipeline</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Manage leads and opportunities</p>
          </div>
        </div>
        <LeadList />
      </main>
    </div>
  );
} 