<script lang="ts">
  import { navigate } from '../../lib/router';
  import { LogIn, Key, Mail, ShieldAlert } from '@lucide/svelte';

  let email = '';
  let password = '';
  let loading = false;
  let errorMessage = '';

  async function handleLogin(e: SubmitEvent) {
    e.preventDefault();
    if (!email || !password) {
      errorMessage = 'Please fill in all fields';
      return;
    }

    loading = true;
    errorMessage = '';

    try {
      const res = await fetch('http://localhost:3000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        // Redirect to dashboard or home
        window.location.href = data.user.role === 'admin' ? '/' : '/unauthorized';
      } else {
        errorMessage = data.error || 'Authentication failed. Please check your credentials.';
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
        <LogIn class="h-6 w-6 text-white" />
      </div>
      <h2 class="mt-3 text-2xl font-black tracking-tight">Sport Center</h2>
      <p class="text-sm opacity-80 mt-1">Sign in to your administration account</p>
    </div>

    <div class="card-body p-8">
      {#if errorMessage}
        <div class="alert alert-error shadow-sm py-3 mb-4 rounded-lg flex gap-2">
          <ShieldAlert class="w-5 h-5 flex-shrink-0" />
          <span class="text-xs font-semibold">{errorMessage}</span>
        </div>
      {/if}

      <form onsubmit={handleLogin} class="space-y-4">
        <!-- Email field -->
        <div class="form-control w-full">
          <label class="label p-1"><span class="label-text font-semibold">Email Address</span></label>
          <div class="relative flex items-center">
            <Mail class="absolute left-3 w-5 h-5 text-base-content/40" />
            <input 
              type="email" 
              placeholder="admin@gajayana.com" 
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

        <!-- Submit Button -->
        <div class="form-control mt-6">
          <button type="submit" class="btn btn-primary w-full gap-2" disabled={loading}>
            {#if loading}
              <span class="loading loading-spinner loading-sm"></span>
              Signing in...
            {:else}
              <LogIn class="w-4 h-4" />
              Sign In
            {/if}
          </button>
        </div>
      </form>

      <!-- Account helper & Register route -->
      <div class="mt-6 border-t border-base-200 pt-6 text-center text-xs space-y-2">
        <p class="text-base-content/60">
          Don't have an account? 
          <a href="/register" class="link link-primary font-bold ml-1 hover:underline">Register here</a>
        </p>
        <div class="bg-base-200/50 p-3 rounded-lg text-left text-[11px] leading-relaxed border border-base-200 text-base-content/70">
          <span class="font-bold text-primary block mb-0.5">💡 Demo Accounts:</span>
          • Admin: <code class="font-bold">admin@gajayana.com</code> / <code class="font-bold">admin</code><br/>
          • Member: <code class="font-bold">member@gajayana.com</code> / <code class="font-bold">member</code>
        </div>
      </div>
    </div>
  </div>
</div>
