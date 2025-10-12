// src/app/rosary/components/LectioDivinaPlayer.tsx
// Hlavný Lectio Divina interface s 5 krokmi

"use client";

import { useLanguage } from '@/app/components/LanguageProvider';
import {
  LECTIO_DIVINA_STEPS,
  getNextStep,
  getPreviousStep,
  getStepInfo
} from '@/app/lib/rosary-utils';
import { LectioDivinaPlayerProps, LectioDivinaStep } from '@/app/types/rosary';
import {
  CheckCircle2,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Timer,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { rosaryTranslations } from '../translations';

export default function LectioDivinaPlayer({
  decade,
  initialStep = 'intro',
  onStepChange,
  onComplete
}: LectioDivinaPlayerProps) {
  
  const [currentStep, setCurrentStep] = useState<LectioDivinaStep>(initialStep);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<LectioDivinaStep>>(new Set());
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [audioVolume, setAudioVolume] = useState(0.7);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentStepInfo = getStepInfo(currentStep);
  const currentStepIndex = LECTIO_DIVINA_STEPS.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / LECTIO_DIVINA_STEPS.length) * 100;
  
  const { lang } = useLanguage();
  const t = rosaryTranslations[lang];

  // Inicializácia audio
  useEffect(() => {
    if (decade.fullData.audio_nahravka) {
      const audio = new Audio(decade.fullData.audio_nahravka);
      audio.volume = audioVolume;
      audio.loop = true;
      setAudioElement(audio);
      
      return () => {
        audio.pause();
        audio.src = '';
      };
    }
  }, [decade.fullData.audio_nahravka, audioVolume]);

  // Inicializácia času pre krok
  useEffect(() => {
    const stepDuration = currentStepInfo.duration * 60; // konverzia na sekundy
    setTimeLeft(stepDuration);
    setTotalTime(stepDuration);
    setIsPlaying(false);
    
    if (onStepChange) {
      onStepChange(currentStep);
    }
  }, [currentStep, currentStepInfo.duration, onStepChange]);

  const handleStepComplete = useCallback(() => {
    setIsPlaying(false);
    setCompletedSteps(prev => new Set(prev).add(currentStep));
    
    const nextStep = getNextStep(currentStep);
    if (nextStep) {
      setTimeout(() => {
        setCurrentStep(nextStep);
      }, 1000);
    } else {
      // Všetky kroky dokončené
      if (onComplete) {
        onComplete();
      }
    }
  }, [currentStep, onComplete]);

  // Timer logic
  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isPlaying) {
      handleStepComplete();
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPlaying, timeLeft, handleStepComplete]);

  // Audio handling
  useEffect(() => {
    if (audioElement) {
      if (isPlaying) {
        audioElement.play();
      } else {
        audioElement.pause();
      }
    }
  }, [isPlaying, audioElement]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNextStep = () => {
    const nextStep = getNextStep(currentStep);
    if (nextStep) {
      setCompletedSteps(prev => new Set(prev).add(currentStep));
      setCurrentStep(nextStep);
    }
  };

  const handlePreviousStep = () => {
    const prevStep = getPreviousStep(currentStep);
    if (prevStep) {
      setCurrentStep(prevStep);
    }
  };

  const handleRestart = () => {
    setCurrentStep('intro');
    setCompletedSteps(new Set());
    setIsPlaying(false);
    if (audioElement) {
      audioElement.currentTime = 0;
    }
  };

  const handleVolumeChange = (volume: number) => {
    setAudioVolume(volume);
    if (audioElement) {
      audioElement.volume = volume;
    }
  };

  const handleMuteToggle = () => {
    setIsAudioMuted(!isAudioMuted);
    if (audioElement) {
      audioElement.muted = !isAudioMuted;
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStepContent = (step: LectioDivinaStep): string => {
    switch (step) {
      case 'intro':
        return decade.fullData.uvod;
      case 'lectio':
        return decade.fullData.lectio_text;
      case 'meditatio':
        return decade.fullData.meditatio_text;
      case 'oratio':
        return decade.fullData.oratio_html;
      case 'contemplatio':
        return decade.fullData.contemplatio_text;
      case 'actio':
        return decade.fullData.actio_text;
      default:
        return '';
    }
  };

  const isLastStep = currentStep === 'actio';
  const isFirstStep = currentStep === 'intro';

  return (
    <div className="p-6">
      
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-800">
            Lectio Divina Progress
          </h2>
          <span className="text-sm text-gray-500">
            {currentStepIndex + 1} / {LECTIO_DIVINA_STEPS.length}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Steps indicator */}
        <div className="flex justify-between">
          {LECTIO_DIVINA_STEPS.map((step) => {
            const stepInfo = getStepInfo(step);
            const isActive = step === currentStep;
            const isCompleted = completedSteps.has(step);
            
            return (
              <div key={step} className="flex flex-col items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-green-500 text-white' 
                      : isActive 
                      ? 'text-white shadow-lg' 
                      : 'bg-gray-200 text-gray-600'
                  }`}
                  style={isActive ? { backgroundColor: stepInfo.color } : {}}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    stepInfo.icon
                  )}
                </div>
                <span className={`text-xs mt-1 ${isActive ? 'font-semibold' : 'text-gray-500'}`}>
                  {stepInfo.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Step Display */}
      <div className="bg-gray-50 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-lg"
              style={{ backgroundColor: currentStepInfo.color }}
            >
              {currentStepInfo.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {currentStepInfo.title}
              </h3>
              <p className="text-gray-600">
                {currentStepInfo.description}
              </p>
            </div>
          </div>
          
          {/* Timer */}
          <div className="text-right">
            <div className="flex items-center space-x-2 text-2xl font-bold text-gray-900">
              <Timer size={24} className="text-gray-500" />
              <span>{formatTime(timeLeft)}</span>
            </div>
            <p className="text-sm text-gray-500">
              z {formatTime(totalTime)}
            </p>
          </div>
        </div>
        
        {/* Step Content */}
        <div className="bg-white rounded-xl p-6 mb-4">
          {currentStep === 'oratio' ? (
            <div 
              className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: getStepContent(currentStep) }}
            />
          ) : (
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {getStepContent(currentStep)}
            </div>
          )}
        </div>
        
        {/* Timer Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-1000"
            style={{ 
              width: `${((totalTime - timeLeft) / totalTime) * 100}%`,
              backgroundColor: currentStepInfo.color 
            }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          
          {/* Step Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePreviousStep}
              disabled={isFirstStep}
              className={`p-2 rounded-lg transition-colors ${
                isFirstStep 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <SkipBack size={20} />
            </button>
            
            <button
              onClick={handleNextStep}
              disabled={isLastStep}
              className={`p-2 rounded-lg transition-colors ${
                isLastStep 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              <SkipForward size={20} />
            </button>
          </div>
          
          {/* Play/Pause */}
          <button
            onClick={handlePlayPause}
            className={`p-4 rounded-full text-white shadow-lg transition-all duration-200 hover:scale-105`}
            style={{ backgroundColor: currentStepInfo.color }}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          
          {/* Audio Controls */}
          <div className="flex items-center space-x-2">
            {audioElement && (
              <>
                <button
                  onClick={handleMuteToggle}
                  className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  {isAudioMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={audioVolume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </>
            )}
            
            <button
              onClick={handleRestart}
              className="p-2 rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {isPlaying ? 'Prebieha rozjímanie...' : 'Pozastavené'}
          </span>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setTimeLeft(totalTime)}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Resetovať čas
            </button>
            
            <button
              onClick={handleStepComplete}
              className="text-green-600 hover:text-green-800 transition-colors"
            >
              {t.completeStep}
            </button>
          </div>
        </div>
      </div>
      
      {/* Completion Message */}
      {completedSteps.size === LECTIO_DIVINA_STEPS.length && (
        <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 text-center border border-green-200">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            🎉 Gratulujeme!
          </h3>
          <p className="text-gray-700 mb-4">
            {t.successMessage}
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleRestart}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {t.refresh}
            </button>
            {onComplete && (
              <button
                onClick={onComplete}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t.nextMystery}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}