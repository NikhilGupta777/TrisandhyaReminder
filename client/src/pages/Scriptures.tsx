import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Book, BookOpen, Loader2, FileText, Download, Maximize2, Minimize2, X } from "lucide-react";
import type { ScripturePdf } from "@shared/schema";
import PdfViewer from "@/components/PdfViewer";

export default function Scriptures() {
  const [selectedPdf, setSelectedPdf] = useState<ScripturePdf | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const { data: pdfs, isLoading } = useQuery<ScripturePdf[]>({
    queryKey: ["/api/scripture-pdfs"],
  });

  const handleDownload = (pdfUrl: string, languageName: string) => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `Sacred_Scripture_${languageName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRead = (pdf: ScripturePdf) => {
    setSelectedPdf(pdf);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loader-scriptures" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <BookOpen className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground dark:text-foreground">
              Sacred Scriptures
            </h1>
            <p className="text-muted-foreground mt-1">
              Explore the timeless wisdom of our sacred texts
            </p>
          </div>
        </div>
        
        <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-lg p-4">
          <p className="text-sm text-foreground dark:text-foreground leading-relaxed">
            Dive deep into the sacred scriptures and discover profound spiritual wisdom. Each scripture is organized 
            into books (Skandas) and chapters for easy navigation and study. Read at your own pace and let the divine 
            teachings guide your spiritual journey.
          </p>
        </div>
      </div>

      {!pdfs || pdfs.length === 0 ? (
        <Card className="p-12 text-center bg-card dark:bg-card">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-foreground dark:text-foreground">
            Scriptures Coming Soon
          </h3>
          <p className="text-muted-foreground">
            Sacred scripture texts will be available here soon for your study and reflection.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pdfs.map((pdf) => (
            <Card
              key={pdf.id}
              className="p-6 hover:shadow-xl transition-all duration-300 bg-card dark:bg-card border-border dark:border-border group"
              data-testid={`card-scripture-${pdf.id}`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Book className="h-5 w-5 text-primary flex-shrink-0" />
                      <h3 
                        className="text-xl font-semibold text-foreground dark:text-foreground truncate" 
                        title={pdf.title}
                        data-testid={`text-title-${pdf.id}`}
                      >
                        {pdf.title}
                      </h3>
                    </div>
                    
                    <Badge variant="secondary" className="mb-3" data-testid={`badge-language-${pdf.id}`}>
                      {pdf.languageCode.toUpperCase()}
                    </Badge>
                    
                    {pdf.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3" data-testid={`text-description-${pdf.id}`}>
                        {pdf.description}
                      </p>
                    )}
                    
                    <div className="space-y-1 text-xs text-muted-foreground">
                      {pdf.fileSize && (
                        <p className="flex items-center gap-1" data-testid={`text-filesize-${pdf.id}`}>
                          File size: {(pdf.fileSize / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      )}
                      {pdf.totalChapters && (
                        <p className="flex items-center gap-1" data-testid={`text-chapters-${pdf.id}`}>
                          <FileText className="h-3 w-3" />
                          Chapters: {pdf.totalChapters}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-border dark:border-border">
                  {pdf.pdfUrl && (
                    <>
                      <Button
                        onClick={() => handleRead(pdf)}
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        variant="default"
                        data-testid={`button-read-${pdf.id}`}
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Read Online
                      </Button>
                      <Button
                        onClick={() => handleDownload(pdf.pdfUrl!, pdf.languageName)}
                        className="w-full"
                        variant="outline"
                        data-testid={`button-download-${pdf.id}`}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </>
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
            <span><strong>Download PDF:</strong> Save the scripture to your device for offline reading and study</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Available in multiple languages to help you study in the language most comfortable for you</span>
          </li>
        </ul>
      </div>

      <Dialog open={!!selectedPdf} onOpenChange={(open) => !open && setSelectedPdf(null)}>
        <DialogContent className={`${isFullscreen ? 'max-w-full h-screen' : 'max-w-5xl h-[90vh]'} p-0 flex flex-col`}>
          {selectedPdf && (
            <div className="flex flex-col h-full overflow-hidden">
              {!isFullscreen && (
                <DialogHeader className="p-4 md:p-6 border-b flex-shrink-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg md:text-xl font-semibold truncate" title={selectedPdf.title}>
                        {selectedPdf.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Badge variant="secondary">{selectedPdf.languageCode.toUpperCase()}</Badge>
                        {selectedPdf.totalChapters && (
                          <span>{selectedPdf.totalChapters} Chapters</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsFullscreen(true)}
                        data-testid="button-fullscreen"
                      >
                        <Maximize2 className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Fullscreen</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(selectedPdf.pdfUrl!, selectedPdf.languageName)}
                        data-testid="button-download"
                      >
                        <Download className="h-4 w-4 md:mr-2" />
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
                    title={selectedPdf.title}
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
