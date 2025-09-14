import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router";
import './index.css'
import MainLayout from './layouts/MainLayout.tsx'
import App from './App.tsx';
import ResumesPage from './pages/ResumesPage.tsx';
import DetailedResumePage from './pages/DetailedResumePage.tsx';
import UploadResume from './pages/UploadResume.tsx';


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
      path:'resumes',
      element:<ResumesPage/>
    },
    {
      path:'resume/:resumeId',
      element:<DetailedResumePage/>
    },
    {
      path:'upload-resume',
      element:<UploadResume/>
    },
    {
      path: '*',
      element: <div>404 Not Found</div>,
    }
  ]
},
])
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode >,
)
