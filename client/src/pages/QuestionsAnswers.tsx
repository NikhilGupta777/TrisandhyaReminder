import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, HelpCircle, MessageSquare, Sparkles, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const faqCategories = [
  {
    category: "General Questions",
    icon: "📚",
    color: "orange",
    questions: [
      {
        question: "What is Trisandhya Sadhana?",
        answer: "Trisandhya Sadhana is the practice of performing worship and meditation three times a day - during dawn (Pratah), noon (Madhyahna), and evening (Sayam). This ancient practice helps maintain spiritual discipline and connection with the divine throughout the day."
      },
      {
        question: "How do I start my daily Sadhana practice?",
        answer: "Begin by setting up your alarm times in the Alarms section. Start with one Sandhya period that fits your schedule, and gradually add more. Use the Daily Sadhna guide to follow the proper rituals and mantras."
      },
      {
        question: "What is the significance of 108 mantras?",
        answer: "The number 108 is considered sacred in Hindu tradition. It represents spiritual completion and is derived from various cosmic calculations. Chanting mantras 108 times helps achieve focus and devotional connection."
      }
    ]
  },
  {
    category: "Bhavishya Malika",
    icon: "📜",
    color: "amber",
    questions: [
      {
        question: "What is Bhavishya Malika?",
        answer: "Bhavishya Malika is a prophetic text that contains predictions about future events. It is part of the sacred scriptures that guide spiritual seekers about the path ahead and the coming of the Kalki Avatar."
      },
      {
        question: "How can I access Bhavishya Malika content?",
        answer: "You can access Bhavishya Malika content through the dedicated Bhavishya Malika Website section in the navigation menu. There you'll find teachings, predictions, and interpretations of this sacred text."
      },
      {
        question: "When will Satya Yuga begin?",
        answer: "According to Bhavishya Malika and Jagannath culture, Satya Yuga (the Golden Age) will begin in 2032, marking the end of Kali Yuga and the start of a new era of truth and righteousness."
      }
    ]
  },
  {
    category: "Technical Support",
    icon: "⚙️",
    color: "blue",
    questions: [
      {
        question: "How do I set custom alarm sounds?",
        answer: "Go to the Alarms page and upload your own audio files. You can use MP3, WAV, or OGG format files up to 10MB. The alarm system works offline, so your custom sounds are stored locally on your device."
      },
      {
        question: "Why isn't my Japa audio playing?",
        answer: "Make sure you have selected a Japa audio in the settings. If no audio is available, contact the administrator to upload Japa audio files. Also, ensure your browser allows audio playback."
      },
      {
        question: "How do I save my progress?",
        answer: "Your daily Sadhana progress is automatically saved when you check off completed tasks or save your Japa count. You can view your progress history in the Progress section."
      }
    ]
  },
  {
    category: "App Features",
    icon: "✨",
    color: "purple",
    questions: [
      {
        question: "What is the Madhav Naam Jap counter?",
        answer: "The Jap counter helps you keep track of your mantra repetitions. You can set daily goals, save your progress, and listen to chanting audio while counting. Your progress contributes to your overall spiritual journey."
      },
      {
        question: "Can I use the app offline?",
        answer: "Yes! The alarm system and many features work offline. Your alarm sounds are stored locally, and the app continues to function even without an internet connection."
      },
      {
        question: "How do I access Mahapuran content?",
        answer: "Navigate to Mahapuran PDFs in the sidebar. You'll find organized chapters and skandas of the Shreemad Bhagwat Mahapuran. You can read, download, and study the sacred texts."
      }
    ]
  }
];

