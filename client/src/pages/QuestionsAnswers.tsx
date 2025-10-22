import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, HelpCircle, MessageSquare, Sparkles, Mail, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const faqCategories = [
  {
    category: "Trisandhya Basics",
    icon: "🙏",
    color: "orange",
    questions: [
      {
        question: "What is the importance of chanting Madhav's name during Trisandhya?",
        answer: "Chanting Madhav's name during Trisandhya invokes divine grace and protection. It connects the devotee directly with Lord Madhav's consciousness and brings spiritual transformation. Regular practice purifies the mind and heart, leading to inner peace and divine blessings."
      },
      {
        question: "What is Durga Madhav Stuti?",
        answer: "Durga Madhav Stuti is a sacred hymn that praises both Goddess Durga and Lord Madhav. It is chanted during Trisandhya to invoke their combined divine power for protection, prosperity, and spiritual progress. The stuti acknowledges the divine masculine and feminine energies."
      },
      {
        question: "What is 'Dasavtara Strotra'?",
        answer: "Dasavtara Strotra is a prayer that glorifies the ten incarnations (avatars) of Lord Vishnu. Reciting this during Trisandhya helps devotees remember and honor the divine manifestations that came to restore dharma at different times in history, including the upcoming Kalki Avatar."
      },
      {
        question: "What is the 'Vishnu Shodasha Naam' and why should it be chanted?",
        answer: "Vishnu Shodasha Naam refers to the sixteen sacred names of Lord Vishnu. Chanting these names during Trisandhya invokes different divine qualities and energies. Each name carries specific spiritual vibrations that purify consciousness and grant divine blessings."
      },
      {
        question: "What is the Gayatri Mantra, and what is its significance in Trisandhya?",
        answer: "The Gayatri Mantra is one of the most powerful Vedic mantras that invokes divine light and wisdom. In Trisandhya, it is chanted to illuminate the mind, remove ignorance, and awaken spiritual consciousness. It is considered the essence of all Vedic knowledge."
      },
      {
        question: "Which mantras are chanted with Trisandhya / Trikal Sandhya?",
        answer: "Trisandhya includes several mantras: Gayatri Mantra, Vishnu Shodasha Naam, Dasavtara Strotra, Durga Madhav Stuti, and continuous chanting of Madhav's name. Each mantra serves a specific spiritual purpose and collectively they create a complete spiritual practice."
      }
    ]
  },
  {
    category: "Practice & Timing",
    icon: "⏰",
    color: "amber",
    questions: [
      {
        question: "It was told that Trisandhya can be done in less than 5 minutes, especially during lunch break in the office for working people. Please give a complete step-by-step process to do it in the mentioned duration.",
        answer: "Quick Trisandhya process: 1) Sit quietly and take 3 deep breaths (30 seconds). 2) Chant 'Om Namo Madhavaya' 21 times with focus (2 minutes). 3) Recite Gayatri Mantra 3 times (1 minute). 4) Close eyes and meditate on Madhav for 1 minute. 5) Pray for guidance (30 seconds). Total: approximately 5 minutes. The key is sincere devotion, not duration."
      },
      {
        question: "What to do if we forget any one of Trikal sandhya, like in morning?",
        answer: "If you miss morning Trisandhya, do it as soon as you remember during the day. The important thing is not to feel guilty but to resume practice with devotion. You can also do an extra round during the next Sandhya time as compensation. Lord Madhav appreciates sincere effort more than perfect timing."
      },
      {
        question: "I do Trisandhya regularly, but I'm away at work all day, so I'm unable to do it with my 1.5-year-old baby. Is there a way for my baby to also benefit from it?",
        answer: "Your baby automatically receives spiritual benefits from your Trisandhya practice! The divine energy you generate creates a protective aura around your family. You can also play Madhav naam chanting audio for your baby, or do a quick simplified Trisandhya (just Madhav naam chanting) together when you're with your child in the morning or evening."
      }
    ]
  },
  {
    category: "Spiritual Questions",
    icon: "✨",
    color: "blue",
    questions: [
      {
        question: "My Rajput friend has been following non-vegetarian food habits from birth. Now he wants to change and become a vegetarian. Is it necessary to follow Trisandhya? Is it possible for him to become pure?",
        answer: "Yes, it is absolutely possible for anyone to become pure through sincere practice! Trisandhya greatly helps in spiritual transformation. When someone regularly practices Trisandhya, their consciousness naturally elevates and they develop sattvic (pure) tendencies. The combination of vegetarian diet and Trisandhya accelerates spiritual purification. Start gradually - reduce non-vegetarian food while increasing Trisandhya practice. Divine grace supports all sincere seekers regardless of their past."
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

  const totalQuestions = faqCategories.reduce((acc, cat) => acc + cat.questions.length, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-2 shadow-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardHeader className="border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500 text-white rounded-xl">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-3xl font-bold">Question / Answers</CardTitle>
              <CardDescription className="text-base mt-1">
                Read all answers about Trisandhya based on authentic information from Bhavishya Malika
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {totalQuestions} Questions
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search questions about Trisandhya, mantras, practice..."
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

      {/* Info Card */}
      <Card className="border-2 shadow-xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
        <CardContent className="py-6 text-center">
          <Sparkles className="h-8 w-8 mx-auto mb-3 text-amber-600" />
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200 max-w-2xl mx-auto">
            All answers are based on authentic information from the Bhavishya Malika community and Trisandhya teachings. 
            For more detailed guidance, visit the official Bhavishya Malika website or consult with spiritual teachers.
          </p>
        </CardContent>
      </Card>

      {/* CTA Card */}
      <Card className="border-2 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardContent className="py-6 text-center">
          <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Can't find the answer you're looking for? Contact our support team.
          </p>
          <Button 
            variant="default" 
            size="sm"
            className="bg-blue-500 hover:bg-blue-600"
            onClick={() => window.location.href = "/contact"}
            data-testid="button-contact-support"
          >
            <Mail className="h-4 w-4 mr-2" />
            Contact Support
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
