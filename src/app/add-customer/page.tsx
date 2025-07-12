import Header from "@/components/Header";
import AddCustomerForm from "@/components/AddCustomerForm";

export default function AddCustomerPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-2xl mx-auto py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8">
        <AddCustomerForm />
      </main>
    </div>
  );
} 