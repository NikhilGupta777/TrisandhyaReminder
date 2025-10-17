import { Card } from "@/components/ui/card";
import { JapCounterConnected } from "@/components/JapCounterConnected";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Clock, Info, Book } from "lucide-react";
import lotusImage from "@assets/stock_images/lotus_flower_sacred__88abbb01.jpg";

export default function SadhanaGuide() {
  return (
    <div className="space-y-4 sm:space-y-6 pb-8">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold font-serif">Daily Sadhna</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Complete Trisandhya Path from Bhavishya Malika</p>
      </div>

      <Tabs defaultValue="trisandhya" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="trisandhya" className="text-xs sm:text-sm" data-testid="tab-trisandhya">Trisandhya Path</TabsTrigger>
          <TabsTrigger value="mahapuran" className="text-xs sm:text-sm" data-testid="tab-mahapuran">Mahapuran</TabsTrigger>
          <TabsTrigger value="jap" className="text-xs sm:text-sm" data-testid="tab-jap">Madhav Jap</TabsTrigger>
        </TabsList>

        <TabsContent value="trisandhya" className="space-y-6">
          <Card className="p-6 sm:p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/20 rounded-lg">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-3">
                <p className="font-semibold text-lg">Sacred Timings (Sandhya Kaal)</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="p-3 bg-background/60 rounded-lg">
                    <p className="font-semibold text-sm">Pratah</p>
                    <p className="text-xs text-muted-foreground mt-1">3:45 AM - 6:30 AM</p>
                    <p className="text-xs text-muted-foreground">(before sunrise)</p>
                  </div>
                  <div className="p-3 bg-background/60 rounded-lg">
                    <p className="font-semibold text-sm">Madhyahna</p>
                    <p className="text-xs text-muted-foreground mt-1">11:30 AM - 1:00 PM</p>
                    <p className="text-xs text-muted-foreground">(noon)</p>
                  </div>
                  <div className="p-3 bg-background/60 rounded-lg">
                    <p className="font-semibold text-sm">Sayam</p>
                    <p className="text-xs text-muted-foreground mt-1">5:00 PM - 6:30 PM</p>
                    <p className="text-xs text-muted-foreground">(before sunset)</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-semibold font-serif">Complete Trisandhya Recitation</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Perform this sacred practice three times daily • Duration: 10-15 minutes
              </p>
            </div>
            
            <Accordion type="single" collapsible className="space-y-4">
                
                {/* Om Chanting */}
                <AccordionItem value="om" className="border rounded-lg px-6 py-2 bg-card">
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                    1. Om Chanting
                  </AccordionTrigger>
                  <AccordionContent className="pt-6 pb-4 space-y-4">
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-lg">
                      <p className="text-center text-2xl font-serif text-primary">ॐ</p>
                      <p className="text-center text-base font-serif mt-2">Om</p>
                      <p className="text-center text-sm text-muted-foreground mt-3">(Chant 3 times with deep breath)</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Gayatri Mantra */}
                <AccordionItem value="gayatri" className="border rounded-lg px-6 py-2 bg-card">
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                    2. Gayatri Mantra
                  </AccordionTrigger>
                  <AccordionContent className="pt-6 pb-4 space-y-4">
                    <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 p-6 rounded-lg space-y-4">
                      <p className="font-serif leading-relaxed text-base">
                        ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं ।<br/>
                        भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात् ॥
                      </p>
                      <p className="font-serif leading-relaxed text-sm text-muted-foreground">
                        Om bhūr bhuvaḥ svaḥ tat savitur vareṇyaṃ ।<br/>
                        bhargo devasya dhīmahi dhiyo yo naḥ pracodayāt ॥
                      </p>
                      <div className="border-t border-amber-500/20 pt-4">
                        <p className="text-sm font-semibold mb-2">Meaning:</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          We meditate on the divine light of that Supreme Creator who permeates the Earth, 
                          Atmosphere, and Heaven. May that divine light inspire our intellect towards the righteous path.
                        </p>
                      </div>
                      <p className="text-center text-xs text-muted-foreground">(Chant 3 times)</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Vishnu Shodasha Naam */}
                <AccordionItem value="shodasha" className="border rounded-lg px-6 py-2 bg-card">
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                    3. Śrī Viṣṇoḥ Ṣoḍaśanāma Stotram
                  </AccordionTrigger>
                  <AccordionContent className="pt-6 pb-4 space-y-5">
                    <p className="text-sm text-muted-foreground">Remember Lord Vishnu in these 16 sacred forms throughout the day:</p>
                    <div className="space-y-3">
                      {[
                        { sanskrit: "Auṣadhe cintayet viṣṇuṃ, bhojane ca janārdanam", meaning: "While taking medicine, remember Vishnu; while eating, remember Janārdana (remover of sufferings)" },
                        { sanskrit: "Śayane padmanābhaṃ ca, vivāhe ca prajāpatim", meaning: "While sleeping, remember Padmanābha (lotus-naveled Lord); at marriage, remember Prajāpati (lord of creation)" },
                        { sanskrit: "Yuddhe cakradharaṃ devaṃ, pravāse ca trivikramam", meaning: "In battle, remember Cakradhara (wielder of discus); during travel, remember Trivikrama" },
                        { sanskrit: "Nārāyaṇaṃ tanutyāge, śrīdharaṃ priyasaṅgame", meaning: "At death, remember Nārāyaṇa; in union with beloved, remember Śrīdhara (Lakṣmī's consort)" },
                        { sanskrit: "Duḥ svapne smara govindaṃ, saṅkaṭe madhusūdanam", meaning: "In nightmares, remember Govinda; in danger, remember Madhusūdana (slayer of demon Madhu)" },
                        { sanskrit: "Kānane nārasiṅhaṃ ca, pāvake jalaśāyinam", meaning: "In forests, remember Narasiṁha (man-lion); amidst fire, remember Jalaśāyī (one in water)" },
                        { sanskrit: "Jalamadhye vārāhaṃ ca, gamane vāmanaṃ caiva", meaning: "In water, remember Varāha (boar); while walking, remember Vāmana (dwarf)" },
                        { sanskrit: "Parvate raghunandanaṃ, sarva kāryeśu mādhavam", meaning: "On mountains, remember Raghunandana (Rāma); in all activities, remember Mādhava" }
                      ].map((verse, idx) => (
                        <div key={idx} className="bg-gradient-to-r from-blue-500/10 to-transparent p-4 rounded-lg border-l-4 border-blue-500/30">
                          <p className="font-serif text-sm sm:text-base leading-relaxed mb-2">{verse.sanskrit} ॥{idx+1}॥</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">{verse.meaning}</p>
                        </div>
                      ))}
                      <div className="bg-gradient-to-br from-primary/15 to-primary/5 p-5 rounded-lg border border-primary/20">
                        <p className="font-serif text-sm sm:text-base leading-relaxed">
                          Ṣoḍaśaitāni nāmāni prātarutthāya yaḥ paṭhet<br/>
                          sarvapāpa vinirmukto viṣṇuloke mahīyate ॥
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
                          <strong>Meaning:</strong> Whoever chants these sixteen names early morning becomes free from all sins and attains the abode of Vishnu.
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Dashavatara Stotram */}
                <AccordionItem value="dashavatara" className="border rounded-lg px-6 py-2 bg-card">
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                    4. Śrī Daśāvatāra Stotram
                  </AccordionTrigger>
                  <AccordionContent className="pt-6 pb-4 space-y-4">
                    <p className="text-sm text-muted-foreground italic">Composed by Shri Jayadeva Ji - Glory to the 10 Divine Incarnations</p>
                    <div className="space-y-3">
                      {[
                        { sanskrit: "Pralaya payodhi-jale dhṛtavān asi vedam । vihita vahitra-caritram akhedam ॥ keśava dhṛta-mīna-śarīra, jaya jagadīśa hare ॥", meaning: "O Keśava! You protected the Vedas in Your fish form during the cosmic deluge. Glory to You!" },
                        { sanskrit: "Kṣitirati-vipulatare tava tiṣṭhati pṛṣṭhe । dharaṇi-dharaṇa-kiṇa cakra-gariṣṭhe ॥ keśava dhṛta-kacchapa-rūpa jaya jagadīśa hare ॥", meaning: "O Keśava! You bore the Earth on Your tortoise back during churning. Glory to You!" },
                        { sanskrit: "Vasati daśana-śikhare dharaṇī tava lagnā । śaśini kalaṅka-kaleva nimagnā ॥ keśava dhṛta-śūkara rūpa jaya jagadīśa hare ॥", meaning: "Earth rested upon Your tusks as a divine boar. Victory to You!" },
                        { sanskrit: "Tava kara-kamala-vare nakham-adbhuta-śṛṅgam । dalita-hiraṇyakaśipu-tanu-bhṛṅgam ॥ keśava dhṛta-narahari-rūpa jaya jagadīśa hare ॥", meaning: "With Your wondrous nails, You tore apart Hiraṇyakaśipu. O Narasiṁha, glory!" },
                        { sanskrit: "Chalayasi vikramaṇe balim-adbhuta-vāmana । pada-nakha-nīra-janita-jana-pāvana ॥ keśava dhṛta-vāmana-rūpa jaya jagadīśa hare ॥", meaning: "As Vāmana, You sanctified the world with water from Your toes. Victory!" },
                        { sanskrit: "Kṣatriya-rudhira-maye jagad-apagata-pāpam । snapayasi payasi śamita-bhava-tāpam ॥ keśava dhṛta-bhṛgupati-rūpa jaya jagadīśa hare ॥", meaning: "As Paraśurāma, You cleansed the earth and relieved its burden. Glory!" },
                        { sanskrit: "Vitarasi dikṣu raṇe dik-pati-kamanīyam । daśa-mukha-mauli-balim ramaṇīyam ॥ keśava dhṛta-raghupati-rūpa jaya jagadīśa hare ॥", meaning: "As Rāma, You offered Rāvaṇa's ten heads to the gods. Victory!" },
                        { sanskrit: "Vahasi vapuṣi viśade vasanam jaladābham । hala-hati-bhīti-milita-yamunābham ॥ keśava dhṛta-haladhara-rūpa jaya jagadīśa hare ॥", meaning: "As Balarāma, You wear garments like monsoon clouds. Victory!" },
                        { sanskrit: "Nindasi yajña-vidher ahaha śruti jātam । sadaya-hṛdaya-darśita-paśu-ghātam ॥ keśava dhṛta-buddha-śarīra jaya jagadīśa hare ॥", meaning: "As Buddha, You showed mercy to all beings. Glory to You!" },
                        { sanskrit: "Mleccha-nivaha-nidhane kalayasi karavālam । dhūmaketum-iva kim-api karālam ॥ keśava dhṛta-kalki-śarīra jaya jagadīśa hare ॥", meaning: "As Kalki, You wield a sword like a comet to destroy darkness. Victory!" }
                      ].map((verse, idx) => (
                        <div key={idx} className="bg-gradient-to-r from-indigo-500/10 to-transparent p-4 rounded-lg border-l-4 border-indigo-500/30">
                          <p className="font-serif text-sm sm:text-base leading-relaxed mb-2">{verse.sanskrit}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">{verse.meaning}</p>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Durga Madhav Stuti */}
                <AccordionItem value="durga" className="border rounded-lg px-6 py-2 bg-card">
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                    5. Durga–Mādhava Stuti
                  </AccordionTrigger>
                  <AccordionContent className="pt-6 pb-4 space-y-4">
                    <p className="text-sm text-muted-foreground">Sacred Odia Prayer to Durga and Madhava</p>
                    <div className="bg-gradient-to-br from-rose-500/10 to-rose-500/5 p-6 rounded-lg space-y-4">
                      <p className="font-serif text-sm sm:text-base leading-relaxed">
                        Jaya he durgā mādhaba kṛpāmaya kṛpāmayī ।<br/>
                        durgāṅku sebī mādhaba hoile mo dīaṅ sāīṅ ॥
                      </p>
                      <div className="border-t border-rose-500/20 pt-3">
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          <strong>Meaning:</strong> Victory to the compassionate Durga and Madhava. He who serves Durga becomes the recipient of Madhava's grace.
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground italic text-center">
                        (Continue with all 7 verses as in the complete Trisandhya)
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Madhava Naam */}
                <AccordionItem value="madhava" className="border rounded-lg px-6 py-2 bg-card">
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                    6. Mādhava-Mādhava Bhajana
                  </AccordionTrigger>
                  <AccordionContent className="pt-6 pb-4">
                    <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 p-8 rounded-lg text-center space-y-3">
                      <p className="font-serif text-xl sm:text-2xl text-primary">Mādhava Mādhava Mādhava ॥</p>
                      <p className="font-serif text-lg sm:text-xl">Śrī Satya Ananta Mādhava ॥</p>
                      <p className="text-sm text-muted-foreground mt-4">
                        (Chant 7 times with devotion)
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Kalki Mahamantra */}
                <AccordionItem value="kalki" className="border rounded-lg px-6 py-2 bg-card">
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                    7. Kalki Mahāmantra
                  </AccordionTrigger>
                  <AccordionContent className="pt-6 pb-4">
                    <div className="bg-gradient-to-br from-primary/15 to-primary/5 p-8 rounded-lg border border-primary/20">
                      <p className="font-serif text-base sm:text-lg leading-relaxed text-center">
                        राम हरे कृष्ण हरे राम हरे कृष्ण हरे,<br/>
                        राम हरे कृष्ण हरे अनन्त माधव हरे ॥
                      </p>
                      <p className="font-serif text-sm sm:text-base leading-relaxed text-center text-muted-foreground mt-3">
                        Rāma Hare Kṛṣṇa Hare Rāma Hare Kṛṣṇa Hare,<br/>
                        Rāma Hare Kṛṣṇa Hare Ananta Mādhava Hare ॥
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground text-center mt-4">
                        The sacred Kalki Mahāmantra of Ananta Yuga (Chant 7 times)
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Jayaghosha */}
                <AccordionItem value="jayaghosha" className="border rounded-lg px-6 py-2 bg-card">
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                    8. Jayaghoṣa - Victory Chant
                  </AccordionTrigger>
                  <AccordionContent className="pt-6 pb-4 space-y-4">
                    <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 p-6 rounded-lg space-y-4">
                      <p className="font-serif text-sm sm:text-base leading-relaxed">
                        त्वमेव माता च पिता त्वमेव,<br/>
                        त्वमेव बन्धुश्च सखा त्वमेव,<br/>
                        त्वमेव विद्या द्रविणं त्वमेव,<br/>
                        त्वमेव सर्वं मम देव देव ॥
                      </p>
                      <p className="font-serif text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        Tvameva mātā ca pitā tvameva,<br/>
                        tvameva bandhuśca sakhā tvameva,<br/>
                        tvameva vidyā draviṇaṁ tvameva,<br/>
                        tvameva sarvaṁ mama deva deva ॥
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        <strong>Meaning:</strong> O Mahāprabhu! You alone are my mother, father, brother, friend, knowledge, wealth, and everything.
                      </p>
                      <p className="text-xs text-muted-foreground text-center">(Chant 3 times)</p>
                    </div>

                    <div className="bg-gradient-to-br from-primary/15 to-primary/5 p-6 rounded-lg border border-primary/20">
                      <p className="font-serif text-sm sm:text-base leading-relaxed text-center">
                        ॐ नमो ब्राह्मण्य देवाय गो-ब्राह्मण-हिताय च,<br/>
                        जगत्-हिताय कृष्णाय गोविन्दाय नमो नमः ॥
                      </p>
                      <p className="font-serif text-xs text-muted-foreground text-center mt-2">
                        Om Namo Brāhmaṇya Devāya Go-brāhmaṇa-hitāya ca,<br/>
                        Jagat-hitāya Kṛṣṇāya Govindāya Namo Namaḥ ॥
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-6 rounded-lg text-center space-y-2">
                      <p className="font-bold text-lg sm:text-xl text-primary">🙏 Jai Shree Madhav! 🙏</p>
                      <p className="text-sm text-muted-foreground">(Stand, raise your hands, and chant 3 times with devotion)</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

              </Accordion>

            <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Info className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-base">Important Note</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    This sacred practice takes only 10-15 minutes. Perform it three times daily at the prescribed 
                    timings to receive divine protection and spiritual benefits as mentioned in Bhavishya Malika. 
                    Regular practice brings peace, prosperity, and spiritual progress.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mahapuran" className="space-y-4">
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold font-serif">Sacred Mahapuran Library</h2>
              <p className="text-muted-foreground">
                Explore the divine wisdom of the Mahapurans - ancient scriptures containing spiritual knowledge and cosmic truths
              </p>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-lg space-y-4">
              <h3 className="font-semibold text-lg">📚 Complete Collection</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Access the complete Mahapuran texts organized by titles, skandas (books), and chapters. Each text is presented
                in an easy-to-read format with summaries and navigation.
              </p>
              <Button 
                className="w-full sm:w-auto" 
                onClick={() => (window.location.href = "/mahapuran")}
                data-testid="button-browse-mahapuran"
              >
                <Book className="h-4 w-4 mr-2" />
                Browse Mahapuran Library
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Daily Reading</h4>
                <p className="text-sm text-muted-foreground">
                  Reading one chapter daily brings wisdom and spiritual growth. Start your journey today!
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Organized Structure</h4>
                <p className="text-sm text-muted-foreground">
                  Navigate through titles → skandas → chapters with ease and track your reading progress.
                </p>
              </div>
            </div>

            <div className="p-4 bg-accent/50 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                💡 Tip: Combine Mahapuran reading with your daily Trisandhya practice for complete spiritual development
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="jap" className="space-y-4">
          <JapCounterConnected />
          <Card className="p-4 bg-accent/50">
            <p className="text-sm text-center text-muted-foreground leading-relaxed">
              Regular chanting of "Mādhava Mādhava" purifies the mind and brings you closer to the divine presence. 
              The continuous repetition is the essence of spiritual practice.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
