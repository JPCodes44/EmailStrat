import { useState } from 'react';
import './components/campaigns/styles.css';
import './components/email-table/styles.css';
import './components/outreach/styles.css';
import './components/jobs/styles.css';
import './components/draft-review/styles.css';
import './components/schedule/styles.css';
import { CampaignsScreen } from './components/campaigns/Campaigns';
import { DraftReviewScreen } from './components/draft-review/DraftReview';
import { EmailTableScreen } from './components/email-table/EmailTable';
import { GenerationJobsScreen, TopBar } from './components/jobs/GenerationJobs';
import { ScheduleSubmissionScreen } from './components/schedule/ScheduleSubmission';
import { jobsNavItems } from './components/jobs/data';
import { Sidebar } from './components/outreach/Sidebar';
import { Screen } from './components/outreach/Screen';

const companyPageId = 'companies';
const campaignsPageId = 'campaigns';
const emailTablePageId = 'email-table';
const draftsPageId = 'drafts';
const schedulePageId = 'schedule';
const jobsPageId = 'jobs';
const brand = { title: 'Outreach OS', subtitle: 'Enterprise Outreach' };

/** App root — swaps between implemented Outreach OS screens. */
export function App() {
  const [activePage, setActivePage] = useState(jobsPageId);
  const page =
    activePage === companyPageId ? (
      <Screen />
    ) : activePage === campaignsPageId ? (
      <CampaignsScreen />
    ) : activePage === emailTablePageId ? (
      <EmailTableScreen />
    ) : activePage === draftsPageId ? (
      <DraftReviewScreen onContinue={() => setActivePage(schedulePageId)} />
    ) : activePage === schedulePageId ? (
      <ScheduleSubmissionScreen onBack={() => setActivePage(draftsPageId)} />
    ) : (
      <GenerationJobsScreen />
    );

  return (
    <div className="appShell">
      <Sidebar
        brand={brand}
        items={jobsNavItems}
        activeId={activePage}
        onSelect={setActivePage}
      />
      <main className="appMain">
        <TopBar />
        <div
          className={`appPage ${
            activePage === campaignsPageId || activePage === emailTablePageId
              ? 'appPageFlush'
              : ''
          }`}
        >
          {page}
        </div>
      </main>
    </div>
  );
}
