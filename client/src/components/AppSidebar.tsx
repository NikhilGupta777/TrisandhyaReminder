import { Home, BookOpen, Music, BarChart3, Settings, Bell, Book, ScrollText, Info, Mail, FileText, HelpCircle, Scroll } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";
import { Separator } from "@/components/ui/separator";

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Daily Sadhna", url: "/guide", icon: BookOpen },
  { title: "Mahapuran PDFs", url: "/mahapuran", icon: Book },
  { title: "Scriptures", url: "/scriptures", icon: ScrollText },
  { title: "Bhavishya Malika Website", url: "/bhavishya-malika", icon: Scroll },
  { title: "Media Library", url: "/media", icon: Music },
  { title: "Progress", url: "/progress", icon: BarChart3 },
  { title: "Alarms", url: "/alarms", icon: Bell },
  { title: "Alarms (New)", url: "/alarms-new", icon: Bell },
  { title: "Settings", url: "/settings", icon: Settings },
];

const middleLinks = [
  { title: "Question / Answers", url: "/questions", icon: HelpCircle },
];

const footerLinks = [
  { title: "About", url: "/about", icon: Info },
  { title: "Contact", url: "/contact", icon: Mail },
  { title: "Terms & Privacy", url: "/legal", icon: FileText },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-serif text-primary px-2 py-3">
            Trisandhya Companion
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url || location.startsWith(item.url + "/")} className="py-3">
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/ /g, "-")}`}>
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <Separator className="mb-2" />
        <SidebarMenu>
          {middleLinks.map((link) => (
            <SidebarMenuItem key={link.title}>
              <SidebarMenuButton asChild isActive={location === link.url} size="sm">
                <Link href={link.url} data-testid={`link-${link.title.toLowerCase().replace(/ /g, "-").replace(/&/g, "and")}`}>
                  <link.icon className="h-4 w-4" />
                  <span className="text-sm">{link.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <Separator className="my-2" />
        <SidebarMenu>
          {footerLinks.map((link) => (
            <SidebarMenuItem key={link.title}>
              <SidebarMenuButton asChild isActive={location === link.url} size="sm">
                <Link href={link.url} data-testid={`link-${link.title.toLowerCase().replace(/ /g, "-").replace(/&/g, "and")}`}>
                  <link.icon className="h-4 w-4" />
                  <span className="text-sm">{link.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <div className="px-2 py-2 text-xs text-muted-foreground text-center">
          <p>© 2024 Trisandhya Sadhana</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
