import { IconType } from 'react-icons';

interface StatCardProps {
  icon: IconType;
  label: string;
  value: string;
  color: 'purple' | 'blue' | 'orange';
}

const StatCard = ({ icon: Icon, label, value, color }: StatCardProps) => {
  const colorClasses = {
    purple: {
        bg: 'bg-accent-light-purple',
        iconBg: 'bg-accent-purple/20',
        iconColor: 'text-accent-purple',
    },
    blue: {
        bg: 'bg-accent-light-blue',
        iconBg: 'bg-accent-blue/20',
        iconColor: 'text-accent-blue',
    },
    orange: {
        bg: 'bg-accent-light-orange',
        iconBg: 'bg-accent-orange/20',
        iconColor: 'text-accent-orange',
    },
  };

  const selectedColor = colorClasses[color];

  return (
    <div className={`p-6 rounded-2xl flex items-center ${selectedColor.bg}`}>
        <div className={`p-4 rounded-full ${selectedColor.iconBg}`}>
            <Icon className={`text-3xl ${selectedColor.iconColor}`} />
        </div>
      <div className="ml-5">
        <p className="text-text-secondary text-lg">{label}</p>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
