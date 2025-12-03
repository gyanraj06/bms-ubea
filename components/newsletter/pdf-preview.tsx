"use client";

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

interface PdfPreviewProps {
    url: string;
    className?: string;
}

export default function PdfPreview({ url, className = "" }: PdfPreviewProps) {
    const [numPages, setNumPages] = useState<number>();
    const [pageNumber, setPageNumber] = useState<number>(1);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    return (
        <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
            <Document
                file={url}
                onLoadSuccess={onDocumentLoadSuccess}
                className="flex justify-center"
                loading={
                    <div className="flex items-center justify-center h-48 w-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
                    </div>
                }
                error={
                    <div className="flex items-center justify-center h-48 w-full text-gray-400 text-sm">
                        Preview not available
                    </div>
                }
            >
                <Page
                    pageNumber={pageNumber}
                    width={400} // Set a fixed width or make it responsive
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="shadow-sm"
                />
            </Document>
        </div>
    );
}
