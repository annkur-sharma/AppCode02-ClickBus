import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

// Azure Service Bus would be imported in production
// import { ServiceBusClient } from "@azure/service-bus";

const app = new Hono<{ Bindings: Env }>();

// Generate a persistent pod GUID that stays the same for the entire pod lifecycle
const POD_GUID = crypto.randomUUID();
const POD_START_TIME = new Date().toISOString();

// In-memory storage for this pod's logs and activity
let podLogs: string[] = [];
let requestCount = 0;

console.log(`Pod initialized with GUID: ${POD_GUID} at ${POD_START_TIME}`);

// Enable CORS for frontend communication
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Log action schema
const LogActionSchema = z.object({
  action: z.string(),
  guid: z.string(),
  details: z.string(),
  timestamp: z.string(),
  podName: z.string().optional(),
});

// Azure Service Bus configuration
// const getServiceBusConfig = (env: Env) => ({
//   connectionString: env.AZURE_SERVICE_BUS_CONNECTION_STRING,
//   queueName: env.AZURE_SERVICE_BUS_QUEUE_NAME || 'clickbus-queue',
// });

// Log action to Azure Service Bus and local file
app.post('/api/log', zValidator('json', LogActionSchema), async (c) => {
  try {
    const logData = c.req.valid('json');
    const env = c.env;
    
    // Increment request counter for this pod
    requestCount++;
    
    // Get pod name from environment or default
    const podName = env.POD_NAME || 'backend-pod';
    
    // Enhanced log entry
    const enhancedLogData = {
      ...logData,
      podName,
      podGuid: POD_GUID,
      serverTimestamp: new Date().toISOString(),
      requestNumber: requestCount,
    };
    
    // Store log in memory for this pod
    const logEntry = `${enhancedLogData.serverTimestamp} | Pod: ${podName} | GUID: ${POD_GUID} | Action: ${logData.action} | Details: ${logData.details} | Req#: ${requestCount}`;
    podLogs.push(logEntry);
    
    // Keep only last 100 logs per pod to prevent memory issues
    if (podLogs.length > 100) {
      podLogs = podLogs.slice(-100);
    }
    
    // In production, send to Azure Service Bus
    if (env.AZURE_SERVICE_BUS_CONNECTION_STRING) {
      try {
        // This would be implemented with Azure Service Bus SDK in production
        console.log('Sending to Azure Service Bus:', enhancedLogData);
        
        // Simulated Service Bus message sending
        // const serviceBusClient = new ServiceBusClient(env.AZURE_SERVICE_BUS_CONNECTION_STRING);
        // const sender = serviceBusClient.createSender(getServiceBusConfig(env).queueName);
        // await sender.sendMessages({ body: enhancedLogData });
        // await sender.close();
      } catch (serviceBusError) {
        console.error('Azure Service Bus error:', serviceBusError);
      }
    }
    
    // Log to console (in production this would be written to shared volume)
    console.log('ClickBus Log:', JSON.stringify(enhancedLogData, null, 2));
    
    return c.json({ 
      success: true, 
      message: 'Action logged successfully',
      logId: crypto.randomUUID()
    });
    
  } catch (error) {
    console.error('Logging error:', error);
    return c.json({ 
      success: false, 
      message: 'Failed to log action' 
    }, 500);
  }
});

// Get GUID logs from this specific pod
app.get('/api/logs/guid', async (c) => {
  try {
    const podName = c.env.POD_NAME || 'backend-pod';
    const header = `=== ClickBus Pod GUID Logs ===\nPod: ${podName}\nGUID: ${POD_GUID}\nStarted: ${POD_START_TIME}\nTotal Requests Processed: ${requestCount}\n\n=== Recent Activity ===\n`;
    
    if (podLogs.length === 0) {
      return c.text(header + 'No activity logged yet on this pod.');
    }
    
    return c.text(header + podLogs.join('\n'));
  } catch (error) {
    console.error('Error reading GUID logs:', error);
    return c.text('Error reading GUID logs', 500);
  }
});

// Get formatted data logs from this pod
app.get('/api/logs/data', async (c) => {
  try {
    const podName = c.env.POD_NAME || 'backend-pod';
    const header = `=== ClickBus Data Activity Log ===\nPod Name: ${podName}\nPod GUID: ${POD_GUID}\nUptime: ${POD_START_TIME}\nRequests Handled: ${requestCount}\n\n`;
    
    if (podLogs.length === 0) {
      return c.text(header + 'No user interactions logged yet on this pod.\n\nNote: In a 10-replica deployment, you\'ll see different pod GUIDs serving different requests, demonstrating load distribution.');
    }
    
    const formattedLogs = podLogs.map(log => log.replace(/\|/g, ' -')).join('\n');
    return c.text(header + formattedLogs);
  } catch (error) {
    console.error('Error reading data logs:', error);
    return c.text('Error reading data logs', 500);
  }
});

// Get pod GUID and status endpoint
app.get('/api/pod-guid', (c) => {
  requestCount++; // Track this request too
  return c.json({
    podGuid: POD_GUID,
    podName: c.env.POD_NAME || 'backend-pod',
    startTime: POD_START_TIME,
    requestsHandled: requestCount,
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - new Date(POD_START_TIME).getTime()) / 1000) + ' seconds'
  });
});

// Pod status and deployment info endpoint
app.get('/api/pod-status', (c) => {
  const podName = c.env.POD_NAME || 'backend-pod';
  const namespace = c.env.POD_NAMESPACE || 'clickbus';
  const podIP = c.env.POD_IP || 'unknown';
  
  return c.json({
    deployment: 'ClickBus Backend',
    podName,
    podGuid: POD_GUID,
    namespace,
    podIP,
    startTime: POD_START_TIME,
    uptime: Math.floor((Date.now() - new Date(POD_START_TIME).getTime()) / 1000),
    requestsProcessed: requestCount,
    logEntries: podLogs.length,
    timestamp: new Date().toISOString(),
    note: 'In a 10-replica deployment, each pod will have a unique GUID and process different requests'
  });
});

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'healthy',
    service: 'ClickBus Backend',
    timestamp: new Date().toISOString(),
    podName: c.env.POD_NAME || 'backend-pod',
    podGuid: POD_GUID,
    uptime: Math.floor((Date.now() - new Date(POD_START_TIME).getTime()) / 1000) + 's',
    requestsProcessed: requestCount,
    deploymentReady: true
  });
});

// Root endpoint
app.get('/', (c) => {
  return c.json({ 
    service: 'ClickBus Backend API',
    version: '1.0.0',
    podGuid: POD_GUID,
    podName: c.env.POD_NAME || 'backend-pod',
    startTime: POD_START_TIME,
    requestsHandled: requestCount,
    endpoints: ['/api/log', '/api/logs/guid', '/api/logs/data', '/api/health', '/api/pod-guid', '/api/pod-status'],
    deploymentNote: 'Each pod in a 10-replica deployment will show a unique GUID'
  });
});

export default app;
