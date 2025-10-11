import { Card } from "@/components/ui/card";
import { JapCounter } from "@/components/JapCounter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle } from "lucide-react";
import lotusImage from "@assets/stock_images/lotus_flower_sacred__88abbb01.jpg";

export default function SadhanaGuide() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-serif">Sadhana Guide</h1>
        <p className="text-muted-foreground">Learn and practice the sacred Trisandhya rituals</p>
      </div>

      <Tabs defaultValue="trisandhya" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trisandhya" data-testid="tab-trisandhya">What is Trisandhya?</TabsTrigger>
          <TabsTrigger value="mahapuran" data-testid="tab-mahapuran">Mahapuran Path</TabsTrigger>
          <TabsTrigger value="jap" data-testid="tab-jap">Madhav Naam Jap</TabsTrigger>
        </TabsList>

        <TabsContent value="trisandhya" className="space-y-4">
          <Card className="p-6 space-y-4">
            <div className="relative h-48 rounded-md overflow-hidden">
              <img src={lotusImage} alt="Sacred Lotus" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-2xl font-semibold font-serif">The Sacred Trisandhya</h2>
            <div className="space-y-3 text-sm leading-relaxed">
              <p>
                Trisandhya refers to the three sacred junctions of the day when spiritual practice is most auspicious. 
                These are the transitional periods when divine energy flows most powerfully.
              </p>
              <h3 className="font-semibold text-base mt-4">The Three Sandhyas:</h3>
              <ul className="space-y-2 ml-4">
                <li><strong>Pratah Sandhya (Brahma Muhurta):</strong> 3:35 AM - 6:30 AM - The time of divine awakening</li>
                <li><strong>Madhyahna Sandhya (Abhijit Muhurta):</strong> 11:30 AM - 1:00 PM - The period of solar zenith</li>
                <li><strong>Sayam Sandhya (Godhuli Bela):</strong> 5:30 PM - 6:30 PM - The sacred dusk period</li>
              </ul>
              <p className="pt-2 text-muted-foreground italic">
                Source: Bhavishyamalika.com - Ancient wisdom for modern seekers
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="mahapuran" className="space-y-4">
          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-semibold font-serif">Shrimad Bhagwat Mahapuran</h2>
            <p className="text-muted-foreground">Daily scripture reading brings wisdom and spiritual growth</p>
            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <h4 className="font-semibold">Today's Chapter</h4>
                  <p className="text-sm text-muted-foreground">Chapter 1: The Questions of the Sages</p>
                </div>
                <Button variant="outline" data-testid="button-mark-complete">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              </div>
              <Button className="w-full" data-testid="button-read-scripture">Read Scripture</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="jap" className="space-y-4">
          <JapCounter />
          <Card className="p-4 bg-accent/50">
            <p className="text-sm text-center text-muted-foreground">
              Regular chanting purifies the mind and brings you closer to the divine presence
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
