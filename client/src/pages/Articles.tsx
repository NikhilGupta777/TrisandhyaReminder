import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Newspaper, BookOpen, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Articles() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-2 shadow-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500 text-white rounded-xl">
              <Newspaper className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold">Articles</CardTitle>
              <CardDescription className="text-base mt-1">
                Sacred knowledge, spiritual guidance, and divine wisdom
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Coming Soon */}
      <Card className="border-2 shadow-xl">
        <CardContent className="py-20 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 mb-6">
              <FileText className="h-12 w-12 text-blue-500" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4">Articles Coming Soon</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            We are preparing a collection of sacred articles about spiritual knowledge, Bhavishya Malika prophecies, 
            and guidance for your spiritual journey. This section will feature in-depth articles, teachings, and wisdom.
          </p>

          <Alert className="max-w-2xl mx-auto border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <AlertDescription className="text-base ml-2">
              <strong>Stay tuned!</strong> New articles about Trisandhya Sadhana, Bhavishya Malika, and spiritual practices will be added regularly.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Placeholder Categories */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            title: "Spiritual Practices",
            icon: BookOpen,
            description: "Learn about various spiritual practices and their significance",
            color: "orange"
          },
          {
            title: "Sacred Prophecies",
            icon: Newspaper,
            description: "Deep dive into Bhavishya Malika predictions and interpretations",
            color: "purple"
          },
          {
            title: "Divine Wisdom",
            icon: Sparkles,
            description: "Timeless wisdom from sacred scriptures and teachings",
            color: "amber"
          }
        ].map((category, index) => (
          <Card key={index} className="border-2 shadow-lg">
            <CardHeader>
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 ${
                category.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/20' :
                category.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/20' :
                'bg-amber-100 dark:bg-amber-900/20'
              }`}>
                <category.icon className={`h-6 w-6 ${
                  category.color === 'orange' ? 'text-orange-600' :
                  category.color === 'purple' ? 'text-purple-600' :
                  'text-amber-600'
                }`} />
              </div>
              <CardTitle className="text-xl">{category.title}</CardTitle>
              <CardDescription className="text-sm">
                {category.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
