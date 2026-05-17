<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Activity, Server, Database, MessageSquare } from '@lucide/svelte';

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const GATEWAY_URL = API_URL.replace(/\/api.*$/, '');

  const services = [
    { name: 'API Gateway', port: 3000, type: 'gateway', url: `${GATEWAY_URL}/health` },
    { name: 'User Service', port: 3001, type: 'service', url: `${API_URL}/users` },
    { name: 'Field Service', port: 3002, type: 'service', url: `${API_URL}/facilities` },
    { name: 'Booking Service', port: 3003, type: 'service', url: `${API_URL}/bookings/user/healthcheck` },
    { name: 'Payment Service', port: 3004, type: 'service', url: `${API_URL}/invoices/methods` },
    { name: 'Notification Service', port: 3005, type: 'worker', url: `${API_URL}/notifications/health` },
  ];

  let statuses: Record<string, string> = {};
  let pings: Record<string, number> = {};
  let interval: ReturnType<typeof setInterval>;

  const checkService = async (service: typeof services[0]) => {
    const start = performance.now();
    try {
      const res = await fetch(service.url, { 
        method: 'GET', 
        cache: 'no-store',
        mode: service.type === 'gateway' ? 'no-cors' : 'cors'
      });
      const latency = Math.floor(performance.now() - start);
      
      if (service.type === 'gateway' && res.type === 'opaque') {
        // Opaque response means the network request succeeded (Nginx is up), 
        // but we can't read the response due to no-cors mode.
        statuses[service.name] = 'online';
        pings[service.name] = latency;
        return;
      }
      
      // If Nginx returns 502 or 504, the upstream service is down
      if (res.status === 502 || res.status === 504) {
        statuses[service.name] = 'offline';
        pings[service.name] = 0;
      } else {
        // Any other status (including 400, 404 from the service itself) means it's running
        statuses[service.name] = 'online';
        pings[service.name] = latency;
      }
    } catch (e) {
      // Network error (e.g., API Gateway itself is down)
      statuses[service.name] = 'offline';
      pings[service.name] = 0;
    }
  };

  const checkServices = () => {
    services.forEach(checkService);
  };

  onMount(() => {
    checkServices();
    interval = setInterval(checkServices, 5000);
  });

  onDestroy(() => {
    if (interval) clearInterval(interval);
  });
</script>

<div class="mb-6">
  <h1 class="text-3xl font-bold">System Monitoring</h1>
  <p class="text-base-content/70">Real-time microservice status overview</p>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {#each services as service}
    <div class="card bg-base-100 shadow-sm border border-base-200">
      <div class="card-body">
        <div class="flex justify-between items-start">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-base-200 rounded-lg">
              {#if service.type === 'gateway'}
                <Server class="w-6 h-6 text-primary" />
              {:else if service.type === 'worker'}
                <MessageSquare class="w-6 h-6 text-secondary" />
              {:else}
                <Database class="w-6 h-6 text-accent" />
              {/if}
            </div>
            <div>
              <h2 class="card-title text-lg leading-none">{service.name}</h2>
              <p class="text-xs text-base-content/60 mt-1">Port: {service.port}</p>
            </div>
          </div>
          
          <!-- Ping animation -->
          {#if statuses[service.name] === 'online'}
            <span class="relative flex h-3 w-3 mt-1">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
            </span>
          {:else}
            <span class="relative flex h-3 w-3 mt-1">
              <span class="relative inline-flex rounded-full h-3 w-3 bg-error"></span>
            </span>
          {/if}
        </div>
        
        <div class="mt-4 flex justify-between items-end border-t border-base-200 pt-4">
          <div>
            <p class="text-sm font-medium">Status</p>
            <p class="text-sm uppercase tracking-wider font-bold mt-1 {statuses[service.name] === 'online' ? 'text-success' : 'text-error'}">
              {statuses[service.name] || 'Checking...'}
            </p>
          </div>
          <div class="text-right">
            <p class="text-sm font-medium">Latency</p>
            <p class="text-sm font-mono mt-1 {statuses[service.name] === 'online' ? '' : 'opacity-30'}">
              {statuses[service.name] === 'online' ? `${pings[service.name]}ms` : '--'}
            </p>
          </div>
        </div>
      </div>
    </div>
  {/each}
</div>
