import { storage } from "./storage";

async function seed() {
  console.log("Seeding database with initial content...");

  // Create sample media content
  const bhajans = [
    {
      title: "Madhav Naam Bhajan",
      type: "bhajan",
      artist: "Traditional",
      url: "https://example.com/bhajan1.mp3",
      duration: "5:30",
      description: "Traditional bhajan praising Lord Madhav"
    },
    {
      title: "Jagannath Ashtakam",
      type: "bhajan",
      artist: "Devotional",
      url: "https://example.com/bhajan2.mp3",
      duration: "8:45",
      description: "Eight verses in praise of Lord Jagannath"
    },
    {
      title: "Om Namo Bhagavate",
      type: "bhajan",
      artist: "Sacred Chants",
      url: "https://example.com/bhajan3.mp3",
      duration: "6:15",
      description: "Sacred chant from Bhagavad Gita"
    }
  ];

  const pravachans = [
    {
      title: "Pratah Sandhya Practice Guide",
      type: "pravachan",
      artist: "Spiritual Teacher",
      url: "https://example.com/pravachan1.mp4",
      duration: "12:45",
      description: "Complete guide to morning Sandhya practice"
    },
    {
      title: "Bhavishya Malika Pravachan",
      type: "pravachan",
      artist: "Scholar",
      url: "https://example.com/pravachan2.mp4",
      duration: "45:20",
      description: "Discourse on Bhavishya Malika prophecies"
    },
    {
      title: "Madhyahna Sandhya Tutorial",
      type: "pravachan",
      artist: "Pandit",
      url: "https://example.com/pravachan3.mp4",
      duration: "15:30",
      description: "Step-by-step afternoon Sandhya ritual"
    }
  ];

  for (const bhajan of bhajans) {
    await storage.createMedia(bhajan);
  }

  for (const pravachan of pravachans) {
    await storage.createMedia(pravachan);
  }

  // Create sample scripture content
  const scriptures = [
    {
      chapterNumber: 1,
      title: "The Questions of the Sages",
      content: "In ancient times, the sages gathered at the sacred forest of Naimisharanya...",
      summary: "Introduction to the Bhagavata Purana and the questions posed by the sages"
    },
    {
      chapterNumber: 2,
      title: "Dharma Personified",
      content: "Dharma, in the form of a bull, approached Bhumi (Earth)...",
      summary: "Dharma and Earth discuss the state of the world and righteousness"
    },
    {
      chapterNumber: 3,
      title: "Krishna's Advent",
      content: "When Lord Krishna descends to Earth, the entire universe rejoices...",
      summary: "The divine appearance of Lord Krishna and its significance"
    }
  ];

  for (const scripture of scriptures) {
    await storage.createScripture(scripture);
  }

  console.log("Database seeded successfully!");
}

seed().catch(console.error);
