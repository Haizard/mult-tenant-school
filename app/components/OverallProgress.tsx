import Card from "./ui/Card";
import ProgressBar from "./ui/ProgressBar";

const OverallProgress = () => {
  return (
    <Card>
      <h2 className="text-lg font-bold mb-4">Overall Progress</h2>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span>UI/UX Design</span>
            <span>75%</span>
          </div>
          <ProgressBar progress={75} colorClass="bg-purple-500" />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span>HTML</span>
            <span>95%</span>
          </div>
          <ProgressBar progress={95} colorClass="bg-blue-500" />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span>CSS</span>
            <span>85%</span>
          </div>
          <ProgressBar progress={85} colorClass="bg-yellow-500" />
        </div>
      </div>
    </Card>
  );
};

export default OverallProgress;
