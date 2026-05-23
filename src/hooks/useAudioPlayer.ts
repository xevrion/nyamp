import { useCallback, useEffect, useRef, useState } from "react";
import { convertFileSrc, isTauri } from "@tauri-apps/api/core";
import { parseDuration } from "../lib/formatDuration";
import type { Track } from "../types/music";

function trackSrc(track: Track): string {
  return isTauri() ? convertFileSrc(track.id) : track.id;
}

function playAudio(audio: HTMLAudioElement): Promise<void> {
  return audio.play().catch((error: unknown) => {
    if (audio.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
      return new Promise<void>((resolve, reject) => {
        const onCanPlay = () => {
          audio.removeEventListener("canplay", onCanPlay);
          audio.removeEventListener("error", onError);
          void audio.play().then(resolve).catch(reject);
        };
        const onError = () => {
          audio.removeEventListener("canplay", onCanPlay);
          audio.removeEventListener("error", onError);
          reject(error);
        };
        audio.addEventListener("canplay", onCanPlay, { once: true });
        audio.addEventListener("error", onError, { once: true });
      });
    }
    throw error;
  });
}

export function useAudioPlayer(onEnded: () => void) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const seekingRef = useRef(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumePercent] = useState(70);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (!seekingRef.current) {
        setCurrentTime(audio.currentTime);
      }
    };

    const onLoadedMetadata = () => {
      setDuration(
        Number.isFinite(audio.duration) && audio.duration > 0
          ? audio.duration
          : 0,
      );
    };

    const onAudioEnded = () => {
      onEndedRef.current();
    };

    const onError = () => {
      const message = audio.error?.message ?? "Unable to play this file";
      setPlaybackError(message);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onAudioEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onAudioEnded);
      audio.removeEventListener("error", onError);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume / 100;
  }, [volume]);

  const loadTrack = useCallback((track: Track, autoPlay: boolean) => {
    const audio = audioRef.current;
    if (!audio) return;

    seekingRef.current = false;
    setCurrentTime(0);
    setDuration(parseDuration(track.duration));
    setPlaybackError(null);

    audio.src = trackSrc(track);
    audio.load();

    if (autoPlay) {
      void playAudio(audio).catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Playback failed";
        setPlaybackError(message);
        console.error("Playback failed:", track.id, error);
      });
    }
  }, []);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    void playAudio(audio).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : "Playback failed";
      setPlaybackError(message);
      console.error("Playback failed:", error);
    });
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const clamped = Math.max(0, Math.min(time, audio.duration || time));
    audio.currentTime = clamped;
    setCurrentTime(clamped);
  }, []);

  const seekByProgress = useCallback(
    (progress: number) => {
      const audio = audioRef.current;
      const total =
        (audio && Number.isFinite(audio.duration) && audio.duration > 0
          ? audio.duration
          : duration) || 0;
      if (total <= 0) return;
      seek((progress / 100) * total);
    },
    [duration, seek],
  );

  const setVolume = useCallback((value: number) => {
    setVolumePercent(Math.max(0, Math.min(100, value)));
  }, []);

  const beginSeek = useCallback(() => {
    seekingRef.current = true;
  }, []);

  const endSeek = useCallback(() => {
    seekingRef.current = false;
  }, []);

  return {
    audioRef,
    loadTrack,
    play,
    pause,
    currentTime,
    duration,
    volume,
    playbackError,
    seek,
    seekByProgress,
    setVolume,
    beginSeek,
    endSeek,
  };
}
