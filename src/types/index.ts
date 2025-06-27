export interface EnvVar {
  name: string; 
  value?: string;
  valueFrom?: {
    type: 'configMap' | 'secret';
    name: string;
    key: string;
  };
}

export interface Container {
  name: string;
  image: string;
  port?: number;
  env: EnvVar[];
  resources: {
    requests: { cpu: string; memory: string };
    limits: { cpu: string; memory: string };
  };
  volumeMounts: Array<{ name: string; mountPath: string }>;
  command?: string;
  args?: string;
}

export interface IngressRule {
  host: string;
  path: string;
  pathType: 'Prefix' | 'Exact' | 'ImplementationSpecific';
  serviceName: string;
  servicePort: number;
}

export interface IngressConfig {
  enabled: boolean;
  className?: string;
  annotations: Record<string, string>;
  tls: Array<{
    secretName: string;
    hosts: string[];
  }>;
  rules: IngressRule[];
}

export interface ConfigMap {
  name: string;
  namespace: string;
  labels: Record<string, string>;
  annotations: Record<string, string>;
  data: Record<string, string>;
  createdAt: string;
}

export interface Secret {
  name: string;
  namespace: string;
  labels: Record<string, string>;
  annotations: Record<string, string>;
  type: 'Opaque' | 'kubernetes.io/tls' | 'kubernetes.io/dockerconfigjson';
  data: Record<string, string>;
  createdAt: string;
}

export interface ProjectSettings {
  name: string;
  description?: string;
  globalLabels: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface DeploymentConfig {
  appName: string;
  containers: Container[];
  replicas: number;
  port: number;
  targetPort: number;
  serviceType: 'ClusterIP' | 'NodePort' | 'LoadBalancer';
  namespace: string;
  labels: Record<string, string>;
  annotations: Record<string, string>;
  volumes: Array<{ name: string; mountPath: string; type: 'emptyDir' | 'configMap' | 'secret'; configMapName?: string; secretName?: string }>;
  configMaps: Array<{ name: string; data: Record<string, string> }>; // Legacy - for backward compatibility
  secrets: Array<{ name: string; data: Record<string, string> }>; // Legacy - for backward compatibility
  selectedConfigMaps: string[]; // References to ConfigMap names
  selectedSecrets: string[]; // References to Secret names
  ingress: IngressConfig;
  // Legacy fields for backward compatibility
  image?: string;
  env?: Array<{ name: string; value: string }>;
  resources?: {
    requests: { cpu: string; memory: string };
    limits: { cpu: string; memory: string };
  };
}

export interface Namespace {
  name: string;
  labels: Record<string, string>;
  annotations: Record<string, string>;
  createdAt: string;
}

export interface KubernetesResource {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace?: string;
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
  };
  spec?: any;
  data?: Record<string, string>;
  type?: string;
}

export interface JobConfig {
  name: string;
  namespace: string;
  labels: Record<string, string>;
  annotations: Record<string, string>;
  containers: Container[];
  restartPolicy: 'Never' | 'OnFailure';
  completions?: number;
  parallelism?: number;
  backoffLimit?: number;
  activeDeadlineSeconds?: number;
  createdAt?: string;
}

export interface CronJobConfig {
  name: string;
  namespace: string;
  labels: Record<string, string>;
  annotations: Record<string, string>;
  schedule: string;
  concurrencyPolicy?: 'Allow' | 'Forbid' | 'Replace';
  startingDeadlineSeconds?: number;
  successfulJobsHistoryLimit?: number;
  failedJobsHistoryLimit?: number;
  jobTemplate: JobConfig;
  createdAt?: string;
}