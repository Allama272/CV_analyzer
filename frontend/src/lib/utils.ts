import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  // Determine the appropriate unit by calculating the log
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // Format with 2 decimal places and round
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export const downloadPdfFromUrl = async (url: string, filename: string): Promise<void> => {
  try {
    // 1. Fetch the file from the external URL
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    // 2. Convert the response into a Blob
    const blob: Blob = await response.blob();

    // 3. Create a local Object URL for the Blob
    const blobUrl: string = window.URL.createObjectURL(blob);

    // 4. Create a temporary anchor element to trigger the download
    const link: HTMLAnchorElement = document.createElement('a');
    link.href = blobUrl;
    link.download = filename || 'downloaded-file.pdf';

    // 5. Append to the DOM, click, and clean up
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 6. Free up browser memory by revoking the Object URL
    window.URL.revokeObjectURL(blobUrl);

  } catch (error) {
    console.error("Error downloading the PDF:", error);
    // Optional: Trigger a toast notification to the user here
  }
};