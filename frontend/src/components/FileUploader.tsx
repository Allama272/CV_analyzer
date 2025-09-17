import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { formatSize } from '../lib/utils'
import { Button } from '@/components/ui/button';
import { Upload, FileText } from 'lucide-react';
interface FileUploaderProps {
    onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0] || null;
        setSelectedFile(file)
        onFileSelect?.(file);
    }, [onFileSelect]);

    const maxFileSize = 20 * 1024 * 1024; // 20MB in bytes

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        multiple: false,
        // TODO Add doc and docx
        accept: { 'application/pdf': ['.pdf'] },
        maxSize: maxFileSize,
    })

    const handleRemoveFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedFile(null);
        onFileSelect?.(null);
    };


    return (
        <div
            className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-muted-foreground transition-colors cursor-pointer bg-muted/50"
            {...getRootProps()}
        >
            <input {...getInputProps()} />
            {selectedFile ? (
                <div
                    className="flex items-center justify-between bg-card p-4 rounded-lg border border-border"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center space-x-3">
                        <FileText className="w-8 h-8 text-destructive" />
                        <div className="text-left">
                            <p className="text-sm font-medium text-foreground truncate max-w-xs">
                                {selectedFile.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {formatSize(selectedFile.size)}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFile}
                        className="text-muted-foreground hover:text-destructive"
                    >
                        ×
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-accent rounded-full flex items-center justify-center">
                        <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <p className="text-lg font-medium text-foreground">
                            Drop your resume here, or{" "}
                            <span className="text-primary underline">browse</span>
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            PDF files up to 20MB
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
export default FileUploader