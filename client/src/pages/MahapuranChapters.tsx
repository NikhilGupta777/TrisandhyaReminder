import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation, useParams } from "wouter";
import { BookOpen, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import type { MahapuranTitle, MahapuranSkanda, MahapuranChapter } from "@shared/schema";

export default function MahapuranChapters() {
  const params = useParams() as { titleId: string; skandaId: string };
  const [, setLocation] = useLocation();

  const { data: title } = useQuery<MahapuranTitle>({
    queryKey: ["/api/mahapuran-titles", params.titleId],
  });

  const { data: skanda } = useQuery<MahapuranSkanda>({
    queryKey: ["/api/mahapuran-skandas", params.titleId, params.skandaId],
  });

  const { data: chapters, isLoading } = useQuery<MahapuranChapter[]>({
    queryKey: ["/api/mahapuran-chapters", params.skandaId],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation(`/mahapuran/${params.titleId}`)}
          className="mb-4"
          data-testid="button-back-to-skandas"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Skandas
        </Button>
        
        <h1 className="text-3xl font-bold font-serif">
          {title?.title} - Skanda {skanda?.skandaNumber}
        </h1>
        {skanda?.title && (
          <p className="text-xl text-muted-foreground mt-1">{skanda.title}</p>
        )}
        {skanda?.description && (
          <p className="text-muted-foreground mt-2">{skanda.description}</p>
        )}
      </div>

      {!chapters || chapters.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Chapters Available</h3>
          <p className="text-muted-foreground">
            Content is being prepared and will be available soon.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {chapters.map((chapter) => (
            <Card
              key={chapter.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => setLocation(`/mahapuran/${params.titleId}/skanda/${params.skandaId}/chapter/${chapter.id}`)}
              data-testid={`card-chapter-${chapter.id}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    Chapter {chapter.chapterNumber}: {chapter.title}
                  </h3>
                  {chapter.summary && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                      {chapter.summary}
                    </p>
                  )}
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
