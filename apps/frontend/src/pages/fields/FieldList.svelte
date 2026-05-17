<script lang="ts">
  import { onMount } from 'svelte';
  import { Plus, Edit, Trash2, Layers, X, Save } from '@lucide/svelte';

  const API_URL = 'http://localhost:3000/api/facilities'; 

  let facilities: any[] = [];
  let facilityTypes: any[] = [];
  let loading = true;

  // Modal State
  let showModal = false;
  let isEditing = false;
  let editingId: string | null = null;
  
  // Types Modal State
  let showTypesModal = false;
  let newTypeName = '';
  let editingTypeId: string | null = null;
  let editingTypeName = '';
  
  // Form State
  let formData = {
    name: '',
    facilityTypeId: '',
    hourlyRate: 0
  };

  onMount(async () => {
    await Promise.all([fetchFacilityTypes(), fetchFacilities()]);
  });

  async function fetchFacilityTypes() {
    try {
      const res = await fetch(`${API_URL}/types`);
      if (res.ok) {
        facilityTypes = await res.json();
        if (facilityTypes.length > 0) formData.facilityTypeId = facilityTypes[0].id;
      }
    } catch (e) {
      console.error('Failed to fetch facility types', e);
    }
  }

  async function fetchFacilities() {
    loading = true;
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        facilities = data.facilities || [];
      } else {
        throw new Error('Failed to fetch');
      }
    } catch (e) {
      console.error(e);
      facilities = [];
    } finally {
      loading = false;
    }
  }

  function getTypeName(typeId: string) {
    const type = facilityTypes.find(t => t.id === typeId);
    return type ? type.name : typeId;
  }

  function openCreateModal() {
    isEditing = false;
    editingId = null;
    formData = { name: '', facilityTypeId: facilityTypes.length > 0 ? facilityTypes[0].id : '', hourlyRate: 0 };
    showModal = true;
  }

  function openEditModal(facility: any) {
    isEditing = true;
    editingId = facility.id;
    formData = { 
      name: facility.name, 
      facilityTypeId: facility.facilityTypeId, 
      hourlyRate: Number(facility.hourlyRate) 
    };
    showModal = true;
  }

  async function handleSubmit() {
    try {
      if (isEditing && editingId) {
        const res = await fetch(`${API_URL}/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) await fetchFacilities();
      } else {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) await fetchFacilities();
      }
      showModal = false;
    } catch (e) {
      console.error('Submit failed', e);
      alert('Failed to save facility');
    }
  }

  async function deleteFacility(id: string) {
    if (!confirm('Are you sure you want to delete this facility?')) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchFacilities();
      } else {
        alert('Failed to delete facility');
      }
    } catch (e) {
      console.error('Delete failed', e);
      alert('Failed to delete facility');
    }
  }

  async function addFacilityType() {
    if (!newTypeName.trim()) return;
    try {
      const res = await fetch(`${API_URL}/types`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTypeName.trim() })
      });
      if (res.ok) {
        newTypeName = '';
        await fetchFacilityTypes();
      } else {
        alert('Failed to add facility type');
      }
    } catch (e) {
      console.error(e);
      alert('Error adding facility type');
    }
  }

  function startEditType(type: any) {
    editingTypeId = type.id;
    editingTypeName = type.name;
  }

  async function saveEditType() {
    if (!editingTypeName.trim() || !editingTypeId) return;
    try {
      const res = await fetch(`${API_URL}/types/${editingTypeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingTypeName.trim() })
      });
      if (res.ok) {
        editingTypeId = null;
        editingTypeName = '';
        await fetchFacilityTypes();
        await fetchFacilities();
      } else {
        alert('Failed to update facility type');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating facility type');
    }
  }

  async function deleteFacilityType(id: string) {
    if (!confirm('Are you sure you want to delete this facility type?')) return;
    try {
      const res = await fetch(`${API_URL}/types/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchFacilityTypes();
        await fetchFacilities();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || 'Failed to delete facility type. Note: You cannot delete a type that is currently in use by a facility.');
      }
    } catch (e) {
      console.error(e);
      alert('Error deleting facility type');
    }
  }
</script>

<div class="mb-6 flex justify-between items-center">
  <div>
    <h1 class="text-3xl font-bold">Field Management</h1>
    <p class="text-base-content/70">Manage sport facilities and pricing</p>
  </div>
  <div class="flex gap-2">
    <button class="btn btn-outline" onclick={() => showTypesModal = true}>
      <Layers class="w-4 h-4 mr-2" />
      Manage Types
    </button>
    <button class="btn btn-primary" onclick={openCreateModal}>
      <Plus class="w-4 h-4 mr-2" />
      Add Facility
    </button>
  </div>
</div>

<div class="card bg-base-100 shadow-sm border border-base-200">
  <div class="overflow-x-auto">
    <table class="table table-zebra w-full">
      <thead>
        <tr>
          <th>ID</th>
          <th>Facility Name</th>
          <th>Type</th>
          <th>Hourly Rate</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#if loading}
          <tr><td colspan="5" class="text-center py-4">Loading...</td></tr>
        {:else if facilities.length === 0}
          <tr><td colspan="5" class="text-center py-4">No facilities found</td></tr>
        {:else}
          {#each facilities as facility}
            <tr>
              <td><span class="text-xs opacity-50">{facility.id.substring(0, 8)}...</span></td>
              <td class="font-medium">{facility.name}</td>
              <td>
                <span class="badge badge-ghost capitalize">
                  {getTypeName(facility.facilityTypeId)}
                </span>
              </td>
              <td>Rp {Number(facility.hourlyRate).toLocaleString()}</td>
              <td>
                <div class="flex gap-2">
                  <button class="btn btn-sm btn-ghost btn-square text-info" onclick={() => openEditModal(facility)}>
                    <Edit class="w-4 h-4" />
                  </button>
                  <button class="btn btn-sm btn-ghost btn-square text-error" onclick={() => deleteFacility(facility.id)}>
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
</div>

<!-- Modal Form -->
{#if showModal}
  <div class="modal modal-open">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">{isEditing ? 'Edit Facility' : 'Add New Facility'}</h3>
      
      <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <div class="form-control w-full mb-4">
          <label class="label"><span class="label-text">Facility Name</span></label>
          <input type="text" class="input input-bordered w-full" bind:value={formData.name} required />
        </div>
        
        <div class="form-control w-full mb-4">
          <label class="label"><span class="label-text">Type</span></label>
          <select class="select select-bordered w-full" bind:value={formData.facilityTypeId} required>
            <option value="" disabled>Select a type...</option>
            {#each facilityTypes as type}
              <option value={type.id}>{type.name}</option>
            {/each}
          </select>
        </div>

        <div class="form-control w-full mb-6">
          <label class="label"><span class="label-text">Hourly Rate (Rp)</span></label>
          <input type="number" class="input input-bordered w-full" bind:value={formData.hourlyRate} min="0" required />
        </div>
        
        <div class="modal-action">
          <button type="button" class="btn" onclick={() => showModal = false}>Cancel</button>
          <button type="submit" class="btn btn-primary">{isEditing ? 'Save Changes' : 'Create Facility'}</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- Manage Facility Types Modal -->
{#if showTypesModal}
  <div class="modal modal-open">
    <div class="modal-box max-w-lg">
      <div class="flex justify-between items-center mb-6">
        <h3 class="font-bold text-xl flex items-center gap-2">
          <Layers class="w-5 h-5 text-primary" />
          Manage Facility Types
        </h3>
        <button class="btn btn-sm btn-circle btn-ghost" onclick={() => showTypesModal = false}>
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Add Type Form -->
      <div class="bg-base-200/50 p-4 rounded-lg mb-6 border border-base-200">
        <h4 class="font-semibold text-sm mb-3">Add New Type</h4>
        <form onsubmit={(e) => { e.preventDefault(); addFacilityType(); }} class="flex gap-2">
          <input 
            type="text" 
            placeholder="Type name (e.g. Futsal, Tennis)" 
            class="input input-bordered w-full input-sm" 
            bind:value={newTypeName} 
            required 
          />
          <button type="submit" class="btn btn-primary btn-sm">
            <Plus class="w-4 h-4 mr-1" /> Add
          </button>
        </form>
      </div>

      <!-- List of Types -->
      <div class="max-h-64 overflow-y-auto border border-base-200 rounded-lg">
        <table class="table table-sm table-zebra w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#if facilityTypes.length === 0}
              <tr>
                <td colspan="2" class="text-center py-4 text-base-content/50">No types found. Add one above!</td>
              </tr>
            {:else}
              {#each facilityTypes as type}
                <tr>
                  <td class="font-medium align-middle">
                    {#if editingTypeId === type.id}
                      <input 
                        type="text" 
                        class="input input-bordered input-xs w-full max-w-xs" 
                        bind:value={editingTypeName} 
                        required 
                      />
                    {:else}
                      {type.name}
                    {/if}
                  </td>
                  <td class="text-right align-middle">
                    <div class="flex justify-end gap-1">
                      {#if editingTypeId === type.id}
                        <button class="btn btn-xs btn-success btn-square" onclick={saveEditType} title="Save">
                          <Save class="w-3 h-3" />
                        </button>
                        <button class="btn btn-xs btn-ghost btn-square" onclick={() => editingTypeId = null} title="Cancel">
                          <X class="w-3 h-3" />
                        </button>
                      {:else}
                        <button class="btn btn-xs btn-ghost btn-square text-info" onclick={() => startEditType(type)} title="Edit">
                          <Edit class="w-3.5 h-3.5" />
                        </button>
                        <button class="btn btn-xs btn-ghost btn-square text-error" onclick={() => deleteFacilityType(type.id)} title="Delete">
                          <Trash2 class="w-3.5 h-3.5" />
                        </button>
                      {/if}
                    </div>
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>

      <div class="modal-action mt-6">
        <button class="btn btn-sm" onclick={() => showTypesModal = false}>Close</button>
      </div>
    </div>
  </div>
{/if}
