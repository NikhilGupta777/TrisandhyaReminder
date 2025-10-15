import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Book, ChevronRight, Loader2 } from "lucide-react";
import type { MahapuranTitle } from "@shared/schema";

export default function MahapuranBrowse() {
  const [, setLocation] = useLocation();

  const { data: titles, isLoading } = useQuery<MahapuranTitle[]>({
    queryKey: ["/api/mahapuran-titles"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!titles || titles.length === 0) {
    return (
      <div className="text-center py-12">
        <Book className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Mahapuran Available</h3>
        <p className="text-muted-foreground">
          Mahapuran content will be available soon.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-serif">Mahapuran Library</h1>
        <p className="text-muted-foreground mt-2">
          Explore the sacred wisdom of the Mahapurans
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {titles.map((title) => (
          <Card
            key={title.id}
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => setLocation(`/mahapuran/${title.id}`)}
            data-testid={`card-mahapuran-${title.id}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  {title.title}
                </h3>
                {title.language && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {title.language}
                  </p>
                )}
                {title.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {title.description}
                  </p>
                )}
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
