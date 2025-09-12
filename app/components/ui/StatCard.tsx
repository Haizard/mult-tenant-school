import { IconType } from 'react-icons';

interface StatCardProps {
  icon: IconType;
  label: string;
  value: string;
  color: 'purple' | 'blue' | 'green' | 'orange';
}

const StatCard = ({ icon: Icon, label, value, color }: StatCardProps) => {
  const colorClasses = {
    purple: {
        gradient: 'bg-gradient-to-br from-accent-purple/20 to-accent-purple-light/20',
        iconBg: 'bg-gradient-to-br from-accent-purple to-accent-purple-light',
        iconColor: 'text-white',
        glow: 'shadow-purple-glow',
        border: 'border-accent-purple/30',
    },
    blue: {
        gradient: 'bg-gradient-to-br from-accent-blue/20 to-accent-blue-light/20',
        iconBg: 'bg-gradient-to-br from-accent-blue to-accent-blue-light',
        iconColor: 'text-white',
        glow: 'shadow-blue-glow',
        border: 'border-accent-blue/30',
    },
    green: {
        gradient: 'bg-gradient-to-br from-accent-green/20 to-accent-green-light/20',
        iconBg: 'bg-gradient-to-br from-accent-green to-accent-green-light',
        iconColor: 'text-white',
        glow: 'shadow-green-glow',
        border: 'border-accent-green/30',
    },
    orange: {
        gradient: 'bg-gradient-to-br from-status-warning/20 to-status-warning/30',
        iconBg: 'bg-gradient-to-br from-status-warning to-status-warning',
        iconColor: 'text-white',
        glow: 'shadow-orange-glow',
        border: 'border-status-warning/30',
    },
  };

  const selectedColor = colorClasses[color];

  return (
    <div className={`glass-card p-6 flex items-center ${selectedColor.gradient} ${selectedColor.border} ${selectedColor.glow} hover:scale-105 transition-all duration-300`}>
        <div className={`p-4 rounded-2xl ${selectedColor.iconBg} shadow-glass-light`}>
            <Icon className={`text-3xl ${selectedColor.iconColor}`} />
        </div>
      <div className="ml-5">
        <p className="text-text-secondary text-lg font-medium">{label}</p>
        <p className="text-3xl font-bold text-text-primary text-shadow-glass">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
