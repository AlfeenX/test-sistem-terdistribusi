<script lang="ts">
  import { onMount } from 'svelte';
  import { CreditCard, CheckCircle, Plus } from '@lucide/svelte';

  const MEMBERSHIP_API = 'http://localhost:3000/api/memberships';
  const USERS_API = 'http://localhost:3000/api/users';

  let plans: any[] = [];
  let users: any[] = [];
  let memberships: any[] = [];
  let loadingPlans = true;
  let loadingMemberships = true;
  let showModal = false;

  let formData = {
    userId: '',
    planId: '',
    startedAt: new Date().toISOString().substring(0, 10),
    expiresAt: ''
  };

  async function loadData() {
    try {
      const [resPlans, resUsers, resMemberships] = await Promise.all([
        fetch(`${MEMBERSHIP_API}/plans`),
        fetch(USERS_API),
        fetch(MEMBERSHIP_API)
      ]);
      if (resPlans.ok) plans = await resPlans.json();
      if (resUsers.ok) users = await resUsers.json();
      if (resMemberships.ok) memberships = await resMemberships.json();
    } catch (e) {
      console.error(e);
    } finally {
      loadingPlans = false;
      loadingMemberships = false;
    }
  }

  onMount(async () => {
    await loadData();
  });

  // Calculate expires at when plan or startedAt changes
  $: {
    if (formData.planId && formData.startedAt) {
      const plan = plans.find(p => p.id === formData.planId);
      if (plan) {
        const start = new Date(formData.startedAt);
        start.setDate(start.getDate() + plan.durationDays);
        formData.expiresAt = start.toISOString().substring(0, 10);
      }
    }
  }

  function openAssignModal() {
    formData = {
      userId: users.length > 0 ? users[0].id : '',
      planId: plans.length > 0 ? plans[0].id : '',
      startedAt: new Date().toISOString().substring(0, 10),
      expiresAt: ''
    };
    showModal = true;
  }

  async function handleAssign() {
    try {
      // Ensure time matches API expectation
      const payload = {
        userId: formData.userId,
        planId: formData.planId,
        startedAt: new Date(formData.startedAt).toISOString(),
        expiresAt: new Date(formData.expiresAt).toISOString()
      };
      const res = await fetch(MEMBERSHIP_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('Membership successfully assigned');
        showModal = false;
        await loadData();
      } else {
        alert('Failed to assign membership');
      }
    } catch (e) {
      console.error(e);
      alert('Error occurred');
    }
  }
</script>

<div class="mb-6 flex justify-between items-center">
  <div>
    <h1 class="text-3xl font-bold">Memberships</h1>
    <p class="text-base-content/70">Manage subscription plans and active user memberships</p>
  </div>
  <button class="btn btn-primary animate-hover" onclick={openAssignModal}>
    <Plus class="w-4 h-4 mr-2" />
    Assign Membership
  </button>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <!-- Plans -->
  <div class="flex flex-col gap-4 lg:col-span-1">
    <h2 class="text-xl font-bold flex items-center gap-2">
      <CreditCard class="w-5 h-5 text-primary" />
      Available Plans
    </h2>
    {#if loadingPlans}
      <div class="flex justify-center py-8"><span class="loading loading-spinner text-primary"></span></div>
    {:else if plans.length === 0}
      <div class="text-sm opacity-60">No plans available.</div>
    {:else}
      {#each plans as plan}
        <div class="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-all">
          <div class="card-body p-5">
            <h3 class="card-title text-base">{plan.name}</h3>
            <p class="text-2xl font-black text-primary">Rp {Number(plan.price).toLocaleString()}</p>
            <div class="badge badge-outline mt-2">{plan.durationDays} Days Duration</div>
          </div>
        </div>
      {/each}
    {/if}
  </div>

  <!-- Active Memberships List -->
  <div class="card bg-base-100 shadow-sm border border-base-200 lg:col-span-2">
    <div class="card-body p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="card-title text-xl flex items-center gap-2">
          <CheckCircle class="w-5 h-5 text-success" />
          Active Memberships
        </h2>
        <span class="badge badge-sm badge-ghost">{memberships.length} Total</span>
      </div>

      {#if loadingMemberships}
        <div class="flex justify-center py-12"><span class="loading loading-spinner text-primary"></span></div>
      {:else if memberships.length === 0}
        <div class="flex flex-col items-center justify-center py-12 text-base-content/40">
          <CreditCard class="w-12 h-12 mb-3 stroke-1" />
          <p class="text-sm">No active memberships found</p>
          <p class="text-xs opacity-60 mt-1">Click "Assign Membership" to get started</p>
        </div>
      {:else}
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full text-sm">
            <thead>
              <tr>
                <th>User</th>
                <th>Plan</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {#each memberships as m}
                <tr class="hover">
                  <td class="font-medium">
                    <div>{m.user?.fullName || 'Unknown User'}</div>
                    <div class="text-xs opacity-50">{m.user?.email || 'N/A'}</div>
                  </td>
                  <td>
                    <span class="font-semibold text-primary">{m.plan?.name || 'Unknown Plan'}</span>
                  </td>
                  <td class="text-xs">
                    <div>{new Date(m.startedAt).toLocaleDateString()}</div>
                    <div class="opacity-50">to {new Date(m.expiresAt).toLocaleDateString()}</div>
                  </td>
                  <td>
                    {#if m.status === 'active' && new Date(m.expiresAt) >= new Date()}
                      <span class="badge badge-success badge-sm gap-1">Active</span>
                    {:else}
                      <span class="badge badge-ghost badge-sm gap-1">Expired</span>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  </div>
</div>

{#if showModal}
  <div class="modal modal-open">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">Assign Membership</h3>
      
      <form onsubmit={(e) => { e.preventDefault(); handleAssign(); }}>
        <div class="form-control w-full mb-4">
          <label class="label"><span class="label-text">Select User</span></label>
          <select class="select select-bordered w-full" bind:value={formData.userId} required>
            <option value="" disabled>Choose a user</option>
            {#each users as u}
              <option value={u.id}>{u.fullName} ({u.email})</option>
            {/each}
          </select>
        </div>
        
        <div class="form-control w-full mb-4">
          <label class="label"><span class="label-text">Select Plan</span></label>
          <select class="select select-bordered w-full" bind:value={formData.planId} required>
            <option value="" disabled>Choose a plan</option>
            {#each plans as p}
              <option value={p.id}>{p.name} - {p.durationDays} days</option>
            {/each}
          </select>
        </div>

        <div class="form-control w-full mb-4">
          <label class="label"><span class="label-text">Started At</span></label>
          <input type="date" class="input input-bordered w-full" bind:value={formData.startedAt} required />
        </div>

        <div class="form-control w-full mb-6">
          <label class="label"><span class="label-text">Expires At (Auto-calculated)</span></label>
          <input type="date" class="input input-bordered w-full" bind:value={formData.expiresAt} disabled />
        </div>
        
        <div class="modal-action">
          <button type="button" class="btn" onclick={() => showModal = false}>Cancel</button>
          <button type="submit" class="btn btn-primary">Assign Plan</button>
        </div>
      </form>
    </div>
  </div>
{/if}
