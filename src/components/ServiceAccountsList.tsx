import React, { useState } from 'react';
import { Settings, Copy, Trash2, AlertTriangle, Calendar, Users, Key } from 'lucide-react';
import { K8sServiceAccountIcon } from './KubernetesIcons';
import type { ServiceAccount } from '../types';

interface ServiceAccountsListProps {
  serviceAccounts: ServiceAccount[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onEdit: (index: number) => void;
  onDelete: (serviceAccountName: string) => void;
  onDuplicate: (index: number) => void;
}

export function ServiceAccountsList({ 
  serviceAccounts, 
  selectedIndex, 
  onSelect, 
  onEdit, 
  onDelete, 
  onDuplicate 
}: ServiceAccountsListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDeleteClick = (serviceAccountName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm(serviceAccountName);
  };

  const handleConfirmDelete = (serviceAccountName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(serviceAccountName);
    setDeleteConfirm(null);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm(null);
  };

  const handleDuplicateClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicate(index);
  };

  const handleEditClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(index);
  };

  if (serviceAccounts.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <K8sServiceAccountIcon className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-base font-medium text-gray-900 mb-1">No Service Accounts</h3>
        <p className="text-xs text-gray-500">
          Create Service Accounts to manage authentication and authorization for your applications
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Service Accounts List */}
      <div className="flex-1 p-2">
        <div className="space-y-1">
          {serviceAccounts.map((serviceAccount, index) => (
            <div
              key={`${serviceAccount.namespace}-${serviceAccount.name}`}
              className={`bg-white rounded border cursor-pointer transition-all duration-200 hover:shadow-sm ${
                selectedIndex === index
                  ? 'border-cyan-300 bg-cyan-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onSelect(index)}
            >
              <div className="p-2">
                {/* Header with icon and name */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <div className="flex-shrink-0">
                      <div className={`w-6 h-6 rounded flex items-center justify-center ${
                        selectedIndex === index ? 'bg-cyan-600' : 'bg-gray-100'
                      }`}>
                        <K8sServiceAccountIcon className={`w-3 h-3 ${
                          selectedIndex === index ? 'text-white' : 'text-gray-600'
                        }`} />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {serviceAccount.name}
                        </h3>
                        <span className="px-1.5 py-0.5 bg-cyan-100 text-cyan-800 rounded text-xs font-medium">
                          {serviceAccount.namespace}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 space-x-2 mt-0.5">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-2.5 h-2.5" />
                          <span>{new Date(serviceAccount.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className={`px-1 py-0.5 rounded text-xs font-medium ${
                          serviceAccount.automountServiceAccountToken !== false 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {serviceAccount.automountServiceAccountToken !== false ? 'Auto-mount' : 'No auto-mount'}
                        </span>
                        {/* Secrets summary inline */}
                        {(serviceAccount.secrets && serviceAccount.secrets.length > 0) || 
                         (serviceAccount.imagePullSecrets && serviceAccount.imagePullSecrets.length > 0) ? (
                          <div className="flex items-center space-x-1">
                            {serviceAccount.secrets && serviceAccount.secrets.length > 0 && (
                              <div className="flex items-center space-x-0.5">
                                <Key className="w-2.5 h-2.5 text-gray-400" />
                                <span className="text-xs">{serviceAccount.secrets.length}</span>
                              </div>
                            )}
                            {serviceAccount.imagePullSecrets && serviceAccount.imagePullSecrets.length > 0 && (
                              <div className="flex items-center space-x-0.5">
                                <Users className="w-2.5 h-2.5 text-gray-400" />
                                <span className="text-xs">{serviceAccount.imagePullSecrets.length}</span>
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-0.5 flex-shrink-0 ml-2">
                    {deleteConfirm === serviceAccount.name ? (
                      // Delete confirmation buttons
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={handleCancelDelete}
                          className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={(e) => handleConfirmDelete(serviceAccount.name, e)}
                          className="px-1.5 py-0.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200 flex items-center space-x-0.5"
                        >
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    ) : (
                      // Normal action buttons
                      <>
                        <button
                          onClick={(e) => handleEditClick(index, e)}
                          className="p-1 text-gray-400 hover:text-cyan-600 rounded transition-colors duration-200"
                          title="Edit Service Account"
                        >
                          <Settings className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleDuplicateClick(index, e)}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors duration-200"
                          title="Duplicate Service Account"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(serviceAccount.name, e)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors duration-200"
                          title="Delete Service Account"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Delete confirmation warning */}
                {deleteConfirm === serviceAccount.name && (
                  <div className="mt-1 p-1.5 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                    <div className="flex items-center space-x-1 mb-0.5">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      <span className="font-medium">Are you sure?</span>
                    </div>
                    <div>
                      This will delete the Service Account and may affect applications that use it for authentication.
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 