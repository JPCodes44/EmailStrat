import { useState } from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import './components/campaigns/styles.css';
import './components/email-table/styles.css';
import './components/outreach/styles.css';
import './components/jobs/styles.css';
import './components/draft-review/styles.css';
import './components/schedule/styles.css';
import './components/modals/styles.css';
import { CampaignsScreen } from './components/campaigns/Campaigns';
import { DraftReviewScreen } from './components/draft-review/DraftReview';
import { EmailTableScreen } from './components/email-table/EmailTable';
import { GenerationJobsScreen, TopBar } from './components/jobs/GenerationJobs';
import { ScheduleSubmissionScreen } from './components/schedule/ScheduleSubmission';
import { jobsNavItems } from './components/jobs/data';
import { Sidebar } from './components/outreach/Sidebar';
import { Screen } from './components/outreach/Screen';
import { OutreachProvider } from './components/outreach/OutreachContext';

const companyPageId = 'companies';
const campaignsPageId = 'campaigns';
const emailTablePageId = 'email-table';
const draftsPageId = 'drafts';
const schedulePageId = 'schedule';
const brand = { title: 'Outreach OS', subtitle: 'Enterprise Outreach' };

const convexUrl = import.meta.env.VITE_CONVEX_URL;
if (!convexUrl) {
  throw new Error('VITE_CONVEX_URL is not set. Add it to frontend/.env.local.');
}
const convex = new ConvexReactClient(convexUrl);

/** App root — swaps between implemented Outreach OS screens. */
export function App() {
  const [activePage, setActivePage] = useState(companyPageId);

  return (
    <ConvexProvider client={convex}>
      <OutreachProvider>
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
                activePage === campaignsPageId ||
                activePage === emailTablePageId
                  ? 'appPageFlush'
                  : ''
              }`}
            >
              {activePage === companyPageId ? (
                <Screen
                  onViewCompanies={() => setActivePage(campaignsPageId)}
                />
              ) : activePage === campaignsPageId ? (
                <CampaignsScreen
                  onViewDraftReview={() => setActivePage(draftsPageId)}
                />
              ) : activePage === emailTablePageId ? (
                <EmailTableScreen />
              ) : activePage === draftsPageId ? (
                <DraftReviewScreen
                  onContinue={() => setActivePage(schedulePageId)}
                />
              ) : activePage === schedulePageId ? (
                <ScheduleSubmissionScreen
                  onBack={() => setActivePage(draftsPageId)}
                />
              ) : (
                <GenerationJobsScreen />
              )}
            </div>
          </main>
        </div>
      </OutreachProvider>
    </ConvexProvider>
  );
}
