/**
 * @file CustomVideoPlayer.tsx
 * @description Player de vídeo 100% personalizado, idêntico ao HTML aprovado.
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipForward, SkipBack } from 'lucide-react';

interface CustomVideoPlayerProps {
  src: string;
  poster?: string;
  onEnded?: () => void;
}

const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({ src, poster, onEnded }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  /* ─── Efeitos ──────────────────────────────────────────── */

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onLoadedMetadata = () => setDuration(video.duration);
    const onEndedHandler = () => {
      setPlaying(false);
      onEnded?.();
    };
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('ended', onEndedHandler);
    document.addEventListener('fullscreenchange', onFullscreenChange);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('ended', onEndedHandler);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, [onEnded]);

  /* ─── Handlers ─────────────────────────────────────────── */

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlaying(!playing);
  }, [playing]);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !videoRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = percent * duration;
  }, [duration]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) videoRef.current.volume = val;
    setMuted(val === 0);
  }, []);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  }, [muted]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  const skip = useCallback((seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime += seconds;
  }, []);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  /* ─── Helpers ──────────────────────────────────────────── */

  const formatTime = useCallback((seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  /* ─── Renderização ─────────────────────────────────────── */

  return (
    <div
      ref={containerRef}
      className="relative aspect-video bg-black rounded-xl overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        playsInline
      />

      {/* Overlay de play central */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30" onClick={togglePlay}>
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all hover:scale-110">
            <Play size={36} className="text-white ml-1" />
          </div>
        </div>
      )}

      {/* Controles */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300
          ${showControls || !playing ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Barra de progresso */}
        <div
          ref={progressRef}
          className="w-full h-1 bg-white/30 rounded-full cursor-pointer mb-3 group/progress hover:h-2 transition-all"
          onClick={handleProgressClick}
        >
          <div className="h-full bg-primary-500 rounded-full relative" style={{ width: `${progress}%` }}>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary-500 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Skip back */}
          <button onClick={() => skip(-10)} className="text-white hover:text-primary-400 transition-colors">
            <SkipBack size={18} />
          </button>

          {/* Play/Pause */}
          <button onClick={togglePlay} className="text-white hover:text-primary-400 transition-colors">
            {playing ? <Pause size={22} /> : <Play size={22} />}
          </button>

          {/* Skip forward */}
          <button onClick={() => skip(10)} className="text-white hover:text-primary-400 transition-colors">
            <SkipForward size={18} />
          </button>

          {/* Volume */}
          <div className="flex items-center gap-1 ml-2">
            <button onClick={toggleMute} className="text-white hover:text-primary-400 transition-colors">
              {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={muted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            />
          </div>

          {/* Tempo */}
          <span className="text-white text-xs ml-auto">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          {/* Fullscreen */}
          <button onClick={toggleFullscreen} className="text-white hover:text-primary-400 transition-colors">
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomVideoPlayer;