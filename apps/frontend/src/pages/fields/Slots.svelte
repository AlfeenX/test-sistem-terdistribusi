<script lang="ts">
  import { onMount } from 'svelte';
  import { CalendarDays } from '@lucide/svelte';

  const FACILITY_API = 'http://localhost:3000/api/facilities';
  const SLOT_API = 'http://localhost:3000/api/slots';

  let slots: any[] = [];
  let facilities: any[] = [];
  let selectedFacility = '';
  let loading = false;
  let loadingFacilities = true;

  onMount(async () => {
    try {
      const res = await fetch(FACILITY_API);
      if (res.ok) {
        const data = await res.json();
        facilities = data.facilities || [];
        if (facilities.length > 0) {
          selectedFacility = facilities[0].id;
          fetchSlots();
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      loadingFacilities = false;
    }
  });

  async function fetchSlots() {
    if (!selectedFacility) return;
    loading = true;
    try {
      const res = await fetch(`${SLOT_API}/facility/${selectedFacility}/available`);
      if (res.ok) {
        slots = await res.json();
      } else {
        slots = [];
      }
    } catch (e) {
      console.error(e);
      slots = [];
    } finally {
      loading = false;
    }
  }
</script>

<div class="mb-6 flex justify-between items-center">
  <div>
    <h1 class="text-3xl font-bold">Slot Availability</h1>
    <p class="text-base-content/70">Check available timeslots</p>
  </div>
</div>

<div class="card bg-base-100 shadow-sm border border-base-200">
  <div class="card-body">
    <div class="flex gap-4 mb-4 items-end">
      <div class="form-control w-full max-w-xs">
        <label class="label"><span class="label-text">Select Facility</span></label>
        <select class="select select-bordered" bind:value={selectedFacility} onchange={fetchSlots}>
          <option disabled value="">Choose Facility</option>
          {#each facilities as f}
            <option value={f.id}>{f.name}</option>
          {/each}
        </select>
      </div>
    </div>

    {#if loading || loadingFacilities}
      <div class="text-center py-8">Loading...</div>
    {:else if !selectedFacility}
      <div class="text-center py-8">Please select a facility</div>
    {:else if slots.length === 0}
      <div class="text-center py-8">No available slots found for this facility</div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        {#each slots as slot}
          <div class="card border border-base-200 {slot.status === 'available' ? 'bg-success/10 border-success/30' : slot.status === 'booked' ? 'bg-error/10 border-error/30' : 'bg-warning/10 border-warning/30'}">
            <div class="card-body p-4 text-center">
              <CalendarDays class="w-6 h-6 mx-auto mb-2 opacity-70" />
              <div class="text-xs font-mono opacity-60 mb-1">{new Date(slot.slotDate).toLocaleDateString()}</div>
              <h3 class="font-bold text-lg">{slot.startTime} - {slot.endTime}</h3>
              <p class="text-sm uppercase tracking-wide font-semibold mt-1
                {slot.status === 'available' ? 'text-success' : slot.status === 'booked' ? 'text-error' : 'text-warning'}">
                {slot.status}
              </p>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
