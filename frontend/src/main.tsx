import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router";
import './index.css'
import MainLayout from './layouts/MainLayout.tsx'
import App from './App.tsx';
import ResumesPage from './pages/ResumesPage.tsx';


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
