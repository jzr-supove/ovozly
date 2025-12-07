/**
 * AudioPlayer Component
 *
 * Feature-rich audio player with waveform visualization using wavesurfer.js.
 * Falls back to HTML5 audio if waveform loading fails.
 * Exposes seekTo method via ref for external control.
 */

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Button, Slider, Tooltip, message } from "antd";
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  SoundOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
} from "@ant-design/icons";
import WaveSurfer from "wavesurfer.js";

import { formatDuration } from "@/utils/helpers";

import "./audioPlayer.scss";

interface AudioPlayerProps {
  /** URL to the audio file */
  audioUrl: string;
  /** Optional callback when playback position changes */
  onTimeUpdate?: (currentTime: number) => void;
  /** Whether the player is in a loading state */
  loading?: boolean;
}

/** Methods exposed via ref */
export interface AudioPlayerRef {
  /** Seek to a specific time in seconds */
  seekTo: (timeInSeconds: number) => void;
  /** Start playback */
  play: () => void;
  /** Pause playback */
  pause: () => void;
  /** Get current playback time */
  getCurrentTime: () => number;
}

const AudioPlayer = forwardRef<AudioPlayerRef, AudioPlayerProps>(
  ({ audioUrl, onTimeUpdate, loading = false }, ref) => {
    const waveformRef = useRef<HTMLDivElement>(null);
    const wavesurferRef = useRef<WaveSurfer | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [isReady, setIsReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [useFallback, setUseFallback] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    /**
     * Seek to a specific time in seconds.
     */
    const seekTo = useCallback(
      (timeInSeconds: number) => {
        if (useFallback && audioRef.current) {
          audioRef.current.currentTime = timeInSeconds;
        } else if (wavesurferRef.current && isReady && duration > 0) {
          wavesurferRef.current.seekTo(timeInSeconds / duration);
        }
      },
      [isReady, duration, useFallback]
    );

    /**
     * Start playback.
     */
    const play = useCallback(() => {
      if (useFallback && audioRef.current) {
        audioRef.current.play();
      } else if (wavesurferRef.current && isReady) {
        wavesurferRef.current.play();
      }
    }, [isReady, useFallback]);

    /**
     * Pause playback.
     */
    const pause = useCallback(() => {
      if (useFallback && audioRef.current) {
        audioRef.current.pause();
      } else if (wavesurferRef.current && isReady) {
        wavesurferRef.current.pause();
      }
    }, [isReady, useFallback]);

    /**
     * Get current playback time.
     */
    const getCurrentTime = useCallback(() => {
      return currentTime;
    }, [currentTime]);

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        seekTo,
        play,
        pause,
        getCurrentTime,
      }),
      [seekTo, play, pause, getCurrentTime]
    );

    /**
     * Initialize WaveSurfer instance.
     */
    useEffect(() => {
      if (!waveformRef.current || !audioUrl) return;

      setIsLoading(true);
      setIsReady(false);
      setUseFallback(false);
      setLoadError(null);

      // Cleanup previous instance
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }

      const wavesurfer = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#c4cad6",
        progressColor: "#1b84ff",
        cursorColor: "#1b84ff",
        cursorWidth: 2,
        barWidth: 3,
        barGap: 2,
        barRadius: 3,
        height: 80,
        normalize: true,
        fillParent: true,
        mediaControls: false,
        autoplay: false,
        interact: true,
      });

      // Set up event handlers before loading
      wavesurfer.on("ready", () => {
        setDuration(wavesurfer.getDuration());
        setIsReady(true);
        setIsLoading(false);
        wavesurfer.setVolume(volume);
      });

      wavesurfer.on("audioprocess", () => {
        const time = wavesurfer.getCurrentTime();
        setCurrentTime(time);
        onTimeUpdate?.(time);
      });

      wavesurfer.on("timeupdate", () => {
        const time = wavesurfer.getCurrentTime();
        setCurrentTime(time);
        onTimeUpdate?.(time);
      });

      wavesurfer.on("seeking", () => {
        const time = wavesurfer.getCurrentTime();
        setCurrentTime(time);
        onTimeUpdate?.(time);
      });

      wavesurfer.on("play", () => setIsPlaying(true));
      wavesurfer.on("pause", () => setIsPlaying(false));
      wavesurfer.on("finish", () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });

      wavesurfer.on("error", (error) => {
        console.error("WaveSurfer error:", error);
        setLoadError(String(error));
        setIsLoading(false);
        setUseFallback(true);
      });

      // Load the audio
      wavesurfer.load(audioUrl);
      wavesurferRef.current = wavesurfer;

      return () => {
        wavesurfer.destroy();
        wavesurferRef.current = null;
      };
    }, [audioUrl]);

    /**
     * Initialize fallback HTML5 audio when needed.
     */
    useEffect(() => {
      if (!useFallback || !audioUrl) return;

      const audio = new Audio();
      audio.crossOrigin = "anonymous";
      audio.src = audioUrl;
      audio.volume = volume;

      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration);
        setIsReady(true);
        setIsLoading(false);
      });

      audio.addEventListener("timeupdate", () => {
        setCurrentTime(audio.currentTime);
        onTimeUpdate?.(audio.currentTime);
      });

      audio.addEventListener("play", () => setIsPlaying(true));
      audio.addEventListener("pause", () => setIsPlaying(false));
      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });

      audio.addEventListener("error", () => {
        message.error("Unable to load audio file");
        setIsLoading(false);
      });

      audioRef.current = audio;

      return () => {
        audio.pause();
        audio.src = "";
        audioRef.current = null;
      };
    }, [useFallback, audioUrl]);

    /**
     * Update volume when changed.
     */
    useEffect(() => {
      if (useFallback && audioRef.current) {
        audioRef.current.volume = volume;
      } else if (wavesurferRef.current && isReady) {
        wavesurferRef.current.setVolume(volume);
      }
    }, [volume, isReady, useFallback]);

    /**
     * Toggle play/pause.
     */
    const togglePlay = useCallback(() => {
      if (useFallback && audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          audioRef.current.play();
        }
      } else if (wavesurferRef.current && isReady) {
        wavesurferRef.current.playPause();
      }
    }, [isReady, useFallback, isPlaying]);

    /**
     * Skip backward 10 seconds.
     */
    const skipBackward = useCallback(() => {
      const newTime = Math.max(0, currentTime - 10);
      seekTo(newTime);
    }, [currentTime, seekTo]);

    /**
     * Skip forward 10 seconds.
     */
    const skipForward = useCallback(() => {
      const newTime = Math.min(duration, currentTime + 10);
      seekTo(newTime);
    }, [currentTime, duration, seekTo]);

    /**
     * Handle volume change.
     */
    const handleVolumeChange = useCallback((value: number) => {
      setVolume(value);
    }, []);

    /**
     * Handle progress slider change.
     */
    const handleProgressChange = useCallback(
      (value: number) => {
        seekTo(value);
      },
      [seekTo]
    );

    /**
     * Handle clicking on the waveform progress bar (fallback mode).
     */
    const handleProgressBarClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!useFallback || !audioRef.current || !duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        const newTime = percentage * duration;
        audioRef.current.currentTime = newTime;
      },
      [useFallback, duration]
    );

    const showLoading = loading || isLoading;

    return (
      <div
        className={`audio-player ${showLoading ? "loading" : ""} ${useFallback ? "fallback-mode" : ""}`}
      >
        {/* Waveform visualization */}
        <div className="waveform-container">
          {!useFallback ? (
            <>
              <div
                ref={waveformRef}
                className={`waveform ${!isReady ? "hidden" : ""}`}
              />
              {showLoading && (
                <div className="waveform-skeleton">
                  <div className="skeleton-bars">
                    {Array.from({ length: 60 }).map((_, i) => (
                      <div
                        key={i}
                        className="skeleton-bar"
                        style={{
                          height: `${20 + Math.random() * 50}px`,
                          animationDelay: `${i * 0.02}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div
              className="fallback-progress-bar"
              onClick={handleProgressBarClick}
            >
              <div
                className="fallback-progress-fill"
                style={{
                  width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%",
                }}
              />
              <div className="fallback-waveform">
                {Array.from({ length: 60 }).map((_, i) => (
                  <div
                    key={i}
                    className="fallback-bar"
                    style={{
                      height: `${25 + Math.sin(i * 0.3) * 20 + Math.random() * 25}px`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Progress slider */}
        <div className="progress-container">
          <span className="time-label">{formatDuration(currentTime)}</span>
          <Slider
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleProgressChange}
            tooltip={{ formatter: (value) => formatDuration(value || 0) }}
            disabled={!isReady}
            className="progress-slider"
          />
          <span className="time-label">{formatDuration(duration)}</span>
        </div>

        {/* Controls */}
        <div className="controls-container">
          <div className="playback-controls">
            <Tooltip title="Back 10s">
              <Button
                type="text"
                icon={<StepBackwardOutlined />}
                onClick={skipBackward}
                disabled={!isReady}
                className="control-btn"
              />
            </Tooltip>

            <Button
              type="primary"
              shape="circle"
              size="large"
              icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={togglePlay}
              disabled={!isReady}
              className="play-btn"
            />

            <Tooltip title="Forward 10s">
              <Button
                type="text"
                icon={<StepForwardOutlined />}
                onClick={skipForward}
                disabled={!isReady}
                className="control-btn"
              />
            </Tooltip>
          </div>

          <div className="volume-controls">
            <SoundOutlined className="volume-icon" />
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={handleVolumeChange}
              tooltip={{ formatter: (value) => `${Math.round((value || 0) * 100)}%` }}
              className="volume-slider"
            />
          </div>
        </div>
      </div>
    );
  }
);

AudioPlayer.displayName = "AudioPlayer";

export default AudioPlayer;