export default function QuestionsAnswers() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      qa =>
        qa.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        qa.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 dark:from-blue-600 dark:via-purple-600 dark:to-pink-600 p-12 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
        <div className="relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-2">
            <HelpCircle className="h-4 w-4" />
            Help Center
          </div>
          <h1 className="text-5xl md:text-6xl font-bold font-serif drop-shadow-lg">
            Question / Answers
          </h1>
          <p className="text-xl md:text-2xl font-medium text-white/90 max-w-3xl mx-auto">
            Find answers to your questions about Trisandhya Sadhana
          </p>
        </div>
      </div>

      {/* Search Card */}
      <Card className="border-2 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-b-2">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-blue-500 text-white rounded-lg">
              <Search className="h-6 w-6" />
            </div>
            Search Questions
          </CardTitle>
          <CardDescription className="text-base">
            Type keywords to quickly find the answers you need
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for answers... (e.g., 'alarm sounds', 'Satya Yuga', 'offline')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg border-2 focus:border-blue-500 dark:focus:border-blue-400"
              data-testid="input-search-questions"
            />
          </div>
          {searchQuery && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>Found {filteredFAQs.reduce((acc, cat) => acc + cat.questions.length, 0)} results</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {filteredFAQs.length === 0 ? (
        <Card className="border-2 shadow-xl">
          <CardContent className="py-16 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-4">
                <HelpCircle className="h-10 w-10 text-blue-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-3">No results found</h3>
            <p className="text-lg text-muted-foreground mb-6 max-w-md mx-auto">
              We couldn't find any questions matching "{searchQuery}". Try different keywords or browse all categories below.
            </p>
            <Button 
              variant="default"
              size="lg"
              className="bg-blue-500 hover:bg-blue-600"
              onClick={() => setSearchQuery("")}
            >
              Clear Search
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredFAQs.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="border-2 shadow-xl overflow-hidden">
              <CardHeader className={`bg-gradient-to-r ${
                category.color === 'orange' ? 'from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20' :
                category.color === 'amber' ? 'from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20' :
                category.color === 'blue' ? 'from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20' :
                'from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20'
              } border-b-2`}>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <span className="text-3xl">{category.icon}</span>
                  {category.category}
                  <Badge variant="secondary" className="ml-auto text-sm">
                    {category.questions.length} {category.questions.length === 1 ? 'question' : 'questions'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Accordion type="single" collapsible className="w-full space-y-3">
                  {category.questions.map((qa, qaIndex) => (
                    <AccordionItem 
                      key={qaIndex} 
                      value={`item-${categoryIndex}-${qaIndex}`}
                      className={`border-2 rounded-xl px-6 ${
                        category.color === 'orange' ? 'border-orange-200 dark:border-orange-800' :
                        category.color === 'amber' ? 'border-amber-200 dark:border-amber-800' :
                        category.color === 'blue' ? 'border-blue-200 dark:border-blue-800' :
                        'border-purple-200 dark:border-purple-800'
                      }`}
                      data-testid={`accordion-item-${qaIndex}`}
                    >
                      <AccordionTrigger className="text-left hover:no-underline py-5">
                        <div className="flex items-start gap-3">
                          <MessageSquare className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                            category.color === 'orange' ? 'text-orange-500' :
                            category.color === 'amber' ? 'text-amber-600' :
                            category.color === 'blue' ? 'text-blue-500' :
                            'text-purple-500'
                          }`} />
                          <span className="font-semibold text-base">{qa.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className={`pt-2 pb-5 pl-8 text-base leading-relaxed ${
                        category.color === 'orange' ? 'text-orange-900/70 dark:text-orange-100/70' :
                        category.color === 'amber' ? 'text-amber-900/70 dark:text-amber-100/70' :
                        category.color === 'blue' ? 'text-blue-900/70 dark:text-blue-100/70' :
                        'text-purple-900/70 dark:text-purple-100/70'
                      }`}>
                        {qa.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* CTA Card */}
      <Card className="border-2 shadow-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 dark:from-blue-600 dark:via-purple-600 dark:to-pink-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
        <CardContent className="relative z-10 py-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-6">
            <HelpCircle className="h-10 w-10" />
          </div>
          <h3 className="text-3xl font-bold mb-4">Still have questions?</h3>
          <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
            Can't find the answer you're looking for? Our support team is here to help you with your spiritual journey.
          </p>
          <Button 
            variant="secondary" 
            size="lg"
            className="bg-white text-purple-600 hover:bg-gray-100 shadow-xl font-semibold"
            onClick={() => window.location.href = "/contact"}
            data-testid="button-contact-support"
          >
            <Mail className="h-5 w-5 mr-2" />
            Contact Support
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
