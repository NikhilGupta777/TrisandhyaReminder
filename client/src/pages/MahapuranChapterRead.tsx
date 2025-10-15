import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation, useParams } from "wouter";
import { ChevronLeft, ChevronRight, BookOpen, Loader2 } from "lucide-react";
import type { MahapuranTitle, MahapuranSkanda, MahapuranChapter } from "@shared/schema";

export default function MahapuranChapterRead() {
  const params = useParams() as { titleId: string; skandaId: string; chapterId: string };
  const [, setLocation] = useLocation();

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation(`/mahapuran/${params.titleId}/skanda/${params.skandaId}`)}
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
          <h1 className="text-3xl font-bold font-serif">
            Chapter {chapter.chapterNumber}: {chapter.title}
          </h1>
          {chapter.summary && (
            <p className="text-lg text-muted-foreground">{chapter.summary}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <Card className="p-8">
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
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={() => previousChapter && setLocation(`/mahapuran/${params.titleId}/skanda/${params.skandaId}/chapter/${previousChapter.id}`)}
          disabled={!previousChapter}
          data-testid="button-previous-chapter"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          {previousChapter ? `Chapter ${previousChapter.chapterNumber}` : "Previous"}
        </Button>

        <Button
          variant="outline"
          onClick={() => nextChapter && setLocation(`/mahapuran/${params.titleId}/skanda/${params.skandaId}/chapter/${nextChapter.id}`)}
          disabled={!nextChapter}
          data-testid="button-next-chapter"
        >
          {nextChapter ? `Chapter ${nextChapter.chapterNumber}` : "Next"}
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
