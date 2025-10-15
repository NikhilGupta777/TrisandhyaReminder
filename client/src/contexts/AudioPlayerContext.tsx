import { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";
import type { MediaContent } from "@shared/schema";

interface AudioPlayerContextType {
  currentTrack: MediaContent | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: MediaContent[];
  queueIndex: number;
  shuffleEnabled: boolean;
  repeatMode: "off" | "one" | "all";
  playTrack: (track: MediaContent) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seekTo: (time: number) => void;
  setVolumeLevel: (volume: number) => void;
  addToQueue: (track: MediaContent | MediaContent[]) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  playQueue: (tracks: MediaContent[], startIndex?: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setQueue: (tracks: MediaContent[]) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrack, setCurrentTrack] = useState<MediaContent | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [queue, setQueue] = useState<MediaContent[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "one" | "all">("off");
  const [shuffledQueue, setShuffledQueue] = useState<MediaContent[]>([]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (repeatMode === "one") {
        audio.currentTime = 0;
        audio.play();
      } else {
        playNext();
      }
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [repeatMode]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    if ("mediaSession" in navigator && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist || "Unknown Artist",
        artwork: currentTrack.thumbnailUrl 
          ? [{ src: currentTrack.thumbnailUrl, sizes: "512x512", type: "image/jpeg" }]
          : undefined,
      });

      navigator.mediaSession.setActionHandler("play", () => resumeTrack());
      navigator.mediaSession.setActionHandler("pause", () => pauseTrack());
      navigator.mediaSession.setActionHandler("previoustrack", () => playPrevious());
      navigator.mediaSession.setActionHandler("nexttrack", () => playNext());
    }
  }, [currentTrack]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const playTrack = async (track: MediaContent) => {
    if (track.type !== "audio") return;
    
    setCurrentTrack(track);
    if (audioRef.current) {
      audioRef.current.src = track.url;
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Failed to play track:", error);
        setIsPlaying(false);
      }
    }
  };

  const pauseTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resumeTrack = async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Failed to resume track:", error);
      }
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseTrack();
    } else {
      resumeTrack();
    }
  };

  const playNext = () => {
    const activeQueue = shuffleEnabled ? shuffledQueue : queue;
    if (queueIndex < activeQueue.length - 1) {
      const nextIndex = queueIndex + 1;
      setQueueIndex(nextIndex);
      playTrack(activeQueue[nextIndex]);
    } else if (repeatMode === "all" && activeQueue.length > 0) {
      setQueueIndex(0);
      playTrack(activeQueue[0]);
    } else {
      pauseTrack();
    }
  };

  const playPrevious = () => {
    const activeQueue = shuffleEnabled ? shuffledQueue : queue;
    if (currentTime > 3) {
      seekTo(0);
    } else if (queueIndex > 0) {
      const prevIndex = queueIndex - 1;
      setQueueIndex(prevIndex);
      playTrack(activeQueue[prevIndex]);
    } else if (repeatMode === "all" && activeQueue.length > 0) {
      setQueueIndex(activeQueue.length - 1);
      playTrack(activeQueue[activeQueue.length - 1]);
    }
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setVolumeLevel = (newVolume: number) => {
    setVolume(newVolume);
  };

  const addToQueue = (track: MediaContent | MediaContent[]) => {
    const tracks = Array.isArray(track) ? track : [track];
    setQueue(prev => [...prev, ...tracks]);
  };

  const removeFromQueue = (index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
    if (index < queueIndex) {
      setQueueIndex(prev => prev - 1);
    } else if (index === queueIndex) {
      playNext();
    }
  };

  const clearQueue = () => {
    setQueue([]);
    setQueueIndex(-1);
    setShuffledQueue([]);
    pauseTrack();
    setCurrentTrack(null);
  };

  const playQueue = (tracks: MediaContent[], startIndex = 0) => {
    const audioTracks = tracks.filter(t => t.type === "audio");
    setQueue(audioTracks);
    setQueueIndex(startIndex);
    if (shuffleEnabled) {
      const shuffled = shuffleArray(audioTracks);
      setShuffledQueue(shuffled);
      playTrack(shuffled[0]);
    } else {
      playTrack(audioTracks[startIndex]);
    }
  };

  const toggleShuffle = () => {
    if (!shuffleEnabled) {
      const shuffled = shuffleArray(queue);
      setShuffledQueue(shuffled);
      const currentTrackInShuffled = shuffled.findIndex(t => t.id === currentTrack?.id);
      if (currentTrackInShuffled !== -1) {
        setQueueIndex(currentTrackInShuffled);
      }
    }
    setShuffleEnabled(prev => !prev);
  };

  const toggleRepeat = () => {
    setRepeatMode(prev => {
      if (prev === "off") return "all";
      if (prev === "all") return "one";
      return "off";
    });
  };

  const value: AudioPlayerContextType = {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    queue: shuffleEnabled ? shuffledQueue : queue,
    queueIndex,
    shuffleEnabled,
    repeatMode,
    playTrack,
    pauseTrack,
    resumeTrack,
    togglePlayPause,
    playNext,
    playPrevious,
    seekTo,
    setVolumeLevel,
    addToQueue,
    removeFromQueue,
    clearQueue,
    playQueue,
    toggleShuffle,
    toggleRepeat,
    setQueue,
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      <audio 
        ref={audioRef}
        preload="metadata"
        playsInline
        crossOrigin="anonymous"
      />
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudioPlayer must be used within AudioPlayerProvider");
  }
  return context;
}
