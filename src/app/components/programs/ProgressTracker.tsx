// src/app/components/programs/ProgressTracker.tsx
import { useState, useEffect } from "react";
import { 
  Play, Pause, RotateCcw, SkipForward, Clock, TrendingUp,
  Calendar, Target, Award, Flame, CheckCircle, Star,
  BarChart3, PieChart, Activity, Zap
} from "lucide-react";

interface SessionProgress {
  session_id: string;
  session_title: string;
  session_order: number;
  completed: boolean;
  progress_percent: number;
  time_spent_minutes: number;
  last_position_seconds?: number;
  completed_at?: string;
  started_at?: string;
}

interface ProgramProgress {
  program_id: string;
  program_title: string;
  program_category: string;
  total_sessions: number;
  completed_sessions: number;
  total_duration_minutes: number;
  time_spent_minutes: number;
  progress_percent: number;
  last_accessed?: string;
  sessions: SessionProgress[];
}

interface ProgressTrackerProps {
  programProgress?: ProgramProgress;
  currentSession?: SessionProgress;
  variant?: 'detailed' | 'compact' | 'widget' | 'circular';
  showStats?: boolean;
  showStreak?: boolean;
  showMilestones?: boolean;
  onContinueSession?: () => void;
  onResetProgress?: () => void;
  className?: string;
  animated?: boolean;
}

