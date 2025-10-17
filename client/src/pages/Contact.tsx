import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "Thank you for contacting us. We'll get back to you soon!",
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold font-serif text-foreground">Contact Us</h1>
        <p className="text-xl text-muted-foreground">
          We'd love to hear from you. Get in touch with us.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-foreground">
            <MessageSquare className="h-5 w-5 text-primary" />
            Send Us a Message
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
                required
                data-testid="input-contact-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                required
                data-testid="input-contact-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="What is this about?"
                required
                data-testid="input-contact-subject"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Your message..."
                rows={6}
                required
                data-testid="textarea-contact-message"
              />
            </div>

            <Button type="submit" className="w-full" data-testid="button-send-message">
              <Mail className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </form>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-foreground">
              <Mail className="h-5 w-5 text-primary" />
              Email Us
            </h2>
            <p className="text-muted-foreground mb-2">For general inquiries:</p>
            <a 
              href="mailto:support@kalkiavatar.org" 
              className="text-primary hover:underline font-medium"
            >
              support@kalkiavatar.org
            </a>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-foreground">
              <MessageSquare className="h-5 w-5 text-primary" />
              Feedback & Suggestions
            </h2>
            <p className="text-muted-foreground">
              Your feedback helps us improve. If you have suggestions for new features or 
              improvements, please let us know through the contact form or email us directly.
            </p>
          </Card>

          <Card className="p-6 bg-primary/5 dark:bg-primary/10 border-primary/20">
            <h3 className="font-semibold mb-3 text-foreground">Response Time</h3>
            <p className="text-sm text-muted-foreground">
              We typically respond to all inquiries within 24-48 hours. For urgent matters, 
              please mark your subject line as "URGENT".
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
