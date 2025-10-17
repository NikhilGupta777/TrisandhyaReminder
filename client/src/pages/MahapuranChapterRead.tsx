import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation, useParams } from "wouter";
import { ChevronLeft, ChevronRight, BookOpen, Loader2, Maximize2, Minimize2, X } from "lucide-react";
import type { MahapuranTitle, MahapuranSkanda, MahapuranChapter } from "@shared/schema";
import { useState } from "react";

export default function MahapuranChapterRead() {
  const params = useParams() as { titleId: string; skandaId: string; chapterId: string };
  const [, setLocation] = useLocation();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { data: title } = useQuery<MahapuranTitle>({
    queryKey: ["/api/mahapuran-titles", params.titleId],
  });

  const { data: skanda } = useQuery<MahapuranSkanda>({
    queryKey: ["/api/mahapuran-skandas", params.titleId, params.skandaId],
  });

  const { data: chapter, isLoading } = useQuery<MahapuranChapter>({
    queryKey: ["/api/mahapuran-chapters", params.skandaId, params.chapterId],
  });

  const { data: allChapters } = useQuery<MahapuranChapter[]>({
    queryKey: ["/api/mahapuran-chapters", params.skandaId],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Chapter Not Found</h3>
        <Button onClick={() => setLocation(`/mahapuran/${params.titleId}/skanda/${params.skandaId}`)}>
          Back to Chapters
        </Button>
      </div>
    );
  }

  const currentIndex = allChapters?.findIndex(c => c.id === chapter.id) ?? -1;
  const previousChapter = currentIndex > 0 ? allChapters?.[currentIndex - 1] : null;
  const nextChapter = currentIndex >= 0 && allChapters && currentIndex < allChapters.length - 1 
    ? allChapters[currentIndex + 1] 
    : null;

  const baseUrl = window.location.pathname.includes("/scriptures/") ? "/scriptures" : "/mahapuran";

  return (
    <div className={isFullscreen ? "fixed inset-0 z-50 bg-background overflow-auto" : "max-w-4xl mx-auto space-y-6"}>
      {/* Fullscreen Toolbar */}
      {isFullscreen && (
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(false)}
              data-testid="button-exit-fullscreen"
            >
              <X className="h-4 w-4 mr-2" />
              Exit Fullscreen
            </Button>
            <div className="text-sm font-medium">
              {title?.title} › Skanda {skanda?.skandaNumber} › Chapter {chapter.chapterNumber}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => previousChapter && setLocation(`${baseUrl}/${params.titleId}/skanda/${params.skandaId}/chapter/${previousChapter.id}`)}
              disabled={!previousChapter}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => nextChapter && setLocation(`${baseUrl}/${params.titleId}/skanda/${params.skandaId}/chapter/${nextChapter.id}`)}
              disabled={!nextChapter}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <div className={isFullscreen ? "max-w-5xl mx-auto p-6" : ""}>
        {/* Header */}
        {!isFullscreen && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation(`${baseUrl}/${params.titleId}/skanda/${params.skandaId}`)}
              className="mb-4"
              data-testid="button-back-to-chapters"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Chapters
            </Button>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {title?.title} › Skanda {skanda?.skandaNumber}
              </p>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold font-serif">
                    Chapter {chapter.chapterNumber}: {chapter.title}
                  </h1>
                  {chapter.summary && (
                    <p className="text-lg text-muted-foreground mt-2">{chapter.summary}</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullscreen(true)}
                  data-testid="button-enter-fullscreen"
                >
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Fullscreen
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <Card className={isFullscreen ? "p-12 mt-6" : "p-8"}>
          {chapter.content ? (
            <div 
              className="prose prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: chapter.content }}
              data-testid="chapter-content"
            />
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Chapter content will be available soon.
              </p>
            </div>
          )}
        </Card>

        {/* Navigation */}
        {!isFullscreen && (
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => previousChapter && setLocation(`${baseUrl}/${params.titleId}/skanda/${params.skandaId}/chapter/${previousChapter.id}`)}
              disabled={!previousChapter}
              data-testid="button-previous-chapter"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {previousChapter ? `Chapter ${previousChapter.chapterNumber}` : "Previous"}
            </Button>

            <Button
              variant="outline"
              onClick={() => nextChapter && setLocation(`${baseUrl}/${params.titleId}/skanda/${params.skandaId}/chapter/${nextChapter.id}`)}
              disabled={!nextChapter}
              data-testid="button-next-chapter"
            >
              {nextChapter ? `Chapter ${nextChapter.chapterNumber}` : "Next"}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
