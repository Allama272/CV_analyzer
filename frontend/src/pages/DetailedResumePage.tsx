import { useParams } from "react-router"
import type { ResumeFeedback } from "@/types";
import { useEffect, useState } from "react";
import resumeFeedbackDataJson from '@/mock/resume-feedback.json'
import Summary from "@/components/Summary";
import ATS from "@/components/ATS";
import Details from "@/components/Details";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ScoreGauge from "@/components/ScoreGauge";

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
        <div>
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

            <Separator className="my-4 mx-4" />

            <h1 className="text-5xl sm:text-6xl mx-auto text-center pt-10 pb-4 px-5"> Jobs Analyzed </h1>
            <div className="flex flex-col md:flex-row flex-wrap content-center justify-start  gap-4 py-10 mx-auto px-5">
                <Card className="w-52 h-64">
                    <CardHeader>
                        <CardTitle className="w-full text-center text-xl overflow-hidden overflow-ellipsis">AI Engineer</CardTitle>
                        <CardDescription className="w-full text-center overflow-hidden overflow-ellipsis">Gamma Pegassi TB</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScoreGauge score={82} />
                    </CardContent>
                    <CardFooter>
                        <CardDescription className="w-full text-center">2024-05-15</CardDescription>
                    </CardFooter>
                </Card>

                {/* add a new job */}
                <Card className="w-52 h-64 flex justify-center align-middle hover:cursor-pointer hover:shadow-xl hover:shadow-border">
                    <h1 className="text-7xl text-gray-400 text-center">+</h1>
                </Card>

            </div>
        </div>
    )
}

export default DetailedResumePage