import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Scroll, BookOpen, Calendar, Info, ExternalLink, Globe, Sparkles, Maximize, Minimize, Menu, X, Shield, Bell as BellIcon, LogOut, Sun, Moon, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarProvider, useSidebar, SidebarTrigger } from "@/components/ui/sidebar";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBell } from "@/components/NotificationBell";

function BhavishyaMalikaContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("website");
  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { open, setOpen } = useSidebar();
  const { theme, setTheme } = useTheme();
  const { isAdmin } = useAuth();

  // Auto-close sidebar every time the page loads (only once)
  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(false));
    return () => cancelAnimationFrame(id);
  }, []); // Empty dependency array so it only runs once on mount

  // Auto-hide menu after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMenuCollapsed(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setIsMenuOpen(false);
      setIsMenuCollapsed(true);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      iframeContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleMenuToggle = () => {
    if (isMenuCollapsed) {
      setIsMenuCollapsed(false);
      setIsMenuOpen(true);
    } else {
      setIsMenuOpen(!isMenuOpen);
    }
  };

  return (
    <div className="fixed inset-0 bg-background">
      {/* Sidebar Toggle Button with Blur - Always visible */}
      <div className="fixed top-4 left-4 z-[100]">
        <div className="backdrop-blur-md bg-background/80 rounded-lg shadow-lg border border-border p-1">
          <SidebarTrigger
            data-testid="button-sidebar-toggle"
            onClick={() => setOpen(!open)}
          />
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
        {/* Fullscreen Website Tab */}
        <TabsContent value="website" className="flex-1 mt-0 m-0 p-0 relative">
          <div className="absolute inset-0" ref={iframeContainerRef}>
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
              className="w-full h-full border-0 notranslate"
              title="Bhavishya Malika Official Website"
              onLoad={() => setIsLoading(false)}
              data-testid="iframe-bhavishyamalika"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
              allow="fullscreen"
              translate="no"
            />
          </div>
        </TabsContent>

        {/* Introduction Tab */}
        <TabsContent value="introduction" className="flex-1 overflow-auto mt-0 p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <Card className="border-2 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-orange-500 text-white rounded-lg">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  About Bhavishya Malika
                </CardTitle>
                <CardDescription className="text-base">
                  The Sacred Prophetic Scripture - Garland of Prophecies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    Bhavishya Malika, meaning <strong>"Garland of Prophecies"</strong>, is an ancient prophetic scripture written approximately 600 years ago (16th century, ~1450-1550 AD) by the <strong>Panchasakha</strong> (Five Friends) – a revered group of saints from Odisha, India. The primary author is <strong>Sant Shri Achyutananda Das</strong>, alongside Saints Ananta Das, Jasovanta Das, Jagannath Das, and Balaram Das.
                  </p>
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    This sacred text comprises approximately <strong>185,000 individual works</strong> originally inscribed on palm leaves in the Odia script. It is considered the <strong>last and final scripture of Sanatan Dharma</strong> for the Kali Yuga era.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 p-6 rounded-xl border-2 border-orange-200 dark:border-orange-800">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-orange-500" />
                    Divine Inspiration
                  </h4>
                  <p className="text-base leading-relaxed">
                    Bhavishya Malika was divinely inspired by <strong>Lord Jagannath</strong> to guide humanity through the end of Kali Yuga, awaken devotees who have reincarnated across all four Yugas, prepare for Lord Kalki's arrival, and provide salvation guidance during the transformational period leading to <strong>Satya Yuga</strong> (the Golden Age), predicted to begin in <strong>2032</strong>.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 p-6 rounded-xl border-2 border-orange-200 dark:border-orange-800">
                    <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Scroll className="h-5 w-5 text-orange-500" />
                      Core Purpose
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">✦</span>
                        <span>Guide humanity through the end of Kali Yuga</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">✦</span>
                        <span>Awaken devotees scattered across all four Yugas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">✦</span>
                        <span>Prepare for Lord Kalki's arrival</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">✦</span>
                        <span>Provide salvation guidance for the transformation</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 p-6 rounded-xl border-2 border-amber-200 dark:border-amber-800">
                    <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Info className="h-5 w-5 text-amber-600" />
                      Key Prophecies
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 mt-1">✦</span>
                        <span>Signs of the end of Kali Yuga (shortened to 5,000 years)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 mt-1">✦</span>
                        <span>Natural disasters, wars, famines, epidemics</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 mt-1">✦</span>
                        <span>Signs from Jagannath Temple in Puri, Odisha</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 mt-1">✦</span>
                        <span>Lord Kalki's birthplace: Jajpur district, Odisha</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <Alert className="border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30">
                  <BookOpen className="h-5 w-5 text-orange-600" />
                  <AlertDescription className="text-base ml-2">
                    <strong>Modern Availability:</strong> Pandit Shri Kashinath Mishra, a renowned scholar of Jagannath culture, has translated and compiled the text after 40+ years of research. The scripture is now available in English, Hindi, Russian, German, Japanese, Gujarati, Kannada, Bengali, Telugu, and Punjabi. Free PDF downloads are available on en.bhavishyamalika.com.
                  </AlertDescription>
                </Alert>

                <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 p-6 rounded-xl border-2 border-orange-200 dark:border-orange-800">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-orange-500" />
                    Spiritual Guidance for the Transition
                  </h4>
                  <div className="space-y-3">
                    <p className="text-base leading-relaxed">The text emphasizes righteous living during these transformative times:</p>
                    <ul className="space-y-3 ml-4">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">✦</span>
                        <span><strong>Righteous Living:</strong> Give up harmful habits (non-vegetarian food, alcohol, intoxicants)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">✦</span>
                        <span><strong>Daily Spiritual Practice:</strong> Trisandhya worship (three times daily), chanting "Madhav"</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">✦</span>
                        <span><strong>Scripture Study:</strong> Reading Shrimad Bhagavat Mahapuran</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">✦</span>
                        <span><strong>Faith and Devotion:</strong> Maintain unwavering faith to navigate coming challenges</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Prophecies Tab */}
        <TabsContent value="prophecies" className="flex-1 overflow-auto mt-0 p-6">
          <div className="max-w-5xl mx-auto space-y-6">
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
                      className={`border-l-4 ${prophecy.color === 'orange' ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' :
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
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="flex-1 overflow-auto mt-0 p-6">
          <div className="max-w-5xl mx-auto space-y-6">
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
                      color: "gray"
                    },
                    {
                      title: "Transition Period (Current Time)",
                      description: "Natural calamities, pandemics, social upheaval, breakdown of traditional values, and widespread confusion mark the transition period between ages.",
                      color: "amber"
                    },
                    {
                      title: "2032 - Beginning of Satya Yuga",
                      description: "According to Jagannath culture and Bhavishya Malika, Satya Yuga (the Golden Age) will begin in 2032, bringing a new era of truth and righteousness.",
                      color: "orange",
                      highlight: true
                    },
                    {
                      title: "Satya Yuga (Golden Age Fully Established)",
                      description: "The new age of truth, righteousness, and spiritual enlightenment. Peace, prosperity, and divine knowledge prevail across the world.",
                      color: "green"
                    }
                  ].map((event, index) => (
                    <div key={index} className="relative pl-12 pb-2">
                      <div className={`absolute left-0 top-2 w-6 h-6 rounded-full ${event.highlight ? 'bg-orange-500 ring-4 ring-orange-200 dark:ring-orange-800' :
                          event.color === 'gray' ? 'bg-gray-400' :
                            event.color === 'amber' ? 'bg-amber-500' :
                              'bg-green-500'
                        } ${event.highlight ? 'animate-pulse' : ''}`}></div>
                      {index < 3 && (
                        <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-gradient-to-b from-gray-300 to-gray-100 dark:from-gray-700 dark:to-gray-800"></div>
                      )}
                      <div className={`${event.highlight ? 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-2 border-orange-300 dark:border-orange-700 shadow-lg' :
                          'bg-muted/30 border'
                        } p-6 rounded-xl`}>
                        <h4 className="font-bold text-lg mb-2">{event.title}</h4>
                        <p className="text-muted-foreground leading-relaxed">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Floating Menu - Modern Design with Auto-hide */}
      <div
        ref={menuRef}
        className={`fixed right-0 top-24 z-50 transition-all duration-500 ease-in-out ${isMenuCollapsed && !isMenuOpen ? 'translate-x-[calc(100%-32px)]' : 'translate-x-0'
          }`}
      >
        {/* Menu Container */}
        <div className="relative">
          {/* Collapsed State - Half Circle Button */}
          {isMenuCollapsed && !isMenuOpen && (
            <button
              onClick={handleMenuToggle}
              className="absolute right-0 top-0 h-16 w-16 rounded-l-full bg-orange-500 hover:bg-orange-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-start pl-3"
              data-testid="button-floating-menu-collapsed"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Expanded Menu Panel */}
          <div
            className={`backdrop-blur-xl bg-gradient-to-br from-background/95 to-background/90 rounded-l-2xl shadow-2xl border-l border-t border-b border-border/50 overflow-hidden transition-all duration-500 ${isMenuCollapsed && !isMenuOpen ? 'opacity-0 w-0' : 'opacity-100 w-72'
              }`}
          >
            <div className="p-4 space-y-3">
              {/* Header with Close Button */}
              <div className="flex items-center justify-between mb-2 pb-3 border-b border-border/50">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Menu className="h-5 w-5 text-orange-500" />
                  Menu
                </h3>
                <Button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setTimeout(() => setIsMenuCollapsed(true), 300);
                  }}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  data-testid="button-close-menu"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Tab Navigation - Compact Grid */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => { setActiveTab("website"); }}
                  variant={activeTab === "website" ? "default" : "outline"}
                  size="sm"
                  className="h-auto py-2 px-3 flex flex-col items-center gap-1"
                  data-testid="button-menu-website"
                >
                  <Globe className="h-4 w-4" />
                  <span className="text-xs">Website</span>
                </Button>

                <Button
                  onClick={() => { setActiveTab("introduction"); }}
                  variant={activeTab === "introduction" ? "default" : "outline"}
                  size="sm"
                  className="h-auto py-2 px-3 flex flex-col items-center gap-1"
                  data-testid="button-menu-introduction"
                >
                  <BookOpen className="h-4 w-4" />
                  <span className="text-xs">Introduction</span>
                </Button>

                <Button
                  onClick={() => { setActiveTab("prophecies"); }}
                  variant={activeTab === "prophecies" ? "default" : "outline"}
                  size="sm"
                  className="h-auto py-2 px-3 flex flex-col items-center gap-1"
                  data-testid="button-menu-prophecies"
                >
                  <Scroll className="h-4 w-4" />
                  <span className="text-xs">Prophecies</span>
                </Button>

                <Button
                  onClick={() => { setActiveTab("timeline"); }}
                  variant={activeTab === "timeline" ? "default" : "outline"}
                  size="sm"
                  className="h-auto py-2 px-3 flex flex-col items-center gap-1"
                  data-testid="button-menu-timeline"
                >
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs">Timeline</span>
                </Button>
              </div>

              {/* Website Controls - Only show on website tab */}
              {activeTab === "website" && (
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <Button
                    onClick={toggleFullscreen}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 h-9"
                    data-testid="button-menu-fullscreen"
                  >
                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                    <span className="text-sm">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
                  </Button>

                  <Button
                    onClick={() => window.open("https://www.bhavishyamalika.com/", "_blank")}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 h-9"
                    data-testid="button-menu-external"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="text-sm">Open in New Tab</span>
                  </Button>
                </div>
              )}

              {/* App Controls */}
              <div className="space-y-2 pt-2 border-t border-border/50">
                {isAdmin && (
                  <Button
                    onClick={() => window.location.href = "/admin"}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 h-9"
                    data-testid="button-menu-admin"
                  >
                    <Shield className="h-4 w-4" />
                    <span className="text-sm">Admin Panel</span>
                  </Button>
                )}

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <NotificationBell />
                  </div>
                </div>

                <Button
                  onClick={toggleTheme}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 h-9"
                  data-testid="button-menu-theme"
                >
                  {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  <span className="text-sm">{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
                </Button>

                <Button
                  onClick={() => window.location.href = "/api/logout"}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 h-9 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                  data-testid="button-menu-logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BhavishyaMalikaContent;

