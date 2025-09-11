import StatCard from './components/ui/StatCard';
import { FaUserGraduate, FaUserTie, FaAward } from 'react-icons/fa';

export default function Home() {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          icon={FaUserGraduate} 
          label="Students" 
          value="15.00K" 
          color="purple" 
        />
        <StatCard 
          icon={FaUserTie} 
          label="Teachers" 
          value="200" 
          color="blue" 
        />
        <StatCard 
          icon={FaAward} 
          label="Awards" 
          value="5.6K" 
          color="orange" 
        />
      </div>
    </div>
  );
}
