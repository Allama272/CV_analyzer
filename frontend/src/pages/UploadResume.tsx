import FileUploader from "@/components/FileUploader";
import { useState } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Search, Target } from 'lucide-react';



function UploadResume() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (selectedFile: File | null) => {
        setFile(selectedFile);
    };

    const handleSubmit = async () => {
        if (!file) return;

        setIsProcessing(true);
        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsProcessing(false);
    };

    const features = [
        {
            icon: Search,
            title: "Smart Analysis",
            description: "AI-powered parsing of your resume content"
        },
        {
            icon: Target,
            title: "Skills Matching",
            description: "Identify gaps and strengths in your skillset"
        },
        {
            icon: Zap,
            title: "Instant Feedback",
            description: "Get actionable insights in seconds"
        }
    ];

    return (
        <div>
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-foreground mb-4">
                        Analyze Your Resume with{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--gauge-start)] to-[var(--gauge-end)]">
                            AI
                        </span>
                    </h2>
                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Upload your resume and get instant, actionable feedback to improve your
                        job prospects
                    </p>

                    {/* Features */}
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-card/60 backdrop-blur-sm rounded-xl p-6 border border-border"
                            >
                                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <feature.icon className="w-6 h-6 text-secondary-foreground" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upload Card */}
                <Card className="max-w-2xl mx-auto shadow-xl bg-card/80 backdrop-blur-sm">
                    <CardHeader className="text-center pb-4">
                        <CardTitle className="text-2xl text-foreground">
                            Upload Your Resume
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Choose your resume file to get started with the analysis
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FileUploader onFileSelect={handleFileSelect} />

                        <div className="pt-4">
                            <Button
                                onClick={handleSubmit}
                                disabled={!file || isProcessing}
                                className="w-full cursor-pointer bg-gradient-to-r from-[var(--gauge-start)] to-[var(--gauge-end)] text-white font-medium py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                                size="lg"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Analyzing Resume...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-5 h-5 mr-2" />
                                        Analyze Resume
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="text-center pt-2">
                            <p className="text-sm text-muted-foreground">
                                Your resume data is processed securely
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default UploadResume