<script lang="ts">
  import { onMount } from 'svelte';
  import { link, active, navigate } from '../lib/router';
  import { 
    LayoutDashboard, Users, CreditCard, 
    Calendar, Activity, Layers, CalendarDays, LogOut
  } from '@lucide/svelte';

  const menu = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Memberships', path: '/users/memberships', icon: CreditCard },
    { name: 'Fields', path: '/fields', icon: Layers },
    { name: 'Slots', path: '/fields/slots', icon: CalendarDays },
    { name: 'Monitoring', path: '/monitoring', icon: Activity },
  ];

  let isDark = false;
  let currentUser = { fullName: 'Admin User', email: 'admin@gajayana.com', role: 'admin' };

  onMount(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      isDark = savedTheme === 'dark';
    } else {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    applyTheme(isDark);

    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        currentUser = JSON.parse(userStr);
      } catch (e) {}
    }
  });

  function applyTheme(dark: boolean) {
    const theme = dark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  function toggleTheme() {
    applyTheme(isDark);
  }

  function handleLogout() {
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  }
</script>

<div class="drawer lg:drawer-open text-base-content bg-base-100 font-sans">
  <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
  
  <div class="drawer-content flex flex-col min-h-screen">
    <!-- Navbar for mobile -->
    <div class="navbar bg-base-100 border-b border-base-200 lg:hidden">
      <div class="flex-none">
        <label for="my-drawer-2" class="btn btn-square btn-ghost drawer-button">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-5 h-5 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </label>
      </div>
      <div class="flex-1">
        <span class="text-xl font-bold px-2">Sport Center</span>
      </div>
    </div>
    
    <!-- Topbar for Desktop (Optional, e.g. user profile / theme toggle) -->
    <div class="hidden lg:flex navbar bg-base-100 border-b border-base-200 px-6">
      <div class="flex-1">
        <h1 class="text-2xl font-bold tracking-tight">System Dashboard</h1>
      </div>
      <div class="flex-none gap-2">
        <label class="swap swap-rotate btn btn-circle btn-ghost">
          <input type="checkbox" bind:checked={isDark} onchange={toggleTheme} />
          
          <!-- sun icon -->
          <svg class="swap-off fill-current w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"/></svg>
          
          <!-- moon icon -->
          <svg class="swap-on fill-current w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"/></svg>
        </label>
        
        <!-- User Profile Dropdown -->
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar placeholder">
            <div class="bg-primary text-primary-content rounded-full w-10">
              <span class="text-sm font-semibold">{currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'A'}</span>
            </div>
          </div>
          <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 border border-base-200 rounded-box w-56 gap-1">
            <li class="px-4 py-2 border-b border-base-200">
              <div class="font-bold text-sm truncate p-0 block">{currentUser.fullName}</div>
              <div class="text-xs text-base-content/60 truncate p-0 block">{currentUser.email}</div>
              <div class="mt-1"><span class="badge badge-primary badge-sm uppercase font-mono tracking-wider">{currentUser.role}</span></div>
            </li>
            <li>
              <button class="text-error hover:bg-error/10 p-2.5 flex items-center gap-2" onclick={handleLogout}>
                <LogOut class="w-4 h-4" />
                Sign Out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
    
    <!-- Main Content Slot -->
    <main class="flex-1 p-6 bg-base-200/30">
      <slot />
    </main>
  </div> 
  
  <div class="drawer-side border-r border-base-200">
    <label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay"></label> 
    <div class="menu w-64 min-h-full bg-base-100 p-4">
      <div class="mb-8 px-4 flex items-center gap-3">
        <div class="w-8 h-8 rounded bg-primary text-primary-content flex items-center justify-center font-bold">
          S
        </div>
        <span class="text-xl font-bold tracking-tight">Sport Center</span>
      </div>
      
      <ul class="gap-2 flex flex-col">
        {#each menu as item}
          <li>
            <a 
              href={item.path} 
              use:link
              use:active
            >
              <svelte:component this={item.icon} class="w-5 h-5 mr-2" />
              {item.name}
            </a>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</div>
