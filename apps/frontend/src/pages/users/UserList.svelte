<script lang="ts">
  import { onMount } from 'svelte';
  import { Plus, Edit, Trash2 } from '@lucide/svelte';

  const API_URL = 'http://localhost:3000/api/users'; 

  let users: any[] = [];
  let roles: any[] = [];
  let loading = true;

  // Modal State
  let showModal = false;
  let isEditing = false;
  let editingId: string | null = null;
  
  // Form State
  let formData = {
    fullName: '',
    email: '',
    phone: '',
    roleId: ''
  };

  onMount(async () => {
    await Promise.all([fetchRoles(), fetchUsers()]);
  });

  async function fetchRoles() {
    try {
      const res = await fetch(`${API_URL}/roles`);
      if (res.ok) {
        roles = await res.json();
        console.log(roles);
        if (roles.length > 0) formData.roleId = roles[0].id;
      }
    } catch (e) {
      console.error('Failed to fetch roles', e);
    }
  }

  async function fetchUsers() {
    loading = true;
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        users = await res.json();
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (e) {
      console.error(e);
      users = [];
    } finally {
      loading = false;
    }
  }

  function getRoleName(roleId: string) {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : roleId;
  }

  function openCreateModal() {
    isEditing = false;
    editingId = null;
    formData = { fullName: '', email: '', phone: '', roleId: roles.length > 0 ? roles[0].id : '' };
    showModal = true;
  }

  function openEditModal(user: any) {
    isEditing = true;
    editingId = user.id;
    formData = { 
      fullName: user.fullName, 
      email: user.email, 
      phone: user.phone || '', 
      roleId: user.roleId 
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
        if (res.ok) await fetchUsers();
      } else {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) await fetchUsers();
      }
      showModal = false;
    } catch (e) {
      console.error('Submit failed', e);
      alert('Failed to save user');
    }
  }

  async function deleteUser(id: string) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchUsers();
      } else {
        alert('Failed to delete user');
      }
    } catch (e) {
      console.error('Delete failed', e);
      alert('Failed to delete user');
    }
  }
</script>

<div class="mb-6 flex justify-between items-center">
  <div>
    <h1 class="text-3xl font-bold">User Management</h1>
    <p class="text-base-content/70">Manage user accounts and roles</p>
  </div>
  <button class="btn btn-primary" onclick={openCreateModal}>
    <Plus class="w-4 h-4 mr-2" />
    Add User
  </button>
</div>

<div class="card bg-base-100 shadow-sm border border-base-200">
  <div class="overflow-x-auto">
    <table class="table table-zebra w-full">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#if loading}
          <tr><td colspan="6" class="text-center py-4">Loading...</td></tr>
        {:else if users.length === 0}
          <tr><td colspan="6" class="text-center py-4">No users found</td></tr>
        {:else}
          {#each users as user}
            <tr>
              <td><span class="text-xs opacity-50">{user.id.substring(0, 8)}...</span></td>
              <td class="font-medium">{user.fullName}</td>
              <td>{user.email}</td>
              <td>{user.phone || '-'}</td>
              <td>
                <span class="badge badge-ghost capitalize">
                  {getRoleName(user.roleId)}
                </span>
              </td>
              <td>
                <div class="flex gap-2">
                  <button class="btn btn-sm btn-ghost btn-square text-info" onclick={() => openEditModal(user)}>
                    <Edit class="w-4 h-4" />
                  </button>
                  <!-- Deleting might fail due to FK constraints, but we leave the action -->
                  <button class="btn btn-sm btn-ghost btn-square text-error" onclick={() => deleteUser(user.id)}>
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
      <h3 class="font-bold text-lg mb-4">{isEditing ? 'Edit User' : 'Add New User'}</h3>
      
      <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <div class="form-control w-full mb-4">
          <label class="label" for="full_name"><span class="label-text">Full Name</span></label>
          <input id="full_name" type="text" class="input input-bordered w-full" bind:value={formData.fullName} required />
        </div>
        
        <div class="form-control w-full mb-4">
          <label class="label" for="email"><span class="label-text">Email</span></label>
          <input id="email" type="email" class="input input-bordered w-full" bind:value={formData.email} required />
        </div>

        <div class="form-control w-full mb-4">
          <label class="label" for="phone"><span class="label-text">Phone</span></label>
          <input id="phone" type="text" class="input input-bordered w-full" bind:value={formData.phone} />
        </div>

        <div class="form-control w-full mb-6">
          <label class="label" for="role_id"><span class="label-text">Role</span></label>
          <select id="role_id" class="select select-bordered w-full" bind:value={formData.roleId} required>
            <option value="" disabled>Select a role...</option>
            {#each roles as role}
              <option value={role.id}>{role.name}</option>
            {/each}
          </select>
        </div>
        
        <div class="modal-action">
          <button type="button" class="btn" onclick={() => showModal = false}>Cancel</button>
          <button type="submit" class="btn btn-primary">{isEditing ? 'Save Changes' : 'Create User'}</button>
        </div>
      </form>
    </div>
  </div>
{/if}
