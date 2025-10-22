import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Sparkles, Heart, Shield, Cloud, MessageCircle, Eye, ExternalLink } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface Experience {
  title: string;
  author: string;
  views: string;
  timeAgo: string;
  category: string;
  excerpt: string;
}

const experiences: Experience[] = [
  {
    title: "The Touch of Madhab: A Spiritual Awakening",
    author: "@KalpanaKal",
    views: "6.2K",
    timeAgo: "5 months ago",
    category: "Life Protection",
    excerpt: "What can I say about Madhab, Krishna—the one who is love itself for me? He resides in every heart and has blessed me with countless divine experiences throughout my spiritual journey."
  },
  {
    title: "Prabhuji's Divine Presence",
    author: "@HarshadaJoshi",
    views: "2.6K",
    timeAgo: "1 month ago",
    category: "Discernible",
    excerpt: "Last week, after completing the evening Trisandhya, I was sitting with my son and eldest sister. Suddenly, I felt an overwhelming divine presence that filled the entire room with peace."
  },
  {
    title: "Madhava Protected From Pahalgam Attack And More",
    author: "@DipaliLokhande",
    views: "6K",
    timeAgo: "5 months ago",
    category: "Life Protection",
    excerpt: "Jai Shri Madhav! When we went on the Kashmir tour, while going to Srinagar, our vehicle stopped on the way. Later we learned that there was an attack in Pahalgam, but Madhav protected us from danger."
  },
  {
    title: "From Dependence to Fearlessness",
    author: "@JyotiShirahatti",
    views: "6.4K",
    timeAgo: "5 months ago",
    category: "Say Something",
    excerpt: "There was a time when I was completely dependent on my husband for every little thing. Stepping out of the house alone seemed impossible. But through Trisandhya practice, I found inner strength."
  },
  {
    title: "The Fire Put Off Automatically - Divine Effect of Madhav Name Chants",
    author: "@ShailajaTripathi",
    views: "5.8K",
    timeAgo: "5 months ago",
    category: "Life Protection",
    excerpt: "This incident just took place yesterday. I was on work-off for three days straight and my husband was cooking. Suddenly, a fire broke out, but as I chanted Madhav's name, it extinguished automatically."
  },
  {
    title: "The Divine Grace Of Bhavishya Malika and Trisandhya",
    author: "@HarshadaJoshi",
    views: "6.5K",
    timeAgo: "5 months ago",
    category: "Dream",
    excerpt: "Gratitude at the lotus feet of Mahaprabhuji Shree Satya Ananta Madhav, Pujya Pandit Kashinath Mishraji. Through regular practice of Trisandhya, I received divine guidance in my dreams."
  },
  {
    title: "Experiencing the Divinity of Pandit Kashinath Mishraji",
    author: "@Dr.Revathi",
    views: "6.4K",
    timeAgo: "3 months ago",
    category: "Discernible",
    excerpt: "Jai Shri Madhav! Divine Experience of Ulhasnagar (Mumbai) Sabha. I silently prayed to Pandit Kashinath Mishraji and received an immediate divine response that filled my heart with joy."
  },
  {
    title: "Participated in Mahanritya with Prabhuji & Radha Ju",
    author: "@MohitSingh",
    views: "5.1K",
    timeAgo: "2 months ago",
    category: "Dream",
    excerpt: "On the morning of 16 August, 2025 Janmashtami, when I woke up, I was feeling extreme joy and delight. In my dream, I had participated in the divine dance (Mahanritya) with Prabhuji and Radha."
  },
  {
    title: "Unforgettable Experience",
    author: "@Dr.Revathi",
    views: "6K",
    timeAgo: "3 months ago",
    category: "Discernible",
    excerpt: "Jai Shri Madhav! After regular practice of Trisandhya, Shreemad Bhagavat Mahapuran reading, I experienced divine visions and received spiritual guidance that transformed my life completely."
  },
  {
    title: "Leela of the Divine: A Journey Through Dreams, Miracles, and Madhav's Grace",
    author: "@Leela2032",
    views: "5.5K",
    timeAgo: "2 months ago",
    category: "Discernible",
    excerpt: "Before Joining the Sudarma Maha Sangha: The Years of Seeking and Subtle Guidance. My childhood was filled with divine encounters and dreams that eventually led me to this sacred path."
  },
  {
    title: "Miraculous Recovery Through Madhav's Blessings",
    author: "@PriyaSharma",
    views: "4.8K",
    timeAgo: "4 months ago",
    category: "Life Protection",
    excerpt: "My mother was diagnosed with a severe illness. Doctors had given up hope. We started doing Trisandhya with complete faith in Madhav, and within weeks, she made a miraculous recovery that shocked all medical professionals."
  },
  {
    title: "Divine Intervention During Accident",
    author: "@RajeshKumar",
    views: "5.2K",
    timeAgo: "3 months ago",
    category: "Life Protection",
    excerpt: "I was driving on the highway when suddenly my car's brakes failed. At that moment, I chanted Madhav's name loudly. Miraculously, the car slowed down on its own and came to a safe stop without any collision."
  },
  {
    title: "Vision of Kalki Avatar in Meditation",
    author: "@AnandBhat",
    views: "7.1K",
    timeAgo: "2 months ago",
    category: "Dream",
    excerpt: "During my morning Trisandhya meditation, I had a powerful vision of Kalki Avatar riding the white horse Devadatta. The vision was so vivid and real that it brought tears of joy to my eyes and strengthened my faith immensely."
  },
  {
    title: "Lost Child Found Through Prayer",
    author: "@MeenakshiPatel",
    views: "4.5K",
    timeAgo: "4 months ago",
    category: "Life Protection",
    excerpt: "My 5-year-old daughter went missing in a crowded market. In panic, I continuously chanted Madhav's name. Within 15 minutes, a kind stranger brought her back safely. Madhav protected my child."
  },
  {
    title: "Guidance in Career Decision",
    author: "@VikramSingh",
    views: "3.9K",
    timeAgo: "5 months ago",
    category: "Discernible",
    excerpt: "I was confused between two job offers. After performing Trisandhya and seeking Madhav's guidance, I received clear signs and intuition about which path to take. Today, I am grateful for making the right choice."
  },
  {
    title: "Healing Through Divine Grace",
    author: "@SunitaRao",
    views: "5.6K",
    timeAgo: "3 months ago",
    category: "Life Protection",
    excerpt: "I was suffering from chronic pain for years. No medical treatment worked. When I started regular Trisandhya practice and surrendered to Madhav, the pain gradually disappeared. Doctors call it a medical mystery, but I know it's divine grace."
  },
  {
    title: "Protection During Natural Disaster",
    author: "@AmitDesai",
    views: "6.8K",
    timeAgo: "2 months ago",
    category: "Life Protection",
    excerpt: "During severe floods in our area, our house was the only one that remained safe while all neighboring houses were damaged. We had been regularly performing Trisandhya, and Madhav protected our family and home."
  },
  {
    title: "Dream Showing Future Path",
    author: "@KavitaNair",
    views: "4.2K",
    timeAgo: "6 months ago",
    category: "Dream",
    excerpt: "In my dream, I saw Pandit Kashinath Mishraji guiding me towards a specific spiritual practice. When I woke up and followed that guidance, my spiritual journey accelerated tremendously."
  },
  {
    title: "Financial Crisis Resolved Miraculously",
    author: "@SanjayGupta",
    views: "5.3K",
    timeAgo: "4 months ago",
    category: "Discernible",
    excerpt: "Our family was facing severe financial difficulties. We maintained our Trisandhya practice with faith. Unexpectedly, solutions appeared from nowhere, and we overcame the crisis through Madhav's grace."
  },
  {
    title: "Child's Illness Cured Instantly",
    author: "@PoojaVerma",
    views: "4.7K",
    timeAgo: "5 months ago",
    category: "Life Protection",
    excerpt: "My son had high fever for days. Medical treatments weren't helping. I prayed to Madhav with tears in my eyes during Trisandhya. That very evening, his fever broke and he was completely healthy by morning."
  },
  {
    title: "Divine Light During Meditation",
    author: "@RameshIyer",
    views: "3.8K",
    timeAgo: "6 months ago",
    category: "Discernible",
    excerpt: "During evening Trisandhya, I experienced a brilliant divine light filling my entire being. This experience of divine consciousness lasted for several minutes and left me in a state of profound peace and bliss."
  },
  {
    title: "Journey to Spiritual Awakening",
    author: "@NehaSaxena",
    views: "4.1K",
    timeAgo: "3 months ago",
    category: "Say Something",
    excerpt: "I was living a materialistic life without any spiritual awareness. Through a series of divine interventions and experiences with Trisandhya, I awakened to my true spiritual nature and found lasting peace."
  },
  {
    title: "Blessed by Madhav's Divine Vision",
    author: "@ManishJain",
    views: "6.3K",
    timeAgo: "1 month ago",
    category: "Dream",
    excerpt: "In my dream, I saw Madhav in his divine form blessing me and my family. The experience was so real and powerful that when I woke up, I could still feel his divine presence around me. This dream transformed my entire spiritual practice."
  }
];

