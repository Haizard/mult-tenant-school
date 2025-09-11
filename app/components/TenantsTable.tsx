import Card from "./ui/Card";

const tenants = [
  {
    id: "#12345",
    name: "John Doe",
    email: "john.doe@example.com",
    plan: "Premium",
    status: "Active",
  },
  {
    id: "#12346",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    plan: "Standard",
    status: "Inactive",
  },
  {
    id: "#12347",
    name: "Sam Wilson",
    email: "sam.wilson@example.com",
    plan: "Premium",
    status: "Active",
  },
  {
    id: "#12348",
    name: "Lisa Ray",
    email: "lisa.ray@example.com",
    plan: "Basic",
    status: "Active",
  },
];

const TenantsTable = () => {
  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Tenants</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search tenants..."
            className="w-64 p-2 pl-4 rounded-lg bg-slate-700/50 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="p-4 bg-slate-800/40 rounded-tl-lg font-semibold text-slate-300">ID</th>
              <th className="p-4 bg-slate-800/40 font-semibold text-slate-300">Name</th>
              <th className="p-4 bg-slate-800/40 font-semibold text-slate-300">Email</th>
              <th className="p-4 bg-slate-800/40 font-semibold text-slate-300">Plan</th>
              <th className="p-4 bg-slate-800/40 rounded-tr-lg font-semibold text-slate-300">Status</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant, index) => (
              <tr key={tenant.id} className="border-b border-slate-800 hover:bg-slate-700/50 transition-colors">
                <td className="p-4 text-slate-400">{tenant.id}</td>
                <td className="p-4 text-white font-medium">{tenant.name}</td>
                <td className="p-4 text-slate-400">{tenant.email}</td>
                <td className="p-4 text-slate-400">{tenant.plan}</td>
                <td className="p-4">
                  <span
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                      tenant.status === "Active"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-red-500/10 text-red-400"
                    }`}>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        tenant.status === "Active"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}>
                    </span>
                    {tenant.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default TenantsTable;
