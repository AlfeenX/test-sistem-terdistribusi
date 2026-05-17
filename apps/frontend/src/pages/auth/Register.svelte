<script lang="ts">
  import { onMount } from 'svelte';
  import { navigate } from '../../lib/router';
  import { UserPlus, Mail, Key, User, ShieldAlert, CheckCircle } from '@lucide/svelte';

  let fullName = '';
  let email = '';
  let password = '';
  let roleId = '';
  let roles: { id: string; name: string }[] = [];
  
  let loading = false;
  let successMessage = '';
  let errorMessage = '';

  onMount(async () => {
    try {
      const res = await fetch('http://localhost:3000/api/users/roles');
      if (res.ok) {
        roles = await res.json();
        // Set default role to member if available
        const memberRole = roles.find(r => r.name === 'member');
        if (memberRole) {
          roleId = memberRole.id;
        }
      }
    } catch (e) {
      console.error('Failed to load roles', e);
    }
  });

  async function handleRegister(e: SubmitEvent) {
    e.preventDefault();
    if (!fullName || !email || !password || !roleId) {
      errorMessage = 'Please fill in all fields';
      return;
    }

    loading = true;
    errorMessage = '';
    successMessage = '';

    try {
      const res = await fetch('http://localhost:3000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, roleId })
      });

      const data = await res.json();
      if (res.ok) {
        successMessage = 'Account created successfully! Redirecting to login...';
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        errorMessage = data.error || 'Failed to create account. Please try again.';
      }
    } catch (e) {
      console.error(e);
      errorMessage = 'Failed to connect to authentication server.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="flex min-h-screen items-center justify-center bg-base-200/50 px-4 py-12 sm:px-6 lg:px-8 font-sans">
  <div class="card w-full max-w-md bg-base-100 shadow-xl border border-base-200 overflow-hidden">
    <!-- Brand banner -->
    <div class="bg-primary text-primary-content p-6 text-center">
      <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
        <UserPlus class="h-6 w-6 text-white" />
      </div>
      <h2 class="mt-3 text-2xl font-black tracking-tight">Sport Center</h2>
      <p class="text-sm opacity-80 mt-1">Create a new system user account</p>
    </div>

    <div class="card-body p-8">
      {#if errorMessage}
        <div class="alert alert-error shadow-sm py-3 mb-4 rounded-lg flex gap-2">
          <ShieldAlert class="w-5 h-5 flex-shrink-0" />
          <span class="text-xs font-semibold">{errorMessage}</span>
        </div>
      {/if}

      {#if successMessage}
        <div class="alert alert-success shadow-sm py-3 mb-4 rounded-lg flex gap-2">
          <CheckCircle class="w-5 h-5 flex-shrink-0 text-success-content" />
          <span class="text-xs font-semibold">{successMessage}</span>
        </div>
      {/if}

      <form onsubmit={handleRegister} class="space-y-4">
        <!-- Full Name field -->
        <div class="form-control w-full">
          <label class="label p-1"><span class="label-text font-semibold">Full Name</span></label>
          <div class="relative flex items-center">
            <User class="absolute left-3 w-5 h-5 text-base-content/40" />
            <input 
              type="text" 
              placeholder="John Doe" 
              class="input input-bordered w-full pl-10" 
              bind:value={fullName}
              required
            />
          </div>
        </div>

        <!-- Email field -->
        <div class="form-control w-full">
          <label class="label p-1"><span class="label-text font-semibold">Email Address</span></label>
          <div class="relative flex items-center">
            <Mail class="absolute left-3 w-5 h-5 text-base-content/40" />
            <input 
              type="email" 
              placeholder="john@example.com" 
              class="input input-bordered w-full pl-10" 
              bind:value={email}
              required
            />
          </div>
        </div>

        <!-- Password field -->
        <div class="form-control w-full">
          <label class="label p-1"><span class="label-text font-semibold">Password</span></label>
          <div class="relative flex items-center">
            <Key class="absolute left-3 w-5 h-5 text-base-content/40" />
            <input 
              type="password" 
              placeholder="••••••••" 
              class="input input-bordered w-full pl-10" 
              bind:value={password}
              required
            />
          </div>
        </div>

        <!-- Role Select field -->
        <div class="form-control w-full">
          <label class="label p-1"><span class="label-text font-semibold">System Role</span></label>
          <select class="select select-bordered w-full" bind:value={roleId} required>
            <option value="" disabled>Select a role...</option>
            {#each roles as role}
              <option value={role.id}>{role.name === 'admin' ? 'Admin (Full Access)' : 'Member (Client View)'}</option>
            {/each}
          </select>
        </div>

        <!-- Submit Button -->
        <div class="form-control mt-6">
          <button type="submit" class="btn btn-primary w-full gap-2" disabled={loading || successMessage !== ''}>
            {#if loading}
              <span class="loading loading-spinner loading-sm"></span>
              Creating Account...
            {:else}
              <UserPlus class="w-4 h-4" />
              Register Account
            {/if}
          </button>
        </div>
      </form>

      <!-- Account helper & Login route -->
      <div class="mt-6 border-t border-base-200 pt-6 text-center text-xs">
        <p class="text-base-content/60">
          Already have an account? 
          <a href="/login" class="link link-primary font-bold ml-1 hover:underline">Sign In here</a>
        </p>
      </div>
    </div>
  </div>
</div>
