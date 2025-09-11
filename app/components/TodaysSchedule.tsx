import Card from "./ui/Card";

const TodaysSchedule = () => {
  const schedule = [
    {
      time: "08:00 - 09:00",
      subject: "Math",
      teacher: "Mr. John",
      color: "bg-purple-200",
    },
    {
      time: "09:00 - 10:00",
      subject: "English",
      teacher: "Mrs. Doe",
      color: "bg-blue-200",
    },
    {
      time: "10:00 - 11:00",
      subject: "Chemistry",
      teacher: "Mr. Smith",
      color: "bg-yellow-200",
    },
    {
      time: "11:00 - 12:00",
      subject: "Physics",
      teacher: "Mr. Brown",
      color: "bg-green-200",
    },
  ];

  return (
    <Card>
      <h2 className="text-lg font-bold mb-4">Today's Schedule</h2>
      <div className="space-y-4">
        {schedule.map((item, index) => (
          <div key={index} className={`p-4 rounded-lg ${item.color}`}>
            <div className="font-bold">{item.subject}</div>
            <div>{item.teacher}</div>
            <div className="text-sm text-gray-600">{item.time}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TodaysSchedule;