// Streak & Achievements Component
const StreakDisplay = ({ streak = 0, longestStreak = 0 }: { streak: number; longestStreak: number }) => (
  <div className="flex items-center gap-4">
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        streak > 0 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'
      }`}>
        <Flame size={16} />
      </div>
      <div>
        <div className="font-semibold text-gray-900">{streak} dní</div>
        <div className="text-xs text-gray-500">Aktuálna séria</div>
      </div>
    </div>
    
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
        <Award size={16} />
      </div>
      <div>
        <div className="font-semibold text-gray-900">{longestStreak} dní</div>
        <div className="text-xs text-gray-500">Najdlhšia séria</div>
      </div>
    </div>
  </div>
);

// Milestone Component
const MilestoneCard = ({ 
  title, 
  description, 
  progress, 
  target, 
  achieved = false,
  icon: Icon 
}: {
  title: string;
  description: string;
  progress: number;
  target: number;
  achieved?: boolean;
  icon: any;
}) => (
  <div className={`p-4 rounded-xl border-2 transition-all ${
    achieved 
      ? 'border-green-200 bg-green-50' 
      : 'border-gray-200 bg-white hover:border-blue-200'
  }`}>
    <div className="flex items-center gap-3 mb-3">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
        achieved ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
      }`}>
        {achieved ? <CheckCircle size={20} /> : <Icon size={20} />}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
    
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Pokrok</span>
        <span className="font-medium">{progress} / {target}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ${
            achieved ? 'bg-green-500' : 'bg-blue-500'
          }`}
          style={{ width: `${Math.min((progress / target) * 100, 100)}%` }}
        ></div>
      </div>
    </div>
  </div>
);

// Circular Progress Component
const CircularProgress = ({ 
  percentage, 
  size = 120, 
  strokeWidth = 8,
  color = '#3B82F6',
  backgroundColor = '#E5E7EB'
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative">
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{Math.round(percentage)}%</div>
          <div className="text-xs text-gray-500">Dokončené</div>
        </div>
      </div>
    </div>
  );
};

export default function ProgressTracker({
  programProgress,
  currentSession,
  variant = 'detailed',
  showStats = true,
  showStreak = true,
  showMilestones = true,
  onContinueSession,
  onResetProgress,
  className = "",
  animated = true
}: ProgressTrackerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [animated]);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const getStreakData = () => {
    // Mock data - v reálnej aplikácii by sa to načítalo z API
    return { currentStreak: 7, longestStreak: 21 };
  };

  const getMilestones = () => {
    if (!programProgress) return [];
    
    return [
      {
        title: "Prvé kroky",
        description: "Dokončiť prvú lekciu",
        progress: programProgress.completed_sessions,
        target: 1,
        achieved: programProgress.completed_sessions >= 1,
        icon: Play
      },
      {
        title: "Na pol ceste",
        description: "Dokončiť 50% programu",
        progress: programProgress.completed_sessions,
        target: Math.ceil(programProgress.total_sessions / 2),
        achieved: programProgress.completed_sessions >= Math.ceil(programProgress.total_sessions / 2),
        icon: Target
      },
      {
        title: "Majster",
        description: "Dokončiť celý program",
        progress: programProgress.completed_sessions,
        target: programProgress.total_sessions,
        achieved: programProgress.completed_sessions >= programProgress.total_sessions,
        icon: Star
      },
      {
        title: "Časový rekord",
        description: "Stráviť 10+ hodín študovaním",
        progress: Math.floor(programProgress.time_spent_minutes / 60),
        target: 10,
        achieved: programProgress.time_spent_minutes >= 600,
        icon: Clock
      }
    ];
  };

  // Widget variant (small, for sidebars)
  if (variant === 'widget') {
    if (!programProgress) return null;
    
    return (
      <div className={`bg-white rounded-xl p-4 border border-gray-100 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Pokrok</h3>
          <div className="text-sm text-gray-500">
            {programProgress.completed_sessions}/{programProgress.total_sessions}
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${programProgress.progress_percent}%` }}
            ></div>
          </div>
          
          <div className="text-xs text-gray-600">
            {Math.round(programProgress.progress_percent)}% dokončené
          </div>
          
          {onContinueSession && currentSession && (
            <button
              onClick={onContinueSession}
              className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm flex items-center justify-center gap-2"
            >
              <Play size={14} />
              Pokračovať
            </button>
          )}
        </div>
      </div>
    );
  }

  // Circular variant
  if (variant === 'circular') {
    if (!programProgress) return null;
    
    return (
      <div className={`bg-white rounded-xl p-6 border border-gray-100 text-center ${className}`}>
        <CircularProgress 
          percentage={programProgress.progress_percent}
          color="#3B82F6"
        />
        
        <div className="mt-4">
          <h3 className="font-semibold text-gray-900 mb-1">{programProgress.program_title}</h3>
          <p className="text-sm text-gray-600">
            {programProgress.completed_sessions} z {programProgress.total_sessions} lekcií
          </p>
          
          {onContinueSession && currentSession && (
            <button
              onClick={onContinueSession}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 mx-auto"
            >
              <Play size={16} />
              Pokračovať
            </button>
          )}
        </div>
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    if (!programProgress) return null;
    
    return (
      <div className={`bg-white rounded-xl p-4 border border-gray-100 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{programProgress.program_title}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{programProgress.completed_sessions}/{programProgress.total_sessions} lekcií</span>
              <span>{formatTime(programProgress.time_spent_minutes)} strávených</span>
            </div>
            
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${programProgress.progress_percent}%` }}
              ></div>
            </div>
          </div>
          
          {onContinueSession && currentSession && (
            <button
              onClick={onContinueSession}
              className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Play size={16} />
              Pokračovať
            </button>
          )}
        </div>
      </div>
    );
  }

  // Detailed variant (default)
  if (!programProgress) {
    return (
      <div className={`bg-white rounded-xl p-6 border border-gray-100 text-center ${className}`}>
        <Activity size={48} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Žiadny pokrok</h3>
        <p className="text-gray-500">Začnite program pre sledovanie pokroku</p>
      </div>
    );
  }

  const streakData = getStreakData();
  const milestones = getMilestones();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Progress Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Váš pokrok</h2>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(programProgress.progress_percent)}%
            </div>
            <div className="text-sm text-gray-600">Dokončené</div>
          </div>
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-2">{programProgress.program_title}</h3>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Pokrok v programe</span>
            <span>{programProgress.completed_sessions} z {programProgress.total_sessions} lekcií</span>
          </div>
          <div className="w-full bg-white/50 rounded-full h-3">
            <div 
              className={`h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ 
                width: isVisible ? `${programProgress.progress_percent}%` : '0%',
                transitionDelay: '200ms'
              }}
            ></div>
          </div>
        </div>
        
        {/* Current Session */}
        {currentSession && (
          <div className="bg-white/50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Aktuálna lekcia</h4>
                <p className="text-sm text-gray-600">{currentSession.session_title}</p>
                {currentSession.progress_percent > 0 && (
                  <div className="mt-2 w-48 bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="h-1.5 bg-blue-500 rounded-full transition-all"
                      style={{ width: `${currentSession.progress_percent}%` }}
                    ></div>
                  </div>
                )}
              </div>
              
              {onContinueSession && (
                <button
                  onClick={onContinueSession}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Play size={16} />
                  {currentSession.progress_percent > 0 ? 'Pokračovať' : 'Začať'}
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          {onContinueSession && !currentSession && (
            <button
              onClick={onContinueSession}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <Play size={16} />
              Pokračovať v programe
            </button>
          )}
          
          {onResetProgress && (
            <button
              onClick={onResetProgress}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {programProgress.completed_sessions}
            </div>
            <div className="text-sm text-gray-600">Dokončené lekcie</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatTime(programProgress.time_spent_minutes)}
            </div>
            <div className="text-sm text-gray-600">Čas strávený</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {Math.round(programProgress.progress_percent)}%
            </div>
            <div className="text-sm text-gray-600">Celkový pokrok</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Zap size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {streakData.currentStreak}
            </div>
            <div className="text-sm text-gray-600">Dní v sérii</div>
          </div>
        </div>
      )}

      {/* Streak Display */}
      {showStreak && (
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Denná séria</h3>
          <StreakDisplay 
            streak={streakData.currentStreak} 
            longestStreak={streakData.longestStreak} 
          />
        </div>
      )}

      {/* Milestones */}
      {showMilestones && milestones.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Míľniky</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {milestones.map((milestone, index) => (
              <MilestoneCard
                key={index}
                title={milestone.title}
                description={milestone.description}
                progress={milestone.progress}
                target={milestone.target}
                achieved={milestone.achieved}
                icon={milestone.icon}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      {programProgress.sessions && programProgress.sessions.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nedávne lekcie</h3>
          <div className="space-y-3">
            {programProgress.sessions
              .filter(session => session.completed || session.progress_percent > 0)
              .sort((a, b) => {
                const aDate = new Date(a.completed_at || a.started_at || '');
                const bDate = new Date(b.completed_at || b.started_at || '');
                return bDate.getTime() - aDate.getTime();
              })
              .slice(0, 5)
              .map((session) => (
                <div key={session.session_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      session.completed 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {session.completed ? (
                        <CheckCircle size={16} />
                      ) : (
                        <span className="text-xs font-bold">{session.session_order}</span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{session.session_title}</div>
                      <div className="text-sm text-gray-600">
                        {session.completed 
                          ? `Dokončené ${session.completed_at ? new Date(session.completed_at).toLocaleDateString('sk-SK') : ''}`
                          : `${session.progress_percent}% dokončené`
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    {formatTime(session.time_spent_minutes)}
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}