import { useState } from "react";

import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import StatsCards from "../components/dashboard/StatsCards";
import AnalyticsSection from "../components/dashboard/AnalyticsSection";
import RecentLinks from "../components/dashboard/RecentLinks";
import CreateLinkModal from "../components/dashboard/CreateLinkModal";

function Dashboard() {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshLinks, setRefreshLinks] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">

      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">

        <Topbar
          onCreateLink={() => setIsModalOpen(true)}
        />

        <section className="mt-8">
          <StatsCards />
        </section>

        <section className="mt-8">
          <AnalyticsSection />
        </section>

        <section className="mt-8">
          <RecentLinks
            onCreateLink={() => setIsModalOpen(true)}
            refresh={refreshLinks}
          />
        </section>

      </main>

      <CreateLinkModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setRefreshLinks(prev => !prev);
        }}
      />

    </div>
  );
}

export default Dashboard;