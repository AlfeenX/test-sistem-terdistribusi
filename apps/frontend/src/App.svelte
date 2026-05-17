<script lang="ts">
  import { onMount } from 'svelte';
  import { currentPath } from './lib/router';
  import Layout from './components/Layout.svelte';
  import Dashboard from './pages/Dashboard.svelte';
  import UserList from './pages/users/UserList.svelte';
  import UserMemberships from './pages/users/UserMemberships.svelte';
  import FieldList from './pages/fields/FieldList.svelte';
  import Slots from './pages/fields/Slots.svelte';
  import Monitoring from './pages/monitoring/Monitoring.svelte';
  import Login from './pages/auth/Login.svelte';
  import Register from './pages/auth/Register.svelte';
  import Unauthorized from './pages/auth/Unauthorized.svelte';

  // Current logged in user state
  let currentUser = $state<{ id: string; email: string; fullName: string; role: string } | null>(null);
  let initialized = $state(false);

  onMount(() => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        currentUser = JSON.parse(userStr);
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
    initialized = true;
  });

  // Derived active page component and access checking
  let pageInfo = $derived(() => {
    if (!initialized) return { component: null, requiresLayout: false };

    const path = $currentPath;

    // Public Pages
    if (path === '/login') return { component: Login, requiresLayout: false };
    if (path === '/register') return { component: Register, requiresLayout: false };
    if (path === '/unauthorized') return { component: Unauthorized, requiresLayout: false };

    // Route Guard: Redirect to login if not authenticated
    if (!currentUser) {
      return { component: Login, requiresLayout: false };
    }

    // Role-based Guard: If not an admin, redirect to Unauthorized for protected routes
    if (currentUser.role !== 'admin') {
      return { component: Unauthorized, requiresLayout: false };
    }

    // Protected Admin Routes
    if (path === '/' || path === '/dashboard') return { component: Dashboard, requiresLayout: true };
    if (path === '/users') return { component: UserList, requiresLayout: true };
    if (path === '/users/memberships') return { component: UserMemberships, requiresLayout: true };
    if (path === '/fields') return { component: FieldList, requiresLayout: true };
    if (path === '/fields/slots') return { component: Slots, requiresLayout: true };
    if (path === '/monitoring') return { component: Monitoring, requiresLayout: true };

    // Fallback to Dashboard
    return { component: Dashboard, requiresLayout: true };
  });
</script>

{#if !initialized}
  <div class="min-h-screen flex items-center justify-center bg-base-200">
    <span class="loading loading-spinner loading-lg text-primary"></span>
  </div>
{:else}
  {@const info = pageInfo()}
  {#if info.component}
    {#if info.requiresLayout}
      <Layout>
        <svelte:component this={info.component} />
      </Layout>
    {:else}
      <main class="min-h-screen bg-base-200/50">
        <svelte:component this={info.component} />
      </main>
    {/if}
  {/if}
{/if}
