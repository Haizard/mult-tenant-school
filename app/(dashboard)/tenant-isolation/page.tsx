'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaExclamationTriangle,
  FaChevronDown,
  FaSync,
  FaShieldAlt,
  FaLock,
  FaInfoCircle,
  FaBug,
} from 'react-icons/fa';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/ui/DataTable';
import { useAuth } from '../../contexts/AuthContext';
import RoleGuard from '../../components/RoleGuard';
import { MultiTenantIsolationService, IsolationTestReport } from '../../lib/multiTenantIsolation';

const TenantIsolationPage: React.FC = () => {
  const { user } = useAuth();
  const [isolationReport, setIsolationReport] = useState<IsolationTestReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set());

  const runIsolationTests = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const isolationService = new MultiTenantIsolationService(user);
      const report = await isolationService.generateIsolationReport();
      setIsolationReport(report);
    } catch (err) {
      console.error('Error running isolation tests:', err);
      setError('Failed to run tenant isolation tests');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    runIsolationTests();
  }, [runIsolationTests]);

  const toggleTestExpansion = (testName: string) => {
    setExpandedTests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(testName)) {
        newSet.delete(testName);
      } else {
        newSet.add(testName);
      }
      return newSet;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS':
        return <FaCheckCircle className="text-green-500" />;
      case 'FAIL':
        return <FaExclamationCircle className="text-red-500" />;
      case 'WARNING':
        return <FaExclamationTriangle className="text-yellow-500" />;
      default:
        return <FaInfoCircle className="text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS':
        return 'success';
      case 'FAIL':
        return 'error';
      case 'WARNING':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'PASS':
        return 'success';
      case 'FAIL':
        return 'error';
      case 'WARNING':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Multi-Tenant Isolation Testing</h1>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-blue-800">Running tenant isolation tests...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Multi-Tenant Isolation Testing</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <FaExclamationCircle className="text-red-500 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
        <Button onClick={runIsolationTests} className="flex items-center">
          <FaSync className="mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['Super Admin', 'Tenant Admin']}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Multi-Tenant Isolation Testing</h1>
          <Button
            variant="secondary"
            onClick={runIsolationTests}
            disabled={isLoading}
            className="flex items-center"
          >
            <FaSync className="mr-2" />
            Run Tests
          </Button>
        </div>

        {isolationReport && (
          <>
            {/* Overall Status */}
            <Card className="mb-6" variant="gradient" glow="purple">
              <div className="flex items-center mb-4">
                <FaShieldAlt className="text-4xl text-purple-600 mr-4" />
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Tenant Isolation Status</h2>
                  <div className="mt-2">
                    <StatusBadge 
                      status={getOverallStatusColor(isolationReport.overallStatus) as any}
                    >
                      {isolationReport.overallStatus}
                    </StatusBadge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {isolationReport.summary.passedTests}
                  </div>
                  <div className="text-sm text-gray-600">Passed</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-3xl font-bold text-yellow-600">
                    {isolationReport.summary.warningTests}
                  </div>
                  <div className="text-sm text-gray-600">Warnings</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-3xl font-bold text-red-600">
                    {isolationReport.summary.failedTests}
                  </div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {isolationReport.summary.totalTests}
                  </div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
              </div>
            </Card>

            {/* Test Results */}
            <Card className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Isolation Test Results</h2>
              <div className="space-y-4">
                {isolationReport.tests.map((test) => (
                  <div key={test.testName} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleTestExpansion(test.testName)}
                      className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center">
                        {getStatusIcon(test.status)}
                        <span className="ml-3 font-medium text-gray-900">{test.message}</span>
                      </div>
                      <div className="flex items-center">
                        <StatusBadge 
                          status={getStatusColor(test.status) as any}
                        >
                          {test.status}
                        </StatusBadge>
                        <FaChevronDown 
                          className={`ml-2 transition-transform ${
                            expandedTests.has(test.testName) ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>
                    {expandedTests.has(test.testName) && (
                      <div className="px-4 pb-4 border-t border-gray-200">
                        <div className="mt-3">
                          <h4 className="font-medium text-gray-900 mb-2">Test: {test.testName}</h4>
                          <div className="text-sm text-gray-600 mb-3">
                            <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto">
                              {JSON.stringify(test.details, null, 2)}
                            </pre>
                          </div>
                          {test.recommendations && test.recommendations.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Recommendations:</h4>
                              <ul className="space-y-1">
                                {test.recommendations.map((rec, index) => (
                                  <li key={index} className="flex items-start text-sm text-gray-600">
                                    <FaInfoCircle className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Security Recommendations */}
            <Card className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Security Recommendations</h2>
              <ul className="space-y-2">
                {isolationReport.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start text-gray-700">
                    <FaShieldAlt className="text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Security Best Practices */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Multi-Tenant Security Best Practices</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <FaLock className="text-blue-500 mr-2" />
                    Data Isolation
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Always filter queries by tenant_id</li>
                    <li>• Implement database-level constraints</li>
                    <li>• Use application-level filtering</li>
                    <li>• Regularly audit data access patterns</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <FaShieldAlt className="text-green-500 mr-2" />
                    Access Control
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Implement role-based access control</li>
                    <li>• Validate user permissions on every request</li>
                    <li>• Use JWT tokens with tenant information</li>
                    <li>• Monitor cross-tenant access attempts</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Last tested: {new Date(isolationReport.lastTested).toLocaleString()}
                </p>
              </div>
            </Card>
          </>
        )}
      </div>
    </RoleGuard>
  );
};

export default TenantIsolationPage;