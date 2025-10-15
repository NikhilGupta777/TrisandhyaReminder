import { Home, BookOpen, Music, BarChart3, Settings, Bell, Book } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Sadhana Guide", url: "/guide", icon: BookOpen },
  { title: "Mahapuran", url: "/mahapuran", icon: Book },
  { title: "Media Library", url: "/media", icon: Music },
  { title: "Progress", url: "/progress", icon: BarChart3 },
  { title: "Alarms", url: "/alarms", icon: Bell },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-serif text-primary">
            Trisandhya Companion
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url || location.startsWith(item.url + "/")}>
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/ /g, "-")}`}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
