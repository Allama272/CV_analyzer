import { useParams } from "react-router"
import type { ResumeFeedback } from "@/types";
import { useEffect, useState } from "react";
import resumeFeedbackDataJson from '@/mock/resume-feedback.json'
import Summary from "@/components/Summary";
import ATS from "@/components/ATS";
import Details from "@/components/Details";

function DetailedResumePage() {
    const { resumeId } = useParams();
    const [resumeData, setResumeData] = useState<ResumeFeedback>();

    useEffect(() => {
        const resume = resumeFeedbackDataJson as ResumeFeedback;
        setResumeData(resume);
    }, [resumeId]);
    console.log(resumeData);
    console.log("ResumeID:", resumeId)
    return (
        <div className="flex flex-row w-full max-lg:flex-col-reverse">
            <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-[100vh] sticky top-0 items-center justify-center">
                {resumeData?.cvImageUrl && (
                    <div className="animae-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
                        <a href='#' target="_blank">
                            <img src={resumeData.cvImageUrl} alt=""
                                className="w-full h-full object-contain rounded-2xl"
                                title="resume" />
                        </a>
                    </div>
                )}

            </section>
            <section className="feedback-section">
                <h2 className="text-4xl text-primary font-bold">Resume Review</h2>
                {resumeData ? (
                    <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                        <Summary feedback={resumeData} />
                        <ATS score={resumeData.ats.score || 0} suggestions={resumeData.ats.tips || []} />
                        <Details feedback={resumeData} />
                    </div>
                ) : (
                    <img src="/images/resume-scan-2.gif" className="w-full" alt="" />
                )}
            </section>
        </div>
    )
}

export default DetailedResumePage