<script lang="ts">
  import { ShieldAlert, LogOut, ArrowLeft } from '@lucide/svelte';

  function handleBackToLogin() {
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  }
</script>

<div class="flex min-h-screen flex-col items-center justify-center bg-base-200/50 px-4 text-center font-sans">
  <div class="max-w-md p-8 bg-base-100 rounded-2xl shadow-xl border border-base-200 flex flex-col items-center">
    <!-- Icon Container -->
    <div class="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center mb-6 animate-bounce">
      <ShieldAlert class="w-10 h-10" />
    </div>

    <!-- Title and Content -->
    <h1 class="text-3xl font-black text-base-content tracking-tight">Access Restricted</h1>
    <span class="badge badge-error uppercase font-mono tracking-wider font-bold mt-2">HTTP 403 Forbidden</span>
    
    <p class="text-sm text-base-content/70 mt-4 leading-relaxed">
      You are authenticated as a <strong>Regular Member</strong>. However, the system dashboard is exclusively reserved for <strong>Administrator</strong> roles.
    </p>

    <div class="bg-base-200/50 p-4 rounded-xl text-xs text-left border border-base-200 mt-6 leading-relaxed w-full">
      <span class="font-bold text-error block mb-1">💡 What should I do?</span>
      If you want to view the administration features (Dashboard, Fields list, Users list, Sloting, System monitoring), please sign out and sign in using an <strong>Admin</strong> account.
    </div>

    <!-- Actions -->
    <div class="mt-8 flex flex-col sm:flex-row gap-3 w-full">
      <button 
        onclick={handleBackToLogin}
        class="btn btn-error btn-outline flex-1 gap-2 rounded-xl"
      >
        <LogOut class="w-4 h-4" />
        Sign Out
      </button>
      <button 
        onclick={handleBackToLogin}
        class="btn btn-primary flex-1 gap-2 rounded-xl"
      >
        <ArrowLeft class="w-4 h-4" />
        Back to Login
      </button>
    </div>
  </div>
</div>
