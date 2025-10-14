import { Card } from "@/components/ui/card";
import { JapCounter } from "@/components/JapCounter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Clock, Info } from "lucide-react";
import lotusImage from "@assets/stock_images/lotus_flower_sacred__88abbb01.jpg";

export default function SadhanaGuide() {
  return (
    <div className="space-y-4 sm:space-y-6 pb-8">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold font-serif">Sadhana Guide</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Complete Trisandhya Path from Bhavishya Malika</p>
      </div>

      <Tabs defaultValue="trisandhya" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="trisandhya" className="text-xs sm:text-sm" data-testid="tab-trisandhya">Trisandhya Path</TabsTrigger>
          <TabsTrigger value="mahapuran" className="text-xs sm:text-sm" data-testid="tab-mahapuran">Mahapuran</TabsTrigger>
          <TabsTrigger value="jap" className="text-xs sm:text-sm" data-testid="tab-jap">Madhav Jap</TabsTrigger>
        </TabsList>

        <TabsContent value="trisandhya" className="space-y-4">
          <Card className="p-4 sm:p-6 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-2 text-sm">
                <p className="font-semibold">Sacred Timings (Sandhya Kaal)</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li><strong>Pratah:</strong> 3:45 AM - 6:30 AM (before sunrise)</li>
                  <li><strong>Madhyahna:</strong> 11:30 AM - 1:00 PM (noon)</li>
                  <li><strong>Sayam:</strong> 5:00 PM - 6:30 PM (before sunset)</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-semibold font-serif mb-4">Complete Trisandhya Recitation</h2>
            <p className="text-sm text-muted-foreground mb-6">Perform this sacred practice three times daily. Duration: ~10-15 minutes</p>
            
            <ScrollArea className="h-[600px] pr-4">
              <Accordion type="single" collapsible className="space-y-3">
                
                {/* Om Chanting */}
                <AccordionItem value="om" className="border rounded-lg px-4">
                  <AccordionTrigger className="text-base font-semibold hover:no-underline">
                    1. Om Chanting (3 times)
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-3">
                    <div className="bg-accent/50 p-4 rounded-md">
                      <p className="text-center text-lg font-serif">Om</p>
                      <p className="text-center text-sm text-muted-foreground mt-2">(Chant 3 times)</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Gayatri Mantra */}
                <AccordionItem value="gayatri" className="border rounded-lg px-4">
                  <AccordionTrigger className="text-base font-semibold hover:no-underline">
                    2. Gayatri Mantra (3 times)
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-3">
                    <div className="bg-accent/50 p-4 rounded-md space-y-3">
                      <p className="font-serif leading-relaxed">
                        Om bhūr bhuvaḥ svaḥ tat savitur vareṇyaṃ ।<br/>
                        bhargo devasya dhīmahi dhiyo yo naḥ pracodayāt ॥
                      </p>
                      <div className="border-t pt-3">
                        <p className="text-sm font-semibold mb-2">Meaning:</p>
                        <p className="text-sm text-muted-foreground">
                          We meditate on the divine light of that Supreme Creator who permeates the Earth, 
                          Atmosphere, and Heaven. May that divine light inspire our intellect towards the righteous path.
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Vishnu Shodasha Naam */}
                <AccordionItem value="shodasha" className="border rounded-lg px-4">
                  <AccordionTrigger className="text-base font-semibold hover:no-underline">
                    3. Śrī Viṣṇoḥ Ṣoḍaśanāma Stotram (16 Names)
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-4">
                    <div className="space-y-4">
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
                        <div key={idx} className="bg-accent/50 p-3 rounded-md">
                          <p className="font-serif text-sm leading-relaxed mb-2">{verse.sanskrit} ॥{idx+1}॥</p>
                          <p className="text-xs text-muted-foreground">{verse.meaning}</p>
                        </div>
                      ))}
                      <div className="bg-primary/10 p-3 rounded-md">
                        <p className="font-serif text-sm">Ṣoḍaśaitāni nāmāni prātarutthāya yaḥ paṭhet<br/>
                        sarvapāpa vinirmukto viṣṇuloke mahīyate ॥</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Whoever chants these sixteen names early morning becomes free from all sins and attains the abode of Vishnu.
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Dashavatara Stotram */}
                <AccordionItem value="dashavatara" className="border rounded-lg px-4">
                  <AccordionTrigger className="text-base font-semibold hover:no-underline">
                    4. Śrī Daśāvatāra Stotram (10 Incarnations)
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-3">
                    <p className="text-xs text-muted-foreground italic">Composed by Shri Jayadeva Ji</p>
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
                        <div key={idx} className="bg-accent/50 p-3 rounded-md">
                          <p className="font-serif text-xs sm:text-sm leading-relaxed mb-2">{verse.sanskrit}</p>
                          <p className="text-xs text-muted-foreground">{verse.meaning}</p>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Durga Madhav Stuti */}
                <AccordionItem value="durga" className="border rounded-lg px-4">
                  <AccordionTrigger className="text-base font-semibold hover:no-underline">
                    5. Durga–Madhava Stuti (Odia Prayer)
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-3">
                    <div className="bg-accent/50 p-4 rounded-md space-y-3">
                      <p className="font-serif text-sm leading-relaxed">
                        Jaya he durgā mādhaba kṛpāmaya kṛpāmayī ।<br/>
                        durgāṅku sebī mādhaba hoile mo dīaṅ sāīṅ ॥
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Victory to the compassionate Durga and Madhava. He who serves Durga becomes the recipient of Madhava's grace.
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground italic">
                      (Continue with all 7 verses as in the complete Trisandhya)
                    </p>
                  </AccordionContent>
                </AccordionItem>

                {/* Madhava Naam */}
                <AccordionItem value="madhava" className="border rounded-lg px-4">
                  <AccordionTrigger className="text-base font-semibold hover:no-underline">
                    6. Mādhava-Mādhava Bhajana
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="bg-accent/50 p-4 rounded-md text-center space-y-2">
                      <p className="font-serif text-lg">Mādhava Mādhava Mādhava ॥</p>
                      <p className="font-serif">Śrī Satya Ananta Mādhava ॥</p>
                      <p className="text-xs text-muted-foreground mt-3">
                        (Chant 7 times as prescribed)
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Kalki Mahamantra */}
                <AccordionItem value="kalki" className="border rounded-lg px-4">
                  <AccordionTrigger className="text-base font-semibold hover:no-underline">
                    7. Kalki Mahāmantra (7 times)
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="bg-primary/10 p-4 rounded-md">
                      <p className="font-serif text-sm leading-relaxed text-center">
                        Rāma Hare Kṛṣṇa Hare Rāma Hare Kṛṣṇa Hare,<br/>
                        Rāma Hare Kṛṣṇa Hare Ananta Mādhava Hare ॥
                      </p>
                      <p className="text-xs text-muted-foreground text-center mt-3">
                        The sacred Kalki Mahāmantra of Ananta Yuga (Chant 7 times)
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Jayaghosha */}
                <AccordionItem value="jayaghosha" className="border rounded-lg px-4">
                  <AccordionTrigger className="text-base font-semibold hover:no-underline">
                    8. Jayaghoṣa (Victory Chant)
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-3">
                    <div className="bg-accent/50 p-4 rounded-md space-y-3">
                      <p className="font-serif text-sm leading-relaxed">
                        Tvameva mātā ca pitā tvameva,<br/>
                        tvameva bandhuśca sakhā tvameva,<br/>
                        tvameva vidyā draviṇaṁ tvameva,<br/>
                        tvameva sarvaṁ mama deva deva ॥ (3 times)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        O Mahāprabhu! You alone are my mother, father, brother, friend, knowledge, wealth, and everything.
                      </p>
                    </div>
                    <div className="bg-primary/10 p-3 rounded-md">
                      <p className="font-serif text-xs leading-relaxed">
                        Om Namo Brāhmaṇya Devāya Go-brāhmaṇa-hitāya ca,<br/>
                        Jagat-hitāya Kṛṣṇāya Govindāya Namo Namaḥ ॥
                      </p>
                    </div>
                    <div className="text-center space-y-2 pt-2">
                      <p className="font-semibold text-sm">Jai Shree Madhav! (3 times)</p>
                      <p className="text-xs text-muted-foreground">Stand, raise your hands, and chant with devotion</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

              </Accordion>
            </ScrollArea>

            <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm space-y-1">
                  <p className="font-semibold">Note:</p>
                  <p className="text-muted-foreground">
                    This sacred practice takes only 10-15 minutes. Perform it three times daily at the prescribed 
                    timings to receive divine protection and spiritual benefits as mentioned in Bhavishya Malika.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="mahapuran" className="space-y-4">
          <Card className="p-4 sm:p-6 space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold font-serif">Shrimad Bhagwat Mahapuran</h2>
            <p className="text-sm text-muted-foreground">
              Daily reading of one chapter from Shrimad Bhagwat Mahapuran brings wisdom and spiritual growth
            </p>
            <div className="pt-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-md">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm sm:text-base">Today's Chapter</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">Chapter 1: The Questions of the Sages</p>
                </div>
                <Button variant="outline" size="sm" data-testid="button-mark-complete">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              </div>
              <Button className="w-full" data-testid="button-read-scripture">Read Scripture</Button>
            </div>
            <div className="mt-4 p-3 bg-accent/50 rounded-md">
              <p className="text-xs text-muted-foreground">
                💡 Tip: Read one chapter daily along with your Trisandhya practice for complete spiritual growth
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="jap" className="space-y-4">
          <JapCounter />
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
