import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Book, Download, FileText, Loader2, BookOpen, X, Maximize2, Minimize2 } from "lucide-react";
import type { MahapuranPdf } from "@shared/schema";
import { useState } from "react";
import PdfViewer from "@/components/PdfViewer";

export default function MahapuranLibrary() {
  const [selectedPdf, setSelectedPdf] = useState<MahapuranPdf | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const { data: pdfs, isLoading } = useQuery<MahapuranPdf[]>({
    queryKey: ["/api/mahapuran-pdfs"],
  });

  const handleDownload = (pdfUrl: string, languageName: string) => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `Shreemad_Bhagwat_Mahapuran_${languageName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRead = (pdf: MahapuranPdf) => {
    setSelectedPdf(pdf);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loader-mahapuran" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Book className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground dark:text-foreground">
              Shreemad Bhagwat Mahapuran
            </h1>
            <p className="text-muted-foreground mt-1">
              The sacred scripture in multiple languages
            </p>
          </div>
        </div>
        
        <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-lg p-4">
          <p className="text-sm text-foreground dark:text-foreground leading-relaxed">
            The Shreemad Bhagwat Mahapuran is one of the eighteen great Puranas and is considered the essence of all Vedic literature. 
            It contains the divine stories of Lord Krishna and profound spiritual wisdom. Read or download the complete scripture in your preferred language.
          </p>
        </div>
      </div>

      {!pdfs || pdfs.length === 0 ? (
        <Card className="p-12 text-center bg-card dark:bg-card">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-foreground dark:text-foreground">
            PDFs Coming Soon
          </h3>
          <p className="text-muted-foreground">
            The Mahapuran PDFs in different languages will be available here soon.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pdfs.map((pdf) => (
            <Card
              key={pdf.id}
              className="p-6 hover:shadow-xl transition-all duration-300 bg-card dark:bg-card border-border dark:border-border"
              data-testid={`card-pdf-${pdf.id}`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-semibold text-foreground dark:text-foreground">
                        {pdf.languageName}
                      </h3>
                    </div>
                    
                    <Badge variant="secondary" className="mb-3">
                      {pdf.languageCode.toUpperCase()}
                    </Badge>
                    
                    {pdf.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {pdf.description}
                      </p>
                    )}
                    
                    {pdf.fileSize && (
                      <p className="text-xs text-muted-foreground">
                        File size: {(pdf.fileSize / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    )}
                    
                    {pdf.totalChapters && (
                      <p className="text-xs text-muted-foreground">
                        Chapters: {pdf.totalChapters}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-4 border-t border-border dark:border-border">
                  {pdf.pdfUrl && (
                    <>
                      <Button
                        onClick={() => handleRead(pdf)}
                        className="w-full"
                        variant="default"
                        data-testid={`button-read-${pdf.id}`}
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Read Online
                      </Button>
                      
                      <Button
                        onClick={() => handleDownload(pdf.pdfUrl!, pdf.languageName)}
                        variant="outline"
                        className="w-full"
                        data-testid={`button-download-${pdf.id}`}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </>
                  )}
                  {!pdf.pdfUrl && (
                    <p className="text-sm text-center text-muted-foreground py-2">
                      PDF will be available soon
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 p-6 bg-muted/50 dark:bg-muted/30 rounded-lg border border-border dark:border-border">
        <h3 className="font-semibold mb-3 text-foreground dark:text-foreground flex items-center gap-2">
          <Book className="h-5 w-5" />
          About Reading Options
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span><strong>Read Online:</strong> Opens the PDF in a new tab for immediate reading in your browser</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span><strong>Download PDF:</strong> Saves the complete PDF to your device for offline reading</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>All PDFs contain the complete Shreemad Bhagwat Mahapuran with all 12 Skandas (books)</span>
          </li>
        </ul>
      </div>

      <Dialog open={!!selectedPdf} onOpenChange={(open) => { if (!open) { setSelectedPdf(null); setIsFullscreen(false); } }}>
        <DialogContent className={isFullscreen ? "max-w-full w-screen h-screen p-0 m-0" : "max-w-6xl w-[95vw] h-[90vh] p-0"} data-testid="dialog-pdf-viewer">
          {selectedPdf && (
            <div className="flex flex-col h-full">
              {!isFullscreen && (
                <DialogHeader className="px-4 md:px-6 py-3 md:py-4 border-b flex-shrink-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <DialogTitle className="text-lg md:text-xl truncate">{selectedPdf.title}</DialogTitle>
                      <DialogDescription className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="secondary" className="text-xs">{selectedPdf.languageName}</Badge>
                        {selectedPdf.totalChapters && (
                          <span className="text-xs text-muted-foreground">
                            {selectedPdf.totalChapters} Chapters
                          </span>
                        )}
                      </DialogDescription>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        data-testid="button-toggle-fullscreen"
                        className="text-xs"
                      >
                        <Maximize2 className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                        <span className="hidden md:inline">Fullscreen</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(selectedPdf.pdfUrl!, selectedPdf.languageName)}
                        data-testid="button-download-pdf-viewer"
                        className="text-xs"
                      >
                        <Download className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                        <span className="hidden md:inline">Download</span>
                      </Button>
                    </div>
                  </div>
                </DialogHeader>
              )}
              
              <div className="flex-1 overflow-hidden relative">
                {selectedPdf.pdfUrl && (
                  <PdfViewer
                    url={selectedPdf.pdfUrl}
                    title={`${selectedPdf.title} - ${selectedPdf.languageName}`}
                  />
                )}
                
                {isFullscreen && (
                  <div className="absolute top-4 right-4 flex gap-2 z-50">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsFullscreen(false)}
                      data-testid="button-exit-fullscreen"
                      className="shadow-lg"
                    >
                      <Minimize2 className="h-4 w-4 mr-2" />
                      Exit Fullscreen
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDownload(selectedPdf.pdfUrl!, selectedPdf.languageName)}
                      data-testid="button-download-fullscreen"
                      className="shadow-lg"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                )}
              </div>

              {selectedPdf.description && !isFullscreen && (
                <div className="px-4 md:px-6 py-2 md:py-3 border-t bg-muted/30 flex-shrink-0">
                  <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{selectedPdf.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
