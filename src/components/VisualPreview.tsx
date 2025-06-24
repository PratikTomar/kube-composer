import React, { useState, useMemo } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  RotateCcw, 
  Server, 
  Database, 
  Settings, 
  Key, 
  Globe, 
  Network, 
  HardDrive,
  Users,
  Info,
  ExternalLink,
  GitBranch,
  GitCommit,
  X
} from 'lucide-react';
import type { DeploymentConfig, Namespace, ConfigMap, Secret } from '../types';
import { generateKubernetesYaml, generateConfigMapYaml, generateSecretYaml, generateNamespaceYaml } from '../utils/yamlGenerator';
import { YamlPreview } from './YamlPreview';

interface VisualPreviewProps {
  deployments: DeploymentConfig[];
  namespaces: Namespace[];
  configMaps: ConfigMap[];
  secrets: Secret[];
  containerRef?: React.RefObject<HTMLDivElement>;
}

interface FlowNode {
  id: string;
  name: string;
  type: 'deployment' | 'service' | 'pod' | 'configmap' | 'secret' | 'ingress' | 'namespace' | 'external';
  namespace: string;
  status: 'healthy' | 'warning' | 'error' | 'pending' | 'syncing';
  syncStatus: 'synced' | 'outofsync' | 'unknown';
  position: { x: number; y: number };
  dependencies: string[];
  children: string[];
  metadata: {
    replicas?: number;
    readyReplicas?: number;
    containers?: number;
    ports?: number[];
    dataKeys?: number;
    lastSync?: string;
    syncRevision?: string;
  };
  colorClass?: string;
}

