'use client';

import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  locale?: string;
}

const DAYS_SK = ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'];
const DAYS_EN = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const MONTHS_SK = [
  'Január', 'Február', 'Marec', 'Apríl', 'Máj', 'Jún',
  'Júl', 'August', 'September', 'Október', 'November', 'December'
];
const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function DatePickerModal({
  isOpen,
  onClose,
  selectedDate,
  onDateSelect,
  minDate,
  maxDate,
  locale = 'sk'
}: DatePickerModalProps) {
  const [viewDate, setViewDate] = useState(selectedDate);
  
  const days = locale === 'sk' ? DAYS_SK : DAYS_EN;
  const months = locale === 'sk' ? MONTHS_SK : MONTHS_EN;

  // Reset view date when modal opens
  useEffect(() => {
    if (isOpen) {
      setViewDate(selectedDate);
    }
  }, [isOpen, selectedDate]);

  // Get days for current month view
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    // First day of month (0 = Sunday, we want Monday = 0)
    const firstDay = new Date(year, month, 1);
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6; // Sunday becomes 6
    
    // Last day of month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    const days: Array<{
      date: Date;
      day: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      isDisabled: boolean;
    }> = [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Add previous month days
    for (let i = startDay - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const date = new Date(year, month - 1, day);
      days.push({
        date,
        day,
        isCurrentMonth: false,
        isToday: date.toDateString() === today.toDateString(),
        isSelected: date.toDateString() === selectedDate.toDateString(),
        isDisabled: (minDate && date < minDate) || (maxDate && date > maxDate) || false
      });
    }
    
    // Add current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        day,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString(),
        isSelected: date.toDateString() === selectedDate.toDateString(),
        isDisabled: (minDate && date < minDate) || (maxDate && date > maxDate) || false
      });
    }
    
    // Add next month days to complete the grid (6 rows)
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        day,
        isCurrentMonth: false,
        isToday: date.toDateString() === today.toDateString(),
        isSelected: date.toDateString() === selectedDate.toDateString(),
        isDisabled: (minDate && date < minDate) || (maxDate && date > maxDate) || false
      });
    }
    
    return days;
  }, [viewDate, selectedDate, minDate, maxDate]);

  const goToPrevMonth = useCallback(() => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const goToToday = useCallback(() => {
    const today = new Date();
    setViewDate(today);
  }, []);

  const handleDateClick = useCallback((date: Date, isDisabled: boolean) => {
    if (isDisabled) return;
    onDateSelect(date);
    onClose();
  }, [onDateSelect, onClose]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="px-4 py-3 flex items-center justify-between"
          style={{ backgroundColor: '#40467b' }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToPrevMonth();
            }}
            className="p-2 rounded-lg hover:bg-white/20 transition text-white"
            aria-label="Predchádzajúci mesiac"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="text-center">
            <h3 className="text-lg font-bold text-white">
              {months[viewDate.getMonth()]} {viewDate.getFullYear()}
            </h3>
          </div>
          
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToNextMonth();
            }}
            className="p-2 rounded-lg hover:bg-white/20 transition text-white"
            aria-label="Nasledujúci mesiac"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {days.map((day, i) => (
              <div
                key={i}
                className="text-center text-xs font-semibold text-gray-500 py-2"
              >
                {day}
              </div>
            ))}
          </div>
          
          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((dayInfo, i) => (
              <button
                type="button"
                key={i}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDateClick(dayInfo.date, dayInfo.isDisabled);
                }}
                disabled={dayInfo.isDisabled}
                className={`
                  relative w-full aspect-square flex items-center justify-center
                  text-sm font-medium rounded-lg transition-all
                  ${dayInfo.isDisabled 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : dayInfo.isSelected
                      ? 'text-white shadow-lg'
                      : dayInfo.isCurrentMonth
                        ? 'text-gray-800 hover:bg-gray-100'
                        : 'text-gray-400 hover:bg-gray-50'
                  }
                  ${dayInfo.isToday && !dayInfo.isSelected ? 'ring-2 ring-offset-1' : ''}
                `}
                style={{
                  backgroundColor: dayInfo.isSelected ? '#40467b' : undefined,
                  ringColor: dayInfo.isToday ? '#40467b' : undefined
                }}
              >
                {dayInfo.day}
                {dayInfo.isToday && (
                  <span 
                    className="absolute bottom-1 w-1 h-1 rounded-full"
                    style={{ backgroundColor: dayInfo.isSelected ? 'white' : '#40467b' }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 flex items-center justify-between border-t border-gray-100 pt-3">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToToday();
            }}
            className="text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
            style={{ color: '#40467b' }}
          >
            {locale === 'sk' ? 'Dnes' : 'Today'}
          </button>
          
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition"
          >
            <X size={16} />
            {locale === 'sk' ? 'Zavrieť' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}

