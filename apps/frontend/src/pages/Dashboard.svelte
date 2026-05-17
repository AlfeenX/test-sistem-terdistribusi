<script lang="ts">
  import { Users, Layers, CalendarDays, Activity } from '@lucide/svelte';
</script>

<div class="mb-6">
  <h1 class="text-3xl font-bold">Dashboard</h1>
  <p class="text-base-content/70">Welcome to Gajayana Sport Center Admin Panel</p>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <div class="card bg-base-100 shadow-sm border border-base-200">
    <div class="card-body">
      <div class="flex items-center justify-between">
        <h2 class="card-title text-base-content/80">Total Users</h2>
        <Users class="text-primary w-6 h-6" />
      </div>
      <p class="text-3xl font-bold mt-2">1,248</p>
      <div class="text-sm text-success flex items-center mt-2">
        <span>+12% from last month</span>
      </div>
    </div>
  </div>

  <div class="card bg-base-100 shadow-sm border border-base-200">
    <div class="card-body">
      <div class="flex items-center justify-between">
        <h2 class="card-title text-base-content/80">Facilities</h2>
        <Layers class="text-secondary w-6 h-6" />
      </div>
      <p class="text-3xl font-bold mt-2">12</p>
      <div class="text-sm text-base-content/50 mt-2">
        <span>4 Badminton, 2 Futsal, etc.</span>
      </div>
    </div>
  </div>

  <div class="card bg-base-100 shadow-sm border border-base-200">
    <div class="card-body">
      <div class="flex items-center justify-between">
        <h2 class="card-title text-base-content/80">Bookings Today</h2>
        <CalendarDays class="text-accent w-6 h-6" />
      </div>
      <p class="text-3xl font-bold mt-2">45</p>
      <div class="text-sm text-warning flex items-center mt-2">
        <span>12 pending confirmation</span>
      </div>
    </div>
  </div>

  <div class="card bg-base-100 shadow-sm border border-base-200">
    <div class="card-body">
      <div class="flex items-center justify-between">
        <h2 class="card-title text-base-content/80">System Health</h2>
        <Activity class="text-success w-6 h-6" />
      </div>
      <p class="text-3xl font-bold mt-2">100%</p>
      <div class="text-sm text-success flex items-center mt-2">
        <span>All 6 services running</span>
      </div>
    </div>
  </div>
</div>
