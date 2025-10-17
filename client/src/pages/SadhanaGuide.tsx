import { Card } from "@/components/ui/card";
import { JapCounterConnected } from "@/components/JapCounterConnected";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, Clock, Info, Book, BookOpen, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { TrisandhyaPdf } from "@shared/schema";
import lotusImage from "@assets/stock_images/lotus_flower_sacred__88abbb01.jpg";
import PdfViewer from "@/components/PdfViewer";

export default function SadhanaGuide() {
  const { data: trisandhyaPdfs } = useQuery<TrisandhyaPdf[]>({
    queryKey: ["/api/trisandhya-pdfs"],
  });

  const [selectedPdf, setSelectedPdf] = useState<TrisandhyaPdf | null>(null);
  const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false);

  const handleReadPdf = (pdf: TrisandhyaPdf) => {
    setSelectedPdf(pdf);
    setIsPdfDialogOpen(true);
  };

  const handleDownloadPdf = (pdfUrl: string, languageName: string) => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `Trisandhya_Path_${languageName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-8">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold font-serif">Daily Sadhna</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Complete Trisandhya Path from Bhavishya Malika</p>
      </div>

      <Tabs defaultValue="trisandhya" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="trisandhya" className="text-xs sm:text-sm" data-testid="tab-trisandhya">Trisandhya Path</TabsTrigger>
          <TabsTrigger value="mahapuran" className="text-xs sm:text-sm" data-testid="tab-mahapuran">Mahapuran</TabsTrigger>
          <TabsTrigger value="jap" className="text-xs sm:text-sm" data-testid="tab-jap">Madhav Jap</TabsTrigger>
        </TabsList>

        <TabsContent value="trisandhya" className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-semibold font-serif">Complete Trisandhya Recitation</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Perform this sacred practice three times daily • Duration: 10-15 minutes
              </p>
            </div>
            
            {/* Trisandhya Path PDFs Section */}
            {trisandhyaPdfs && trisandhyaPdfs.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {trisandhyaPdfs.map((pdf) => (
                  <Card
                    key={pdf.id}
                    className="p-6 hover:shadow-xl transition-all duration-300 bg-card dark:bg-card border-border dark:border-border"
                    data-testid={`card-trisandhya-pdf-${pdf.id}`}
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
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 pt-4 border-t border-border dark:border-border">
                        {pdf.pdfUrl && (
                          <>
                            <Button
                              onClick={() => handleReadPdf(pdf)}
                              className="w-full"
                              variant="default"
                              data-testid={`button-read-trisandhya-${pdf.id}`}
                            >
                              <BookOpen className="h-4 w-4 mr-2" />
                              Read Online
                            </Button>
                            
                            <Button
                              onClick={() => handleDownloadPdf(pdf.pdfUrl!, pdf.languageName)}
                              variant="outline"
                              className="w-full"
                              data-testid={`button-download-trisandhya-${pdf.id}`}
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
            ) : (
              <Card className="p-12 text-center bg-card dark:bg-card">
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-foreground dark:text-foreground">
                  PDFs Coming Soon
                </h3>
                <p className="text-muted-foreground">
                  The complete Trisandhya Path PDFs in different languages will be available here soon for download and reading.
                </p>
              </Card>
            )}

            <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Info className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-base">Important Note</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    This sacred practice takes only 10-15 minutes. Perform it three times daily at the prescribed 
                    timings to receive divine protection and spiritual benefits as mentioned in Bhavishya Malika. 
                    Regular practice brings peace, prosperity, and spiritual progress.
                  </p>
                </div>
              </div>
            </Card>
        </TabsContent>

        <TabsContent value="mahapuran" className="space-y-4">
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold font-serif">Sacred Mahapuran Library</h2>
              <p className="text-muted-foreground">
                Explore the divine wisdom of the Mahapurans - ancient scriptures containing spiritual knowledge and cosmic truths
              </p>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-lg space-y-4">
              <h3 className="font-semibold text-lg">📚 Complete Collection</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Access the complete Mahapuran texts organized by titles, skandas (books), and chapters. Each text is presented
                in an easy-to-read format with summaries and navigation.
              </p>
              <Button 
                className="w-full sm:w-auto" 
                onClick={() => (window.location.href = "/mahapuran")}
                data-testid="button-browse-mahapuran"
              >
                <Book className="h-4 w-4 mr-2" />
                Browse Mahapuran Library
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Daily Reading</h4>
                <p className="text-sm text-muted-foreground">
                  Reading one chapter daily brings wisdom and spiritual growth. Start your journey today!
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Organized Structure</h4>
                <p className="text-sm text-muted-foreground">
                  Navigate through titles → skandas → chapters with ease and track your reading progress.
                </p>
              </div>
            </div>

            <div className="p-4 bg-accent/50 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                💡 Tip: Combine Mahapuran reading with your daily Trisandhya practice for complete spiritual development
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="jap" className="space-y-4">
          <JapCounterConnected />
          <Card className="p-4 bg-accent/50">
            <p className="text-sm text-center text-muted-foreground leading-relaxed">
              Regular chanting of "Mādhava Mādhava" purifies the mind and brings you closer to the divine presence. 
              The continuous repetition is the essence of spiritual practice.
            </p>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Trisandhya PDF Viewer Dialog */}
      <Dialog open={isPdfDialogOpen} onOpenChange={setIsPdfDialogOpen}>
        <DialogContent className="max-w-7xl h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0 border-b">
            <DialogTitle className="text-xl font-serif">
              {selectedPdf?.languageName || "Trisandhya Path"}
            </DialogTitle>
            {selectedPdf?.description && (
              <p className="text-sm text-muted-foreground mt-1">{selectedPdf.description}</p>
            )}
          </DialogHeader>
          <div className="flex-1 overflow-hidden h-full">
            {selectedPdf?.pdfUrl && (
              <PdfViewer 
                url={selectedPdf.pdfUrl} 
                title={selectedPdf.languageName || "Trisandhya Path"}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
