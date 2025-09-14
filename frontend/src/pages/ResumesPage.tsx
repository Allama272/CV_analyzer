import type { IResumeData, IResume } from "@/types";
import { useEffect, useState } from "react"
import resumeData from '@/mock/resumesData.json'
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
} from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
import { Link } from "react-router";

function ResumesPage() {
  const [userResumes, setUserResumes] = useState<IResume[]>([]);

  function getUserResumes() {
    const data: IResumeData = resumeData;
    setUserResumes(data.resumes)
  }

  const renderResumeCards = (resume: IResume) => {
    let textColor = '';

    if (resume.cvScore > 70) {
      textColor = "text-[var(--badge-green-text)]";
    } else if (resume.cvScore > 49) {
      textColor = "text-[var(--badge-yellow-text)]";
    } else {
      textColor = "text-[var(--badge-red-text)]";
    }
    return (

      <div className="grid grid-cols-2 items-center gap-x-4 gap-y-3 px-4 py-5 md:grid-cols-4 md:gap-4">
        {/* Description: Spans full width on mobile, sits in the middle on desktop */}
        <p className="order-1 col-span-2 text-2xl font-semibold md:order-2 md:col-span-2">
          {resume.cvTitle}
        </p>

        {/* Image and Title: First item on the second row on mobile */}
        <div className="order-2 flex items-center gap-2 md:order-1">
          <span className="h-12 md:h-16 w-20 md:w-28 shrink-0 overflow-hidden rounded-md bg-muted">
            <img src={resume.cvImageUrl} alt="resume photo"
              className="h-full w-full object-cover object-top-left" />
          </span>
          <div className="flex flex-col gap-1">
            <h3 className={cn("font-bold", textColor)}>{resume.cvScore}</h3>
            <p className="text-sm text-muted-foreground">{resume.cvUploadDate}</p>
          </div>
        </div>

        {/* View Button: Pushed to the far right on mobile */}
        <Button variant="outline" asChild>
          <a
            className="order-3 justify-self-end md:order-3"
            href="#"
          >
            <span className="hidden sm:inline">View Resume</span>
            <span className="sm:hidden">View</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    );
  };

  useEffect(() => {
    getUserResumes();
  }, []);

  return (
    <div className="container px-2 md:px-8 py-5">
      <h1 className="mb-10 px-4 text-3xl font-semibold md:mb-14 md:text-6xl text-center">
        Uploaded Resumes
      </h1>
      <div className="flex flex-col">
        <Separator />
        {userResumes.map((resume, index) => (
          <React.Fragment key={index}>
            {renderResumeCards(resume)}
            <Separator />
          </React.Fragment>
        ))}
      </div>
      <div className="flex flex-row justify-center p-10">
        <Link to="/upload-resume">
          <Button variant={"outline"} className="mx-auto my-10 text-xl px-10 py-7 hover:cursor-pointer rounded-2xl">
            Add A New Resume
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default ResumesPage