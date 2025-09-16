'use client';

import React from 'react';
import { useChat, Resource } from '../contexts/ChatContext';
import { Database, FileText, Shield, Link, Folder, CheckCircle, XCircle } from 'lucide-react';

export default function ResourcesPanel() {
  const { getActiveAgent, getAgentResources } = useChat();

  const activeAgent = getActiveAgent();
  const resources = activeAgent ? getAgentResources(activeAgent.id) : [];

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'excel':
        return <FileText className="w-5 h-5 text-green-500" />;
      case 'database':
        return <Database className="w-5 h-5 text-blue-500" />;
      case 'api':
        return <Link className="w-5 h-5 text-purple-500" />;
      case 'file':
        return <Folder className="w-5 h-5 text-orange-500" />;
      case 'permission':
        return <Shield className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPermissionIcon = (permission: string) => {
    return permission === 'read' || permission === 'write' ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 h-[81px]" > 
        <h2 className="text-lg font-semibold text-gray-900">Resources & Permissions</h2>
        {activeAgent && (
          <p className="text-sm text-gray-500 mt-1">
            Resources available to {activeAgent.name}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!activeAgent ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Agent Selected</h3>
              <p className="text-gray-500">Select an agent to view their resources and permissions</p>
            </div>
          </div>
        ) : resources.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Resources</h3>
              <p className="text-gray-500">This agent doesn&apos;t have any assigned resources</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  function ResourceCard({ resource }: { resource: Resource }) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {getResourceIcon(resource.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {resource.name}
              </h3>
              <span className="text-lg">{resource.icon}</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">{resource.description}</p>
            
            {/* Permissions */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-700">Permissions:</h4>
              <div className="flex flex-wrap gap-2">
                {resource.permissions.map((permission: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full"
                  >
                    {getPermissionIcon(permission)}
                    <span className="text-xs text-gray-700 capitalize">{permission}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
