import Card from "./ui/Card";

const DashboardStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <Card>
        <h2 className="text-lg font-bold">Students</h2>
        <p className="text-3xl font-bold text-purple-500">15.00K</p>
      </Card>
      <Card>
        <h2 className="text-lg font-bold">Teachers</h2>
        <p className="text-3xl font-bold text-blue-500">200</p>
      </Card>
      <Card>
        <h2 className="text-lg font-bold">Awards</h2>
        <p className="text-3xl font-bold text-yellow-500">5.6K</p>
      </Card>
    </div>
  );
};

export default DashboardStats;
