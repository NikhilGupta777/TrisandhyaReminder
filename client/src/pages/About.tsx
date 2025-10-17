import { Card } from "@/components/ui/card";
import { Book, Heart, Users, Target } from "lucide-react";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold font-serif text-foreground">About Us</h1>
        <p className="text-xl text-muted-foreground">
          Your digital companion for sacred Trikal Sandhya practice
        </p>
      </div>

      <Card className="p-8">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h2 className="flex items-center gap-2 text-foreground">
            <Target className="h-6 w-6 text-primary" />
            Our Mission
          </h2>
          <p className="text-foreground dark:text-foreground">
            Trisandhya Sadhana App is dedicated to helping devotees maintain their spiritual practice 
            through technology. We provide a comprehensive digital platform for practicing the sacred 
            Trikal Sandhya, accessing authentic spiritual content, and tracking your spiritual progress.
          </p>

          <h2 className="flex items-center gap-2 text-foreground mt-8">
            <Heart className="h-6 w-6 text-primary" />
            Our Purpose
          </h2>
          <p className="text-foreground dark:text-foreground">
            In today's fast-paced world, maintaining regular spiritual practice can be challenging. 
            Our app serves as your devoted companion, ensuring you never miss your Sandhya times with 
            timely reminders, providing access to authentic scriptures and mantras, and helping you 
            stay connected with the divine teachings of Bhavishya Malika.
          </p>

          <h2 className="flex items-center gap-2 text-foreground mt-8">
            <Book className="h-6 w-6 text-primary" />
            What We Offer
          </h2>
          <ul className="text-foreground dark:text-foreground">
            <li>
              <strong>Daily Sadhana Guidance:</strong> Step-by-step instructions for your Trikal Sandhya practice
            </li>
            <li>
              <strong>Sacred Scriptures:</strong> Access to Shreemad Bhagwat Mahapuran and other sacred texts 
              in multiple languages
            </li>
            <li>
              <strong>Media Library:</strong> Audio and video content to enhance your spiritual journey
            </li>
            <li>
              <strong>Smart Reminders:</strong> Never miss a Sandhya time with customizable alarms
            </li>
            <li>
              <strong>Progress Tracking:</strong> Monitor your spiritual practice and maintain consistency
            </li>
          </ul>

          <h2 className="flex items-center gap-2 text-foreground mt-8">
            <Users className="h-6 w-6 text-primary" />
            Our Community
          </h2>
          <p className="text-foreground dark:text-foreground">
            We are a community of devoted practitioners guided by the teachings of Mahapurush Achyutananda 
            and the wisdom of Bhavishya Malika. Our content is sourced from authentic spiritual sources, 
            ensuring you receive genuine teachings that align with our sacred traditions.
          </p>

          <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-lg p-6 mt-8">
            <p className="text-center font-serif text-lg italic text-foreground dark:text-foreground mb-0">
              "May Lord Jagannath bless your spiritual journey and guide you on the path to Satya Yuga"
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-muted/50 dark:bg-muted/30">
        <h3 className="font-semibold mb-3 text-foreground">Content Attribution</h3>
        <p className="text-sm text-muted-foreground">
          Spiritual content and teachings are sourced from{" "}
          <a 
            href="https://bhavishyamalika.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Bhavishyamalika.com
          </a>
          , a trusted source for authentic spiritual knowledge and ancient wisdom.
        </p>
      </Card>
    </div>
  );
}