const categories = [
  { name: "All Experiences", value: "all", count: 23, icon: Sparkles },
  { name: "Discernible", value: "discernible", count: 8, icon: Eye },
  { name: "Life Protection", value: "life-protection", count: 7, icon: Shield },
  { name: "Dream", value: "dream", count: 6, icon: Cloud },
  { name: "Say Something", value: "say-something", count: 2, icon: MessageCircle },
];

export default function DivineExperiences() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredExperiences = experiences.filter(exp => {
    const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exp.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exp.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
                           exp.category.toLowerCase().replace(" ", "-") === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch(category.toLowerCase()) {
      case "life protection": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
      case "discernible": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case "dream": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
      case "say something": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const handleReadMore = (experience: Experience) => {
    setSelectedExperience(experience);
    setIsDialogOpen(true);
  };

  const handleVisitWebsite = () => {
    window.open("https://en.bhavishyamalika.com/experiences", "_blank");
    setIsDialogOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-2 shadow-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
        <CardHeader className="border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500 text-white rounded-xl">
              <Heart className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-3xl font-bold">Divine Experiences</CardTitle>
              <CardDescription className="text-base mt-1">
                The blessings granted by Lord to His devotees, which constantly make them feel His grace
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search experiences by title, author, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg border-2 focus:border-orange-500 dark:focus:border-orange-400"
              data-testid="input-search-experiences"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {categories.map((category) => (
          <Card
            key={category.value}
            className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
              selectedCategory === category.value
                ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30"
                : "border-gray-200 dark:border-gray-800"
            }`}
            onClick={() => setSelectedCategory(category.value)}
            data-testid={`category-${category.value}`}
          >
            <CardContent className="pt-6 text-center">
              <category.icon className={`h-8 w-8 mx-auto mb-2 ${
                selectedCategory === category.value ? "text-orange-500" : "text-muted-foreground"
              }`} />
              <p className={`font-semibold text-sm mb-1 ${
                selectedCategory === category.value ? "text-orange-700 dark:text-orange-300" : ""
              }`}>
                {category.name}
              </p>
              <Badge variant="secondary" className="text-xs">
                {category.count}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Results Info */}
      {searchQuery && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          <span>
            Found {filteredExperiences.length} {filteredExperiences.length === 1 ? 'experience' : 'experiences'}
            {selectedCategory !== "all" && ` in ${categories.find(c => c.value === selectedCategory)?.name}`}
          </span>
        </div>
      )}

      {/* Experiences Grid */}
      <div className="grid gap-6">
        {filteredExperiences.length === 0 ? (
          <Card className="border-2 shadow-xl">
            <CardContent className="py-16 text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/20 mb-4">
                  <Heart className="h-10 w-10 text-orange-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3">No experiences found</h3>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Try adjusting your search or select a different category
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredExperiences.map((experience, index) => (
            <Card key={index} className="border-2 shadow-xl hover:shadow-2xl transition-all cursor-pointer group" data-testid={`experience-card-${index}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2 leading-tight group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      {experience.title}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="font-medium text-orange-600 dark:text-orange-400">{experience.author}</span>
                      </span>
                      <Separator orientation="vertical" className="h-4" />
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {experience.views} Views
                      </span>
                      <Separator orientation="vertical" className="h-4" />
                      <span>{experience.timeAgo}</span>
                    </div>
                  </div>
                  <Badge className={`${getCategoryColor(experience.category)} border-0 font-medium`}>
                    {experience.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-base leading-relaxed text-muted-foreground mb-4">
                  {experience.excerpt}
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-orange-600 border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/20"
                  onClick={() => handleReadMore(experience)}
                  data-testid={`button-read-more-${index}`}
                >
                  <ExternalLink className="h-3 w-3 mr-2" />
                  Read Full Experience
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Note */}
      <Card className="border-2 shadow-xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
        <CardContent className="py-6 text-center">
          <Sparkles className="h-8 w-8 mx-auto mb-3 text-amber-600" />
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200 max-w-2xl mx-auto">
            These divine experiences are shared by devotees who have been blessed through regular practice of Trisandhya Sadhana and devotion to Lord Madhav.
            Total: <strong>23 Divine Experiences</strong> from the Bhavishya Malika community.
          </p>
        </CardContent>
      </Card>

      {/* Read More Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedExperience?.title}</DialogTitle>
            <DialogDescription className="text-base pt-2">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="font-medium text-orange-600 dark:text-orange-400">{selectedExperience?.author}</span>
                <Separator orientation="vertical" className="h-4" />
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {selectedExperience?.views} Views
                </span>
                <Separator orientation="vertical" className="h-4" />
                <span>{selectedExperience?.timeAgo}</span>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <Badge className={`${selectedExperience ? getCategoryColor(selectedExperience.category) : ''} border-0 font-medium mb-4`}>
              {selectedExperience?.category}
            </Badge>
            <p className="text-base leading-relaxed text-muted-foreground mb-6">
              {selectedExperience?.excerpt}
            </p>
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 p-4 rounded-lg border-2 border-orange-200 dark:border-orange-800">
              <div className="flex items-start gap-3">
                <ExternalLink className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-orange-900 dark:text-orange-200 mb-1">
                    Read the Complete Experience
                  </p>
                  <p className="text-sm text-orange-800 dark:text-orange-300">
                    To read the full divine experience with all details, please visit the official Bhavishya Malika website.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              data-testid="button-close-dialog"
            >
              Close
            </Button>
            <Button 
              className="bg-orange-500 hover:bg-orange-600"
              onClick={handleVisitWebsite}
              data-testid="button-visit-website"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit Bhavishya Malika Website
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
