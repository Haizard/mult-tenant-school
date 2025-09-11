import { PrismaClient } from '@prisma/client'
import { createTenant } from '../actions'

const prisma = new PrismaClient()

export default async function TenantsPage() {
  const tenants = await prisma.tenant.findMany()

  return (
    <div className="bg-gray-900 min-h-screen text-white p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-purple-400">Tenant Management</h1>

        <div className="bg-gray-800 p-8 rounded-lg shadow-2xl mb-10">
          <h2 className="text-2xl font-semibold mb-6 text-purple-300">Create a New Tenant</h2>
          <form action={createTenant} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Organization Name</label>
              <input
                type="text"
                name="name"
                id="name"
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Contact Email</label>
              <input
                type="email"
                name="email"
                id="email"
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-md shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
            >
              Create Tenant
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-6 text-purple-300">Existing Tenants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenants.map((tenant) => (
              <div key={tenant.id} className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-purple-500/30 transition duration-300">
                <h3 className="text-xl font-bold text-purple-400 mb-2">{tenant.name}</h3>
                <p className="text-gray-400">{tenant.email}</p>
                <p className="text-xs text-gray-500 mt-4">Created: {new Date(tenant.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
