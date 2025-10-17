import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation, useParams } from "wouter";
import { Book, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import type { MahapuranTitle, MahapuranSkanda } from "@shared/schema";

export default function MahapuranSkandas() {
  const params = useParams() as { titleId: string };
  const [location, setLocation] = useLocation();
  
  const isScripturePath = location.startsWith('/scriptures');

  const { data: title } = useQuery<MahapuranTitle>({
    queryKey: ["/api/mahapuran-titles", params.titleId],
  });

  const { data: skandas, isLoading } = useQuery<MahapuranSkanda[]>({
    queryKey: ["/api/mahapuran-skandas", params.titleId],
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
          onClick={() => setLocation(isScripturePath ? "/scriptures" : "/mahapuran")}
          className="mb-4"
          data-testid="button-back-to-titles"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {isScripturePath ? "Back to Scriptures" : "Back to Mahapurans"}
        </Button>
        
        <h1 className="text-3xl font-bold font-serif">{title?.title}</h1>
        {title?.description && (
          <p className="text-muted-foreground mt-2">{title.description}</p>
        )}
      </div>

      {!skandas || skandas.length === 0 ? (
        <div className="text-center py-12">
          <Book className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Skandas Available</h3>
          <p className="text-muted-foreground">
            Content is being prepared and will be available soon.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {skandas.map((skanda) => (
            <Card
              key={skanda.id}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => setLocation(`/mahapuran/${params.titleId}/skanda/${skanda.id}`)}
              data-testid={`card-skanda-${skanda.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    Skanda {skanda.skandaNumber}: {skanda.title}
                  </h3>
                  {skanda.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {skanda.description}
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
