import { FaBook, FaEllipsisH } from 'react-icons/fa';

const ClassRoutine = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Class Routine</h2>
        <div className="flex items-center gap-4">
          <select className="p-2 rounded-lg bg-gray-100 border-none text-sm">
            <option>Select your day</option>
          </select>
          <select className="p-2 rounded-lg bg-gray-100 border-none text-sm">
            <option>Select your class</option>
          </select>
          <select className="p-2 rounded-lg bg-gray-100 border-none text-sm">
            <option>Section</option>
          </select>
          <a href="#" className="text-sm text-accent-purple font-medium">View All</a>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                        <FaBook className="text-blue-500" />
                    </div>
                    <div>
                        <p className="font-bold">October, 2023</p>
                        <p className="text-sm text-text-secondary">Your October class routine is here.</p>
                    </div>
                </div>
                <button>
                    <FaEllipsisH className="text-gray-400" />
                </button>
            </div>
          <button className="mt-4 w-full bg-accent-purple text-white py-2 rounded-lg">Download routine (pdf)</button>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-2 rounded-lg">
                        <FaBook className="text-orange-500" />
                    </div>
                    <div>
                        <p className="font-bold">November, 2023</p>
                        <p className="text-sm text-text-secondary">Your November class routine is here.</p>
                    </div>
                </div>
                <button>
                    <FaEllipsisH className="text-gray-400" />
                </button>
            </div>
          <button className="mt-4 w-full bg-accent-purple text-white py-2 rounded-lg">Download routine (pdf)</button>
        </div>
      </div>
    </div>
  );
};

export default ClassRoutine;
