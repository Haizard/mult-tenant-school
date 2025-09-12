import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt } from 'react-icons/fa';

interface CalendarEvent {
  date: number;
  title: string;
  type: 'event' | 'exam' | 'holiday' | 'assignment';
  color: 'purple' | 'green' | 'blue' | 'orange' | 'red';
}

interface CalendarWidgetProps {
  events?: CalendarEvent[];
  onDateSelect?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
}

const CalendarWidget = ({ events = [], onDateSelect, onEventClick, className = '' }: CalendarWidgetProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventsForDate = (date: number) => {
    return events.filter(event => event.date === date);
  };

  const getEventColor = (color: string) => {
    const colors = {
      purple: 'bg-accent-purple',
      green: 'bg-accent-green',
      blue: 'bg-accent-blue',
      orange: 'bg-status-warning',
      red: 'bg-status-danger',
    };
    return colors[color as keyof typeof colors] || 'bg-gray-400';
  };

  const days = getDaysInMonth(currentDate);
  const today = new Date();

  return (
    <div className={`glass-card p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-accent-purple to-accent-purple-light rounded-lg">
            <FaCalendarAlt className="text-white text-lg" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <p className="text-sm text-text-secondary">Calendar</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="glass-button p-2 hover:bg-accent-purple/20 hover:text-accent-purple transition-all duration-200"
          >
            <FaChevronLeft className="text-sm" />
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="glass-button p-2 hover:bg-accent-purple/20 hover:text-accent-purple transition-all duration-200"
          >
            <FaChevronRight className="text-sm" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {dayNames.map(day => (
          <div key={day} className="text-center py-2 text-sm font-medium text-text-muted">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isToday = day === today.getDate() && 
                         currentDate.getMonth() === today.getMonth() && 
                         currentDate.getFullYear() === today.getFullYear();
          
          const dayEvents = day ? getEventsForDate(day) : [];
          
          return (
            <div
              key={index}
              className={`
                aspect-square flex flex-col items-center justify-center text-sm cursor-pointer
                rounded-lg transition-all duration-200 hover:bg-glass-white/50
                ${day ? 'hover:scale-105' : ''}
                ${isToday ? 'bg-accent-purple text-white shadow-purple-glow' : ''}
                ${!day ? 'invisible' : ''}
              `}
              onClick={() => day && onDateSelect?.(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
            >
              <span className={`font-medium ${isToday ? 'text-white' : 'text-text-primary'}`}>
                {day}
              </span>
              
              {/* Event indicators */}
              {dayEvents.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {dayEvents.slice(0, 3).map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className={`w-1.5 h-1.5 rounded-full ${getEventColor(event.color)}`}
                      title={event.title}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400" title={`+${dayEvents.length - 3} more`} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      {events.length > 0 && (
        <div className="mt-6 pt-4 border-t border-glass-border">
          <h4 className="text-sm font-medium text-text-primary mb-3">Event Types</h4>
          <div className="flex flex-wrap gap-3">
            {['purple', 'green', 'blue', 'orange', 'red'].map(color => {
              const colorEvents = events.filter(event => event.color === color);
              if (colorEvents.length === 0) return null;
              
              return (
                <div key={color} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getEventColor(color)}`} />
                  <span className="text-xs text-text-secondary capitalize">{color}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarWidget;


