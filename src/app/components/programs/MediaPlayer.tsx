// src/app/components/programs/MediaPlayer.tsx
import React, { useState, useRef, useEffect } from "react";
import { 
  Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, 
  Settings, Download, Share, Heart, Loader, AlertCircle, RefreshCw 
} from "lucide-react";

interface MediaPlayerProps {
  src: string;
  type: 'video' | 'audio';
  title?: string;
  poster?: string;
  autoPlay?: boolean;
  onProgress?: (progress: number) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onError?: (error: string) => void;
  showControls?: boolean;
  showDownload?: boolean;
  showShare?: boolean;
  showFavorite?: boolean;
  isFavorite?: boolean;
  onFavorite?: () => void;
  className?: string;
  variant?: 'default' | 'minimal' | 'theater';
}

interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  playbackRate: number;
  isLoading: boolean;
  error: string | null;
  controlsVisible: boolean;
  showSettings: boolean;
}

const initialState: PlayerState = {
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isMuted: false,
  isFullscreen: false,
  playbackRate: 1,
  isLoading: true,
  error: null,
  controlsVisible: true,
  showSettings: false
};

const MediaPlayer: React.FC<MediaPlayerProps> = (props) => {
  const {
    src,
    type,
    title,
    poster,
    autoPlay = false,
    onProgress,
    onTimeUpdate,
    onEnded,
    onPlay,
    onPause,
    onError,
    showControls = true,
    showDownload = false,
    showShare = false,
    showFavorite = false,
    isFavorite = false,
    onFavorite,
    className = "",
    variant = 'default'
  } = props;

  const [state, setState] = useState<PlayerState>(initialState);
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimer = useRef<number | null>(null);

  const updateState = (updates: Partial<PlayerState>) => {
    setState(prevState => ({ ...prevState, ...updates }));
  };

  const formatTime = (time: number): string => {
    if (isNaN(time)) return "0:00";
    
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const resetControlsTimer = () => {
    if (type === 'video' && variant !== 'minimal') {
      if (controlsTimer.current) {
        clearTimeout(controlsTimer.current);
      }
      updateState({ controlsVisible: true });
      
      controlsTimer.current = window.setTimeout(() => {
        if (state.isPlaying) {
          updateState({ controlsVisible: false });
        }
      }, 3000);
    }
  };

  const handleLoadedMetadata = () => {
    const media = mediaRef.current;
    if (media && !isNaN(media.duration)) {
      updateState({ 
        duration: media.duration, 
        isLoading: false 
      });
    }
  };

  const handleTimeUpdate = () => {
    const media = mediaRef.current;
    if (media) {
      const currentTime = media.currentTime;
      const duration = media.duration;
      
      updateState({ currentTime });
      
      if (duration > 0) {
        const progress = (currentTime / duration) * 100;
        onProgress?.(progress);
        onTimeUpdate?.(currentTime, duration);
      }
    }
  };

  const handlePlay = () => {
    updateState({ isPlaying: true });
    onPlay?.();
    resetControlsTimer();
  };

  const handlePause = () => {
    updateState({ isPlaying: false, controlsVisible: true });
    onPause?.();
  };

  const handleEnded = () => {
    updateState({ isPlaying: false, controlsVisible: true });
    onEnded?.();
  };

  const handleError = () => {
    const media = mediaRef.current;
    let errorMessage = 'Chyba pri načítavaní média';
    
    if (media?.error) {
      switch (media.error.code) {
        case 1:
          errorMessage = 'Načítavanie bolo prerušené';
          break;
        case 2:
          errorMessage = 'Chyba siete';
          break;
        case 3:
          errorMessage = 'Chyba dekódovania';
          break;
        case 4:
          errorMessage = 'Nepodporovaný formát';
          break;
        default:
          errorMessage = media.error.message || errorMessage;
      }
    }
    
    updateState({ error: errorMessage, isLoading: false });
    onError?.(errorMessage);
  };

  const togglePlay = async () => {
    const media = mediaRef.current;
    if (!media) return;

    try {
      if (state.isPlaying) {
        media.pause();
      } else {
        await media.play();
      }
    } catch (error) {
      console.error('Playback error:', error);
      updateState({ error: 'Nie je možné prehrať médium' });
    }
  };

  const seekTo = (time: number) => {
    const media = mediaRef.current;
    if (media && state.duration > 0) {
      media.currentTime = Math.max(0, Math.min(state.duration, time));
    }
  };

  const skipTime = (seconds: number) => {
    seekTo(state.currentTime + seconds);
  };

  const changeVolume = (newVolume: number) => {
    const media = mediaRef.current;
    if (media) {
      const volume = Math.max(0, Math.min(1, newVolume));
      media.volume = volume;
      updateState({ 
        volume, 
        isMuted: volume === 0 
      });
    }
  };

  const toggleMute = () => {
    const media = mediaRef.current;
    if (!media) return;

    if (state.isMuted) {
      media.volume = state.volume;
      updateState({ isMuted: false });
    } else {
      media.volume = 0;
      updateState({ isMuted: true });
    }
  };

  const changePlaybackRate = (rate: number) => {
    const media = mediaRef.current;
    if (media) {
      media.playbackRate = rate;
      updateState({ playbackRate: rate });
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
        updateState({ isFullscreen: true });
      } else {
        await document.exitFullscreen();
        updateState({ isFullscreen: false });
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const handleSeekBarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    const time = (value / 100) * state.duration;
    seekTo(time);
  };

  const retry = () => {
    const media = mediaRef.current;
    if (media) {
      updateState({ error: null, isLoading: true });
      media.load();
    }
  };

  const handleMouseMove = () => {
    if (type === 'video') {
      resetControlsTimer();
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const media = mediaRef.current;
      if (!media || (event.target as HTMLElement)?.tagName === 'INPUT') return;

      switch (event.code) {
        case 'Space':
          event.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          skipTime(-10);
          break;
        case 'ArrowRight':
          event.preventDefault();
          skipTime(10);
          break;
        case 'ArrowUp':
          event.preventDefault();
          changeVolume(state.volume + 0.1);
          break;
        case 'ArrowDown':
          event.preventDefault();
          changeVolume(state.volume - 0.1);
          break;
        case 'KeyM':
          event.preventDefault();
          toggleMute();
          break;
        case 'KeyF':
          if (type === 'video') {
            event.preventDefault();
            toggleFullscreen();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.volume, state.currentTime, state.isPlaying, type]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (controlsTimer.current) {
        clearTimeout(controlsTimer.current);
      }
    };
  }, []);

  // Error state
  if (state.error) {
    return (
      <div className={`bg-gray-900 text-white rounded-xl overflow-hidden ${className}`}>
        <div className="aspect-video flex items-center justify-center p-8">
          <div className="text-center">
            <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
            <h3 className="text-lg font-semibold mb-2">Chyba pri načítavaní</h3>
            <p className="text-gray-300 mb-4">{state.error}</p>
            <button
              onClick={retry}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={16} />
              Skúsiť znovu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Video Player
  if (type === 'video') {
    return (
      <div 
        ref={containerRef}
        className={`relative bg-black rounded-xl overflow-hidden group ${className}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => type === 'video' && updateState({ controlsVisible: false })}
      >
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          src={src}
          poster={poster}
          autoPlay={autoPlay}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
          onError={handleError}
          className="w-full aspect-video cursor-pointer"
          onClick={togglePlay}
        />

        {state.isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader size={48} className="text-white animate-spin" />
          </div>
        )}

        {!state.isPlaying && !state.isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="w-20 h-20 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all backdrop-blur-sm"
            >
              <Play size={32} className="text-white ml-2" />
            </button>
          </div>
        )}

        {showControls && (state.controlsVisible || !state.isPlaying) && (
          <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300`}>
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
              {title && (
                <h3 className="text-white font-semibold text-lg">{title}</h3>
              )}
              
              <div className="flex items-center gap-2">
                {showFavorite && (
                  <button
                    onClick={onFavorite}
                    className={`p-2 rounded-lg transition-colors ${
                      isFavorite ? 'text-red-500 bg-black/30' : 'text-white hover:bg-black/30'
                    }`}
                  >
                    <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
                  </button>
                )}
                
                {showShare && (
                  <button className="p-2 text-white hover:bg-black/30 rounded-lg transition-colors">
                    <Share size={20} />
                  </button>
                )}
                
                {showDownload && (
                  <button className="p-2 text-white hover:bg-black/30 rounded-lg transition-colors">
                    <Download size={20} />
                  </button>
                )}
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="mb-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0}
                  onChange={handleSeekBarChange}
                  className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => skipTime(-10)}
                    className="text-white hover:text-blue-400 transition"
                  >
                    ⏪
                  </button>
                  
                  <button
                    onClick={togglePlay}
                    className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition"
                  >
                    {state.isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                  </button>
                  
                  <button
                    onClick={() => skipTime(10)}
                    className="text-white hover:text-blue-400 transition"
                  >
                    ⏩
                  </button>
                  
                  <span className="text-white text-sm">
                    {formatTime(state.currentTime)} / {formatTime(state.duration)}
                  </span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button onClick={toggleMute} className="text-white hover:text-blue-400 transition">
                      {state.isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={state.isMuted ? 0 : state.volume}
                      onChange={(e) => changeVolume(parseFloat(e.target.value))}
                      className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  <div className="relative">
                    <button
                      onClick={() => updateState({ showSettings: !state.showSettings })}
                      className="text-white hover:text-blue-400 transition"
                    >
                      <Settings size={20} />
                    </button>
                    
                    {state.showSettings && (
                      <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-sm rounded-lg p-3 min-w-32">
                        <div className="text-white text-sm mb-2">Rýchlosť</div>
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                          <button
                            key={rate}
                            onClick={() => changePlaybackRate(rate)}
                            className={`block w-full text-left px-2 py-1 text-sm rounded transition ${
                              state.playbackRate === rate 
                                ? 'bg-blue-600 text-white' 
                                : 'text-gray-300 hover:bg-white/20'
                            }`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={toggleFullscreen}
                    className="text-white hover:text-blue-400 transition"
                  >
                    {state.isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Audio Player
  return (
    <div className={`bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white ${className}`}>
      <audio
        ref={mediaRef as React.RefObject<HTMLAudioElement>}
        src={src}
        autoPlay={autoPlay}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onError={handleError}
      />

      {title && (
        <h3 className="text-xl font-bold mb-4 text-center">{title}</h3>
      )}

      <div className="flex items-center justify-center mb-6">
        <div className="flex items-end gap-1 h-24">
          {Array.from({ length: 32 }).map((_, i) => (
            <div
              key={i}
              className={`w-2 bg-white/30 rounded-full transition-all duration-300 ${
                state.isPlaying ? 'animate-pulse' : ''
              }`}
              style={{
                height: `${Math.random() * 60 + 20}%`,
                animationDelay: `${i * 50}ms`
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <input
          type="range"
          min="0"
          max="100"
          value={state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0}
          onChange={handleSeekBarChange}
          className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-sm mt-2 text-white/80">
          <span>{formatTime(state.currentTime)}</span>
          <span>{formatTime(state.duration)}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-6 mb-6">
        <button
          onClick={() => skipTime(-30)}
          className="p-3 hover:bg-white/20 rounded-full transition"
        >
          ⏪
        </button>
        
        <button
          onClick={() => skipTime(-10)}
          className="p-2 hover:bg-white/20 rounded-full transition"
        >
          ⏮️
        </button>
        
        <button
          onClick={togglePlay}
          disabled={state.isLoading}
          className="w-16 h-16 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition disabled:opacity-50"
        >
          {state.isLoading ? (
            <Loader size={28} className="animate-spin" />
          ) : state.isPlaying ? (
            <Pause size={28} />
          ) : (
            <Play size={28} className="ml-1" />
          )}
        </button>
        
        <button
          onClick={() => skipTime(10)}
          className="p-2 hover:bg-white/20 rounded-full transition"
        >
          ⏭️
        </button>
        
        <button
          onClick={() => skipTime(30)}
          className="p-3 hover:bg-white/20 rounded-full transition"
        >
          ⏩
        </button>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={toggleMute} className="hover:text-white/80 transition">
            {state.isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={state.isMuted ? 0 : state.volume}
            onChange={(e) => changeVolume(parseFloat(e.target.value))}
            className="w-24 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/80">Rýchlosť:</span>
          <select
            value={state.playbackRate}
            onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
            className="bg-white/20 rounded px-2 py-1 text-sm"
          >
            <option value={0.5}>0.5x</option>
            <option value={0.75}>0.75x</option>
            <option value={1}>1x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          {showFavorite && (
            <button
              onClick={onFavorite}
              className={`p-2 rounded-lg transition-colors ${
                isFavorite ? 'text-red-300' : 'hover:bg-white/20'
              }`}
            >
              <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
            </button>
          )}
          
          {showShare && (
            <button className="p-2 hover:bg-white/20 rounded-lg transition">
              <Share size={20} />
            </button>
          )}
          
          {showDownload && (
            <button className="p-2 hover:bg-white/20 rounded-lg transition">
              <Download size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaPlayer;