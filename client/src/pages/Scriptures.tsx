import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Book, BookOpen, Loader2, FileText, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import type { MahapuranTitle } from "@shared/schema";

export default function Scriptures() {
  const { data: scriptures, isLoading } = useQuery<MahapuranTitle[]>({
    queryKey: ["/api/scripture-titles"],
  });

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

      {!scriptures || scriptures.length === 0 ? (
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
          {scriptures.map((scripture) => (
            <Card
              key={scripture.id}
              className="p-6 hover:shadow-xl transition-all duration-300 bg-card dark:bg-card border-border dark:border-border group"
              data-testid={`card-scripture-${scripture.id}`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Book className="h-5 w-5 text-primary flex-shrink-0" />
                      <h3 className="text-xl font-semibold text-foreground dark:text-foreground break-words">
                        {scripture.title}
                      </h3>
                    </div>
                    
                    <Badge variant="secondary" className="mb-3">
                      {scripture.language.toUpperCase()}
                    </Badge>
                    
                    {scripture.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                        {scripture.description}
                      </p>
                    )}
                    
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {scripture.totalSkandas} Books (Skandas)
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border dark:border-border">
                  <Link href={`/scriptures/${scripture.id}`}>
                    <Button
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      variant="default"
                      data-testid={`button-read-scripture-${scripture.id}`}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Begin Reading
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 p-6 bg-muted/50 dark:bg-muted/30 rounded-lg border border-border dark:border-border">
        <h3 className="font-semibold mb-3 text-foreground dark:text-foreground flex items-center gap-2">
          <Book className="h-5 w-5" />
          About Sacred Scriptures
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Each scripture is organized into books (Skandas) containing multiple chapters</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Read online in your preferred language with easy chapter navigation</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Available in multiple languages to help you study in the language most comfortable for you</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Track your progress as you journey through these sacred texts</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
