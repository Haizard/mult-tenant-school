import { useState } from 'react';
import { FaSearch, FaPlus, FaBuilding, FaUsers, FaCrown, FaStar } from 'react-icons/fa';
import Card from "./ui/Card";
import StatusBadge from "./ui/StatusBadge";
import Button from "./ui/Button";

const tenants = [
  {
    id: "TNT-001",
    name: "St. Mary's Academy",
    email: "admin@stmarys.edu",
    plan: "Premium",
    status: "Active",
    students: 1250,
    teachers: 85,
    location: "Dar es Salaam",
    joinDate: "2023-01-15",
  },
  {
    id: "TNT-002", 
    name: "Kilimanjaro Secondary",
    email: "info@kilimanjaro.edu",
    plan: "Standard",
    status: "Active",
    students: 890,
    teachers: 52,
    location: "Arusha",
    joinDate: "2023-03-22",
  },
  {
    id: "TNT-003",
    name: "Zanzibar International",
    email: "contact@zanzibar.edu",
    plan: "Premium",
    status: "Active",
    students: 2100,
    teachers: 120,
    location: "Zanzibar",
    joinDate: "2022-11-08",
  },
  {
    id: "TNT-004",
    name: "Mwanza High School",
    email: "admin@mwanza.edu",
    plan: "Basic",
    status: "Inactive",
    students: 650,
    teachers: 38,
    location: "Mwanza",
    joinDate: "2023-06-10",
  },
  {
    id: "TNT-005",
    name: "Dodoma Central School",
    email: "info@dodoma.edu",
    plan: "Standard",
    status: "Active",
    students: 1100,
    teachers: 65,
    location: "Dodoma",
    joinDate: "2023-02-14",
  },
];

const TenantsTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || tenant.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'Premium': return <FaCrown className="text-yellow-500" />;
      case 'Standard': return <FaStar className="text-blue-500" />;
      default: return <FaBuilding className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="glass-card p-6 bg-gradient-to-r from-accent-purple/10 to-accent-blue/10 border-accent-purple/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Tenant Management</h1>
            <p className="text-text-secondary">Manage all school tenants and their subscriptions</p>
          </div>
          <div className="flex items-center gap-4">
            <StatusBadge status="success" size="lg">
              {tenants.filter(t => t.status === 'Active').length} Active
            </StatusBadge>
            <Button variant="primary" size="md">
              <FaPlus className="mr-2" />
              Add Tenant
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="strong" glow="purple">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm font-medium">Total Tenants</p>
              <p className="text-2xl font-bold text-text-primary">{tenants.length}</p>
            </div>
            <FaBuilding className="text-3xl text-accent-purple" />
          </div>
        </Card>
        
        <Card variant="strong" glow="green">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm font-medium">Active Schools</p>
              <p className="text-2xl font-bold text-text-primary">{tenants.filter(t => t.status === 'Active').length}</p>
            </div>
            <FaUsers className="text-3xl text-accent-green" />
          </div>
        </Card>
        
        <Card variant="strong" glow="blue">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm font-medium">Total Students</p>
              <p className="text-2xl font-bold text-text-primary">{tenants.reduce((sum, t) => sum + t.students, 0).toLocaleString()}</p>
            </div>
            <FaUsers className="text-3xl text-accent-blue" />
          </div>
        </Card>
        
        <Card variant="strong" glow="orange">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm font-medium">Premium Plans</p>
              <p className="text-2xl font-bold text-text-primary">{tenants.filter(t => t.plan === 'Premium').length}</p>
            </div>
            <FaCrown className="text-3xl text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Search and Filter Section */}
      <Card variant="default">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search tenants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-input w-full pl-10 pr-4 py-3 text-text-primary placeholder-text-muted"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="glass-input px-4 py-3 text-text-primary"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm">Export</Button>
            <Button variant="secondary" size="sm">Import</Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-glass-border">
                <th className="p-4 text-left font-semibold text-text-primary">School</th>
                <th className="p-4 text-left font-semibold text-text-primary">Plan</th>
                <th className="p-4 text-left font-semibold text-text-primary">Students</th>
                <th className="p-4 text-left font-semibold text-text-primary">Teachers</th>
                <th className="p-4 text-left font-semibold text-text-primary">Location</th>
                <th className="p-4 text-left font-semibold text-text-primary">Status</th>
                <th className="p-4 text-left font-semibold text-text-primary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="border-b border-glass-border hover:bg-glass-white/50 transition-colors">
                  <td className="p-4">
                    <div>
                      <p className="font-semibold text-text-primary">{tenant.name}</p>
                      <p className="text-sm text-text-secondary">{tenant.email}</p>
                      <p className="text-xs text-text-muted">ID: {tenant.id}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getPlanIcon(tenant.plan)}
                      <span className="text-text-primary font-medium">{tenant.plan}</span>
                    </div>
                  </td>
                  <td className="p-4 text-text-primary font-medium">{tenant.students.toLocaleString()}</td>
                  <td className="p-4 text-text-primary font-medium">{tenant.teachers}</td>
                  <td className="p-4 text-text-secondary">{tenant.location}</td>
                  <td className="p-4">
                    <StatusBadge 
                      status={tenant.status === 'Active' ? 'success' : 'danger'} 
                      size="sm"
                    >
                      {tenant.status}
                    </StatusBadge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">View</Button>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTenants.length === 0 && (
          <div className="text-center py-12">
            <FaBuilding className="text-6xl text-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">No tenants found</h3>
            <p className="text-text-secondary">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TenantsTable;