export function VisualPreview({ 
  deployments, 
  namespaces, 
  configMaps, 
  secrets, 
  containerRef
}: VisualPreviewProps) {
  const showDetails = true;
  const [yamlModal, setYamlModal] = useState<{ open: boolean, title: string, yaml: string } | null>(null);

  const validDeployments = deployments.filter(d => d.appName);

  const colorPalette = [
    'border-blue-300 bg-blue-50 shadow-blue-100',
    'border-green-300 bg-green-50 shadow-green-100',
    'border-yellow-300 bg-yellow-50 shadow-yellow-100',
    'border-purple-300 bg-purple-50 shadow-purple-100',
    'border-pink-300 bg-pink-50 shadow-pink-100',
    'border-indigo-300 bg-indigo-50 shadow-indigo-100',
    'border-teal-300 bg-teal-50 shadow-teal-100',
    'border-orange-300 bg-orange-50 shadow-orange-100',
  ];

  // Generate flow nodes with each deployment in its own row
  const rawFlowNodes = useMemo(() => {
    const nodes: FlowNode[] = [];
    const nodeSpacing = { x: 200, y: 140 };
    const rowHeight = 260; // Increased for more space between deployments
    let currentY = 0;

    // Group by namespace
    const namespaceGroups = namespaces.map(ns => ({
      namespace: ns,
      deployments: deployments.filter(d => d.namespace === ns.name && d.appName),
      configMaps: configMaps.filter(cm => cm.namespace === ns.name),
      secrets: secrets.filter(s => s.namespace === ns.name)
    })).filter(group => 
      group.deployments.length > 0 || 
      group.configMaps.length > 0 || 
      group.secrets.length > 0
    );

    namespaceGroups.forEach((group) => {
      group.deployments.forEach((deployment, depIndex) => {
        const baseY = currentY;
        const colorIdx = depIndex % colorPalette.length;
        const colorClass = colorPalette[colorIdx];
        const deploymentId = `deployment-${deployment.appName}`;
        const serviceId = `service-${deployment.appName}`;
        // Calculate deployment status
        const hasContainers = deployment.containers && deployment.containers.length > 0;
        const hasValidContainers = hasContainers && deployment.containers.every(c => c.name && c.image);
        const hasProperPorts = deployment.port > 0 && deployment.targetPort > 0;
        let deploymentStatus: 'healthy' | 'warning' | 'error' | 'pending' | 'syncing';
        let syncStatus: 'synced' | 'outofsync' | 'unknown';
        if (hasValidContainers && hasProperPorts) {
          deploymentStatus = 'healthy';
          syncStatus = 'synced';
        } else if (hasContainers && hasProperPorts) {
          deploymentStatus = 'warning';
          syncStatus = 'outofsync';
        } else {
          deploymentStatus = 'error';
          syncStatus = 'outofsync';
        }
        // Add deployment node
        nodes.push({
          id: deploymentId,
          name: deployment.appName,
          type: 'deployment',
          namespace: deployment.namespace,
          status: deploymentStatus,
          syncStatus: syncStatus,
          position: { x: 0, y: baseY },
          dependencies: [],
          children: [serviceId],
          metadata: {
            replicas: deployment.replicas,
            readyReplicas: hasValidContainers ? deployment.replicas : 0,
            containers: deployment.containers?.length || 0,
            lastSync: new Date().toISOString(),
            syncRevision: `v${Date.now()}`
          },
          colorClass: colorClass
        });
        // Add service node
        nodes.push({
          id: serviceId,
          name: `${deployment.appName}-service`,
          type: 'service',
          namespace: deployment.namespace,
          status: hasValidContainers ? 'healthy' : 'warning',
          syncStatus: hasValidContainers ? 'synced' : 'outofsync',
          position: { x: nodeSpacing.x, y: baseY },
          dependencies: [deploymentId],
          children: deployment.ingress?.enabled ? [`ingress-${deployment.appName}`] : [],
          metadata: {
            ports: [deployment.port]
          },
          colorClass: colorClass
        });
        // Add a single pod node below the deployment, with replica count badge
        const podId = `pod-${deployment.appName}`;
        nodes.push({
          id: podId,
          name: `${deployment.appName}-pod`,
          type: 'pod',
          namespace: deployment.namespace,
          status: hasValidContainers ? 'healthy' : 'error',
          syncStatus: hasValidContainers ? 'synced' : 'outofsync',
          position: { x: -nodeSpacing.x, y: baseY + 60 },
          dependencies: [deploymentId],
          children: [],
          metadata: {
            containers: deployment.containers?.length || 0,
            replicas: deployment.replicas
          },
          colorClass: colorClass
        });
        // Add ingress if enabled
        if (deployment.ingress?.enabled) {
          nodes.push({
            id: `ingress-${deployment.appName}`,
            name: `${deployment.appName}-ingress`,
            type: 'ingress',
            namespace: deployment.namespace,
            status: 'healthy',
            syncStatus: 'synced',
            position: { x: nodeSpacing.x * 2, y: baseY },
            dependencies: [serviceId],
            children: [`external-${deployment.appName}`],
            metadata: {},
            colorClass: colorClass
          });
          nodes.push({
            id: `external-${deployment.appName}`,
            name: 'External Traffic',
            type: 'external',
            namespace: deployment.namespace,
            status: 'healthy',
            syncStatus: 'synced',
            position: { x: nodeSpacing.x * 3, y: baseY },
            dependencies: [`ingress-${deployment.appName}`],
            children: [],
            metadata: {},
            colorClass: colorClass
          });
        }
        // Add ConfigMaps
        deployment.selectedConfigMaps?.forEach((configMapName, cmIndex) => {
          const configMap = configMaps.find(cm => cm.name === configMapName);
          if (configMap) {
            nodes.push({
              id: `configmap-${configMapName}`,
              name: configMapName,
              type: 'configmap',
              namespace: configMap.namespace,
              status: 'healthy',
              syncStatus: 'synced',
              position: { x: -nodeSpacing.x * 2, y: baseY + (cmIndex * 60) },
              dependencies: [deploymentId],
              children: [],
              metadata: {
                dataKeys: Object.keys(configMap.data).length
              },
              colorClass: colorClass
            });
          }
        });
        // Add Secrets
        deployment.selectedSecrets?.forEach((secretName, secIndex) => {
          const secret = secrets.find(s => s.name === secretName);
          if (secret) {
            nodes.push({
              id: `secret-${secretName}`,
              name: secretName,
              type: 'secret',
              namespace: secret.namespace,
              status: 'healthy',
              syncStatus: 'synced',
              position: { x: -nodeSpacing.x * 2, y: baseY + 60 + (secIndex * 60) },
              dependencies: [deploymentId],
              children: [],
              metadata: {
                dataKeys: Object.keys(secret.data).length
              },
              colorClass: colorClass
            });
          }
        });
        currentY += rowHeight; // more space between deployments
      });
      currentY += rowHeight * 0.2;
    });
    return nodes;
  }, [deployments, namespaces, configMaps, secrets]);

  // Bounding box calculation
  const padding = 40;
  const bbox = useMemo(() => {
    if (!rawFlowNodes.length) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    const xs = rawFlowNodes.map(n => n.position.x);
    const ys = rawFlowNodes.map(n => n.position.y);
    return {
      minX: Math.min(...xs),
      minY: Math.min(...ys),
      maxX: Math.max(...xs),
      maxY: Math.max(...ys)
    };
  }, [rawFlowNodes]);

  const nodeWidth = 192; // w-48 in Tailwind = 12rem = 192px
  const leftShift = -bbox.minX + padding + nodeWidth / 2;
  const topShift = -bbox.minY + padding + 60; // 60 for half node height

  // Shift all nodes so minX/minY are at padding
  const flowNodes = useMemo(() => {
    return rawFlowNodes.map(n => ({
      ...n,
      position: {
        x: n.position.x + leftShift,
        y: n.position.y + topShift
      }
    }));
  }, [rawFlowNodes, leftShift, topShift]);

  // Set inner container size to fit all nodes plus padding
  const innerWidth = bbox.maxX - bbox.minX + 2 * padding + 200;
  const innerHeight = bbox.maxY - bbox.minY + 2 * padding + 100; // +100 for node height

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'syncing':
        return <RotateCcw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'deployment':
        return <Server className="w-4 h-4 text-blue-500" />;
      case 'service':
        return <Network className="w-4 h-4 text-green-500" />;
      case 'pod':
        return <HardDrive className="w-4 h-4 text-purple-500" />;
      case 'configmap':
        return <Settings className="w-4 h-4 text-orange-500" />;
      case 'secret':
        return <Key className="w-4 h-4 text-red-500" />;
      case 'ingress':
        return <Globe className="w-4 h-4 text-indigo-500" />;
      case 'namespace':
        return <Database className="w-4 h-4 text-gray-500" />;
      case 'external':
        return <ExternalLink className="w-4 h-4 text-blue-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'border-green-300 bg-green-50 shadow-green-100';
      case 'warning':
        return 'border-yellow-300 bg-yellow-50 shadow-yellow-100';
      case 'error':
        return 'border-red-300 bg-red-50 shadow-red-100';
      case 'pending':
        return 'border-gray-300 bg-gray-50 shadow-gray-100';
      case 'syncing':
        return 'border-blue-300 bg-blue-50 shadow-blue-100';
      default:
        return 'border-gray-300 bg-white shadow-gray-100';
    }
  };

  const getSyncStatusColor = (syncStatus: string) => {
    switch (syncStatus) {
      case 'synced':
        return 'text-green-600 bg-green-100';
      case 'outofsync':
        return 'text-yellow-600 bg-yellow-100';
      case 'unknown':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Helper to generate YAML for a single resource node
  function getYamlForNode(node: any) {
    if (!node) return '';
    if (node.type === 'deployment') {
      const deployment = deployments.find(d => d.appName === node.name);
      if (deployment) {
        // Only output the Deployment YAML (not Service, Ingress, etc.)
        const allYaml = generateKubernetesYaml(deployment);
        const deploymentYaml = allYaml.split('---').find(y => y.includes('kind: Deployment'));
        return deploymentYaml?.trim() || '';
      }
    }
    if (node.type === 'service') {
      const deployment = deployments.find(d => `${d.appName}-service` === node.name);
      if (deployment) {
        // Only output the Service YAML
        const allYaml = generateKubernetesYaml(deployment);
        const serviceYaml = allYaml.split('---').find(y => y.includes('kind: Service'));
        return serviceYaml?.trim() || '';
      }
    }
    if (node.type === 'pod') {
      // Pods are not first-class in your generator, show deployment YAML with a note
      const depName = node.name.split('-').slice(0, -1).join('-');
      const deployment = deployments.find(d => d.appName === depName);
      if (deployment) return generateKubernetesYaml(deployment);
    }
    if (node.type === 'configmap') {
      const cm = configMaps.find(cm => cm.name === node.name);
      if (cm) return generateConfigMapYaml([cm]);
    }
    if (node.type === 'secret') {
      const secret = secrets.find(s => s.name === node.name);
      if (secret) return generateSecretYaml([secret]);
    }
    if (node.type === 'namespace') {
      const ns = namespaces.find(ns => ns.name === node.name);
      if (ns) return generateNamespaceYaml([ns]);
    }
    if (node.type === 'ingress') {
      const depName = node.name.replace(/-ingress$/, '');
      const deployment = deployments.find(d => d.appName === depName);
      if (deployment) {
        const allYaml = generateKubernetesYaml(deployment);
        const ingressYaml = allYaml.split('---').find(y => y.includes('kind: Ingress'));
        return ingressYaml?.trim() || '';
      }
    }
    return '# YAML not available for this resource.';
  }

  // Node click handler
  const handleNodeClick = (node: any) => {
    const yaml = getYamlForNode(node);
    setYamlModal({ open: true, title: node.name, yaml });
  };

  if (!validDeployments.length) {
    return (
      <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <GitBranch className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Resources to Visualize</h3>
          <p className="text-gray-600 mb-6">Create your first deployment to see the Visual diagram</p>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <p className="text-sm text-gray-500">
              Add deployments, ConfigMaps, and Secrets to visualize your Kubernetes resource flow and dependencies
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative min-h-[600px] bg-gradient-to-br from-gray-50 to-gray-100 p-8 overflow-auto"
      style={{ width: '100%', height: '100%' }}
    >
      {/* Hint for double-click */}
      <div className="mb-4 flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-blue-800 text-sm font-medium shadow-sm">
        <Info className="w-4 h-4 text-blue-400 mr-2" />
        <span>Double-click any component to open its configuration/YAML.</span>
      </div>
      <div
        style={{
          width: 'max-content',
          height: 'max-content',
          minWidth: '100%',
          minHeight: '100%',
          position: 'relative',
        }}
      >
        <svg className="absolute inset-0 pointer-events-none" style={{ width: innerWidth, height: innerHeight }}>
          {flowNodes.map(node => 
            node.dependencies.map(depId => {
              const depNode = flowNodes.find(n => n.id === depId);
              if (!depNode) return null;
              const startX = depNode.position.x + 100;
              const startY = depNode.position.y + 30;
              const endX = node.position.x;
              const endY = node.position.y + 30;
              return (
                <g key={`${depId}-${node.id}`}>
                  <defs>
                    <marker
                      id={`arrow-${depId}-${node.id}`}
                      markerWidth="10"
                      markerHeight="10"
                      refX="9"
                      refY="3"
                      orient="auto"
                      markerUnits="strokeWidth"
                    >
                      <path d="M0,0 L0,6 L9,3 z" fill="#6b7280" />
                    </marker>
                  </defs>
                  <line
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke="#6b7280"
                    strokeWidth="2"
                    markerEnd={`url(#arrow-${depId}-${node.id})`}
                    strokeDasharray={node.type === 'external' ? "5,5" : "none"}
                  />
                </g>
              );
            })
          )}
        </svg>
        {flowNodes.map(node => (
          <div
            key={node.id}
            className={`absolute w-48 p-3 rounded-lg border-2 shadow-lg select-none ${
              node.colorClass || getStatusColor(node.status)
            }`}
            style={{
              left: `${node.position.x}px`,
              top: `${node.position.y}px`,
              transform: 'translate(-50%, -50%)'
            }}
            onClick={() => handleNodeClick(node)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getStatusIcon(node.status)}
                {getResourceIcon(node.type)}
                {/* Show replica count badge for pod node */}
                {node.type === 'pod' && typeof node.metadata?.replicas === 'number' && node.metadata.replicas > 1 && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                    x{node.metadata.replicas}
                  </span>
                )}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getSyncStatusColor(node.syncStatus)}`}>
                {node.syncStatus}
              </span>
            </div>
            <div className="text-sm font-medium text-gray-900 mb-1 truncate" title={node.name}>
              {node.name}
            </div>
            <div className="text-xs text-gray-600 mb-2">
              {node.type} • {node.namespace}
            </div>
            {showDetails && node.metadata && (
              <div className="space-y-1 text-xs text-gray-600">
                {node.metadata.replicas !== undefined && (
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>{node.metadata.readyReplicas || 0}/{node.metadata.replicas}</span>
                  </div>
                )}
                {node.metadata.containers !== undefined && (
                  <div className="flex items-center space-x-1">
                    <Server className="w-3 h-3" />
                    <span>{node.metadata.containers} containers</span>
                  </div>
                )}
                {node.metadata.ports && (
                  <div className="flex items-center space-x-1">
                    <Network className="w-3 h-3" />
                    <span>Port {node.metadata.ports.join(', ')}</span>
                  </div>
                )}
                {node.metadata.dataKeys !== undefined && (
                  <div className="flex items-center space-x-1">
                    <Settings className="w-3 h-3" />
                    <span>{node.metadata.dataKeys} keys</span>
                  </div>
                )}
                {node.metadata.lastSync && (
                  <div className="flex items-center space-x-1">
                    <GitCommit className="w-3 h-3" />
                    <span>{new Date(node.metadata.lastSync).toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {/* YAML Modal */}
      {yamlModal?.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
              onClick={() => setYamlModal(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="overflow-y-auto" style={{ maxHeight: '70vh' }}>
              <YamlPreview yaml={yamlModal.yaml} name={yamlModal.title} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 