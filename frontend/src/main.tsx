import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router";
import './index.css'
import MainLayout from './layouts/MainLayout.tsx'
import App from './App.tsx';
import ResumesPage from './pages/ResumesPage.tsx';
import DetailedResumePage from './pages/DetailedResumePage.tsx';
import UploadResume from './pages/UploadResume.tsx';
import LoginPage from './pages/LoginPage.tsx';
import { AuthContextProvider } from "@/context/AuthContext.tsx"
import JobsPage from './pages/JobsPage.tsx';
import AddJobPage from './pages/AddJobPage.tsx';
import JobDetailPage from './pages/JobDetailsPage.tsx';
import JobAnalysisPage from './pages/JobAnalysisPage.tsx';
import AnalyticsPage from './pages/AnalyticsPage.tsx';

const router = createBrowserRouter([{
  path: '/',
  element: <MainLayout />,
  errorElement: <div> 404 Not Found</div>,
  children: [
    {
      index: true,
      element: <App />,
    },
    {
      path: 'resumes',
      element: <ResumesPage />
    },
    {
      path: 'resume/:resumeId',
      element: <DetailedResumePage />
    },
    {
      path: 'upload-resume',
      element: <UploadResume />
    },
    {
      path: 'jobs',
      element: <JobsPage />
    },
    {
      path: '*',
      element: <div>404 Not Found</div>,
    },
    {
      path: 'login',
      element: <LoginPage />
    },
    {
      path: 'add-job',
      element: <AddJobPage />
    },
    {
      path: 'job/:jobId',
      element: <JobDetailPage />
    },
    {
      path: 'job-analyzed/:feedbackId',
      element: <JobAnalysisPage />
    },
    {
      path: 'analytics/summary',
      element: <AnalyticsPage />
    }
  ]
}
])
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthContextProvider>
      <RouterProvider router={router} />
    </AuthContextProvider>
  </StrictMode >,
)
