import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Scroll, BookOpen, Calendar, Star, Info, ExternalLink, Globe, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BhavishyaMalika() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 dark:from-orange-600 dark:via-amber-600 dark:to-yellow-600 p-12 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
        <div className="relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-2">
            <Sparkles className="h-4 w-4" />
            Sacred Prophecies
          </div>
          <h1 className="text-5xl md:text-6xl font-bold font-serif drop-shadow-lg">
            Bhavishya Malika Website
          </h1>
          <p className="text-xl md:text-2xl font-medium text-white/90 max-w-3xl mx-auto">
            Ancient Wisdom for the Modern Age
          </p>
        </div>
      </div>

      {/* Info Alert */}
      <Alert className="border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 shadow-lg">
        <Info className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        <AlertDescription className="text-base ml-2">
          <strong className="text-orange-900 dark:text-orange-300">Sacred Knowledge:</strong> Bhavishya Malika contains ancient prophecies about the future, including the coming of Kalki Avatar and the transformation from Kali Yuga to Satya Yuga beginning in 2032.
        </AlertDescription>
      </Alert>

      {/* Tabs */}
      <Tabs defaultValue="website" className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-auto p-1 bg-muted/50 rounded-xl">
          <TabsTrigger value="website" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white py-3 rounded-lg transition-all" data-testid="tab-website">
            <Globe className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Official Website</span>
            <span className="sm:hidden">Website</span>
          </TabsTrigger>
          <TabsTrigger value="introduction" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white py-3 rounded-lg transition-all" data-testid="tab-introduction">
            <BookOpen className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Introduction</span>
            <span className="sm:hidden">Intro</span>
          </TabsTrigger>
          <TabsTrigger value="prophecies" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white py-3 rounded-lg transition-all" data-testid="tab-prophecies">
            <Scroll className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Prophecies</span>
            <span className="sm:hidden">Prophecies</span>
          </TabsTrigger>
          <TabsTrigger value="kalki" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white py-3 rounded-lg transition-all" data-testid="tab-kalki">
            <Star className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Kalki Avatar</span>
            <span className="sm:hidden">Kalki</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white py-3 rounded-lg transition-all" data-testid="tab-timeline">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Timeline</span>
            <span className="sm:hidden">Timeline</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="website" className="space-y-6 mt-8">
          <Card className="border-2 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-b-2">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-orange-500 text-white rounded-lg">
                  <Globe className="h-6 w-6" />
                </div>
                Bhavishya Malika Official Website
              </CardTitle>
              <CardDescription className="text-base">
                Explore the complete website with all resources, articles, and sacred content from bhavishyamalika.com
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative w-full" style={{ height: "calc(100vh - 360px)", minHeight: "650px" }}>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 z-10">
                    <div className="text-center space-y-6">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-20 w-20 border-4 border-orange-200 dark:border-orange-800 mx-auto"></div>
                        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-orange-500 mx-auto absolute top-0 left-1/2 -translate-x-1/2"></div>
                      </div>
                      <div>
                        <p className="text-xl font-semibold text-orange-900 dark:text-orange-300">Loading Sacred Content</p>
                        <p className="text-muted-foreground mt-2">Please wait while we connect to Bhavishya Malika...</p>
                      </div>
                    </div>
                  </div>
                )}
                <iframe
                  src="https://www.bhavishyamalika.com/"
                  className="w-full h-full border-0"
                  title="Bhavishya Malika Official Website"
                  onLoad={() => setIsLoading(false)}
                  data-testid="iframe-bhavishyamalika"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              </div>
              <div className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-t-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-muted-foreground">
                    Connected to <span className="font-mono font-semibold text-orange-600 dark:text-orange-400">bhavishyamalika.com</span>
                  </p>
                </div>
                <Button 
                  variant="default" 
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg"
                  onClick={() => window.open("https://www.bhavishyamalika.com/", "_blank")}
                  data-testid="button-open-external"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="introduction" className="space-y-6 mt-8">
          <Card className="border-2 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-orange-500 text-white rounded-lg">
                  <BookOpen className="h-6 w-6" />
                </div>
                About Bhavishya Malika
              </CardTitle>
              <CardDescription className="text-base">
                Understanding the sacred prophetic texts and their significance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Bhavishya Malika is a collection of prophetic texts in Sanskrit that describe future events and the coming transformations in the world. These texts have been preserved and passed down through generations of spiritual masters and scholars.
                </p>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  The texts speak of the transition from Kali Yuga to Satya Yuga, the appearance of divine incarnations, and the establishment of dharma (righteousness) on Earth. Central to these prophecies is the arrival of Kalki Avatar, the tenth incarnation of Lord Vishnu.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 p-6 rounded-xl border-2 border-orange-200 dark:border-orange-800">
                  <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Star className="h-5 w-5 text-orange-500" />
                    Key Themes
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">✦</span>
                      <span>The transformation from Kali Yuga to Satya Yuga starting in 2032</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">✦</span>
                      <span>The coming of Kalki Avatar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">✦</span>
                      <span>Restoration of dharma and righteousness</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">✦</span>
                      <span>Purification of the world and humanity</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">✦</span>
                      <span>Signs and portents of the changing age</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 p-6 rounded-xl border-2 border-amber-200 dark:border-amber-800">
                  <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Info className="h-5 w-5 text-amber-600" />
                    Important Note
                  </h4>
                  <p className="text-base leading-relaxed">
                    According to Jagannath culture and Bhavishya Malika scriptures, <strong className="text-amber-700 dark:text-amber-400">Kali Yuga has ended</strong> and <strong className="text-amber-700 dark:text-amber-400">Satya Yuga will begin from 2032</strong>, marking the start of a new golden age of truth and righteousness.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prophecies" className="space-y-6 mt-8">
          <Card className="border-2 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-orange-500 text-white rounded-lg">
                  <Scroll className="h-6 w-6" />
                </div>
                Sacred Prophecies
              </CardTitle>
              <CardDescription className="text-base">
                Ancient predictions about the future and the transformation of ages
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid gap-6">
                {[
                  {
                    title: "The End of Kali Yuga",
                    content: "The texts describe the culmination of Kali Yuga, an age characterized by discord, hypocrisy, and decline in dharma. Signs include moral degradation, natural calamities, and social upheaval.",
                    color: "orange"
                  },
                  {
                    title: "Major Events Predicted",
                    content: "Bhavishya Malika predicts several major events during the transition period:",
                    list: ["Third World War", "64 types of pandemics", "Severe fires and solar storms", "Seven days of darkness", "Economic recession and natural disasters"],
                    color: "amber"
                  },
                  {
                    title: "The Divine Intervention",
                    content: "Prophecies speak of divine intervention to restore balance and righteousness. The appearance of Kalki Avatar marks the beginning of this transformation, ushering in a new golden age.",
                    color: "yellow"
                  },
                  {
                    title: "The New Age - Satya Yuga",
                    content: "The transition to Satya Yuga beginning in 2032 will bring peace, prosperity, and spiritual enlightenment. Humanity will live in harmony with nature and divine principles will govern society.",
                    color: "orange"
                  },
                  {
                    title: "The Role of Devotees",
                    content: "Those who maintain their faith and practice sadhana (especially Trisandhya) during these transformative times will be blessed with spiritual progress and will assist in establishing the new age of truth.",
                    color: "amber"
                  }
                ].map((prophecy, index) => (
                  <div 
                    key={index}
                    className={`border-l-4 ${
                      prophecy.color === 'orange' ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' :
                      prophecy.color === 'amber' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20' :
                      'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
                    } pl-6 pr-6 py-5 rounded-r-xl`}
                  >
                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <span className={`text-${prophecy.color}-500`}>✦</span>
                      {prophecy.title}
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">{prophecy.content}</p>
                    {prophecy.list && (
                      <ul className="mt-3 space-y-2 ml-4">
                        {prophecy.list.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-muted-foreground">
                            <span className={`text-${prophecy.color}-500 mt-1`}>•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kalki" className="space-y-6 mt-8">
          <Card className="border-2 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-orange-500 text-white rounded-lg">
                  <Star className="h-6 w-6" />
                </div>
                Kalki Avatar
              </CardTitle>
              <CardDescription className="text-base">
                The tenth incarnation of Lord Vishnu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <p className="text-lg leading-relaxed text-muted-foreground">
                Kalki Avatar is prophesied to appear at the end of Kali Yuga to destroy evil, restore dharma, and usher in Satya Yuga. The avatar will come riding a white horse named Devadatta, wielding a blazing sword.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 p-6 rounded-xl border-2 border-orange-200 dark:border-orange-800">
                  <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Star className="h-5 w-5 text-orange-500" />
                    Purpose
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">✦</span>
                      <span>Destroy evil and corrupt forces</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">✦</span>
                      <span>Restore righteousness (dharma)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">✦</span>
                      <span>Purify the world</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">✦</span>
                      <span>Establish Satya Yuga</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 p-6 rounded-xl border-2 border-amber-200 dark:border-amber-800">
                  <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-600" />
                    Characteristics
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-1">✦</span>
                      <span>Born in Shambhala village</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-1">✦</span>
                      <span>Rides white horse Devadatta</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-1">✦</span>
                      <span>Wields divine sword</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-1">✦</span>
                      <span>Possesses supreme knowledge</span>
                    </li>
                  </ul>
                </div>
              </div>

              <Alert className="border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30">
                <Star className="h-5 w-5 text-orange-600" />
                <AlertDescription className="text-base ml-2">
                  <strong>Divine Victory:</strong> The appearance of Kalki Avatar signifies the ultimate victory of good over evil and the beginning of a new golden age where truth, compassion, and spiritual wisdom will prevail.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6 mt-8">
          <Card className="border-2 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-orange-500 text-white rounded-lg">
                  <Calendar className="h-6 w-6" />
                </div>
                Prophetic Timeline
              </CardTitle>
              <CardDescription className="text-base">
                Key events and periods in the prophecies
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-8">
                {[
                  {
                    title: "The Dark Age (Kali Yuga)",
                    description: "Period of spiritual decline, moral degradation, and increasing chaos. According to Bhavishya Malika, this age has now ended.",
                    color: "gray",
                    size: "normal"
                  },
                  {
                    title: "Transition Period (Current Time)",
                    description: "Natural calamities, pandemics, social upheaval, breakdown of traditional values, and widespread confusion mark the transition period between ages.",
                    color: "amber",
                    size: "normal"
                  },
                  {
                    title: "2032 - Beginning of Satya Yuga",
                    description: "According to Jagannath culture and Bhavishya Malika, Satya Yuga (the Golden Age) will begin in 2032, bringing a new era of truth and righteousness.",
                    color: "orange",
                    size: "large",
                    highlight: true
                  },
                  {
                    title: "Appearance of Kalki",
                    description: "The divine avatar appears to restore order, destroy evil forces, and prepare the world for complete transformation.",
                    color: "yellow",
                    size: "normal"
                  },
                  {
                    title: "Satya Yuga (Golden Age Fully Established)",
                    description: "The new age of truth, righteousness, and spiritual enlightenment. Peace, prosperity, and divine knowledge prevail across the world.",
                    color: "green",
                    size: "normal"
                  }
                ].map((event, index) => (
                  <div key={index} className="relative pl-12 pb-2">
                    <div className={`absolute left-0 top-2 w-6 h-6 rounded-full ${
                      event.highlight ? 'bg-orange-500 ring-4 ring-orange-200 dark:ring-orange-800' :
                      event.color === 'gray' ? 'bg-gray-400' :
                      event.color === 'amber' ? 'bg-amber-500' :
                      event.color === 'yellow' ? 'bg-yellow-500' :
                      'bg-green-500'
                    } ${event.highlight ? 'animate-pulse' : ''}`}></div>
                    {index < 4 && (
                      <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-gradient-to-b from-gray-300 to-gray-100 dark:from-gray-700 dark:to-gray-800"></div>
                    )}
                    <div className={`${
                      event.highlight ? 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-2 border-orange-300 dark:border-orange-700 shadow-lg' :
                      'bg-muted/30 border'
                    } p-5 rounded-xl`}>
                      <h4 className={`font-bold mb-2 ${event.size === 'large' ? 'text-xl' : 'text-lg'} ${
                        event.highlight ? 'text-orange-700 dark:text-orange-400' : ''
                      }`}>
                        {event.title}
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* CTA Card */}
      <Card className="border-2 shadow-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 dark:from-orange-600 dark:via-amber-600 dark:to-yellow-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
        <CardContent className="relative z-10 py-12 text-center">
          <Scroll className="h-16 w-16 mx-auto mb-6 drop-shadow-lg" />
          <h3 className="text-3xl font-bold mb-4">Explore Sacred Knowledge</h3>
          <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
            Deepen your understanding through our collection of sacred texts, questions & answers, and spiritual guidance
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              variant="secondary" 
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-100 shadow-xl font-semibold"
              onClick={() => window.location.href = "/scriptures"}
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Sacred Texts
            </Button>
            <Button 
              variant="secondary" 
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-100 shadow-xl font-semibold"
              onClick={() => window.location.href = "/questions"}
            >
              <Info className="h-5 w-5 mr-2" />
              Question / Answers
            </Button>
            <Button 
              variant="secondary" 
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-100 shadow-xl font-semibold"
              onClick={() => window.location.href = "/contact"}
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Contact Us
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground py-6">
        <p className="italic">
          Study these prophecies with devotion and understanding. May they guide you on your spiritual journey.
        </p>
      </div>
    </div>
  );
}
