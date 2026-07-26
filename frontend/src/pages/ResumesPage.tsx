import type { IResume } from "@/types";

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
} from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
import { Link } from "react-router";
import { supabase } from "@/supabaseClient";
import { toast } from 'sonner';

const apiUrl = import.meta.env.VITE_DEV_SERVER;
const storageLocation = import.meta.env.VITE_LOCAL_STORAGE;

function ResumesPage() {
  const [userResumes, setUserResumes] = useState<IResume[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const renderResumeCards = (resume: IResume) => {
    let textColor = '';

    if (resume.resumeOverallScore > 70) {
      textColor = "text-[var(--badge-green-text)]";
    } else if (resume.resumeOverallScore > 49) {
      textColor = "text-[var(--badge-yellow-text)]";
    } else {
      textColor = "text-[var(--badge-red-text)]";
    }
    const date = new Date(resume.resumeUploadDate);
    const formattedDate = date.toLocaleDateString()
    console.log(formattedDate);
    return (

      <div className="grid grid-cols-2 items-center gap-x-4 gap-y-3 px-4 py-5 md:grid-cols-4 md:gap-4">
        {/* Description: Spans full width on mobile, sits in the middle on desktop */}
        <p className="order-1 col-span-2 text-2xl font-semibold md:order-2 md:col-span-2">
          {resume.resumeTitle}
        </p>

        {/* Image and Title: First item on the second row on mobile */}
        <div className="order-2 flex items-center gap-2 md:order-1">
          <span className="h-12 md:h-16 w-20 md:w-28 shrink-0 overflow-hidden rounded-md bg-muted">

            <img src={`${storageLocation}/thumbnail/${resume.resumeThumbnailUrl}`} alt="resume photo"
              className="h-full w-full object-cover object-top-left" />
          </span>
          <div className="flex flex-col gap-1">
            <h3 className={cn("font-bold", textColor)}>{resume.resumeOverallScore}</h3>
            <p className="text-sm text-muted-foreground">{formattedDate}</p>
          </div>
        </div>

        {/* View Button: Pushed to the far right on mobile */}
        <Button variant="outline" asChild>
          <Link
            className="order-3 justify-self-end md:order-3"
            to={`/resume/${resume.resumeId}`}
          >
            <span className="hidden sm:inline">View Resume</span>
            <span className="sm:hidden">View</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  };

  useEffect(() => {

    const getUserResumes = async () => {
      setIsLoading(true);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Authentication error. Please log in again.");
          return;
        }

        const response = await fetch(`${apiUrl}/api/resume/get-resumes`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch resumes.');
        }
        const resumes = await response.json() as IResume[];
        setUserResumes(resumes);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(`Failed to load resumes: ${error.message}`);
        } else {
          toast.error("An unexpected error occurred while loading resumes.");
        }
      } finally {
        setIsLoading(false);
      }
    }
    getUserResumes();
  }, []);

  return (
    <div className="container px-2 md:px-8 py-5">
      <h1 className="mb-10 px-4 text-3xl font-semibold md:mb-14 md:text-6xl text-center">
        Uploaded Resumes
      </h1>
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-16 h-16 border-4 border-t-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="ml-4 text-gray-500">Loading resumes...</p>
        </div>
      ) : userResumes.length > 0 ? (
        <div className="flex flex-col">
          <Separator />
          {userResumes.map((resume, index) => (
            <React.Fragment key={index}>
              {renderResumeCards(resume)}
              <Separator />
            </React.Fragment>
          ))}
        </div>)
        : ( // no resume uploaded
          <div className="text-center pt-20">
            <h3 className="text-2xl font-semibold text-gray-700">No resumes found</h3>
            <p className="mt-2 text-gray-500">It looks like you haven't uploaded any resumes yet. Click the button below to add your first one!</p>
          </div>
        )}
      < div className="flex flex-row justify-center p-10">
        <Link to="/upload-resume">
          <Button variant={"outline"} className="mx-auto my-10 text-xl px-10 py-7 hover:cursor-pointer rounded-2xl">
            Add A New Resume
          </Button>
        </Link>
      </div>
    </div >
  )
}

export default ResumesPage