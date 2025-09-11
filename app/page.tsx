import DashboardStats from "./components/DashboardStats";
import Chart from "./components/Chart";
import InfoCard from "./components/InfoCard";
import Button from "./components/ui/Button";
import Card from "./components/ui/Card";
import OverallProgress from "./components/OverallProgress";
import TodaysSchedule from "./components/TodaysSchedule";

const chartData = [
  { name: 'Math', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'English', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Chemistry', uv: 2000, pv: 9800, amt: 2290 },
  { name: '...', uv: 2780, pv: 3908, amt: 2000 },
];

export default function Home() {
  return (
    <div>
      <DashboardStats />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-lg font-bold mb-4">Course Statistics</h2>
            <Chart data={chartData} />
          </Card>
        </div>
        <OverallProgress />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <TodaysSchedule />
        <Card>
          <h2 className="text-lg font-bold mb-4">New Course</h2>
          <p>Build your career with API</p>
          <Button variant="primary" size="md" className="mt-4">Enroll Now</Button>
        </Card>
      </div>
    </div>
  );
}
