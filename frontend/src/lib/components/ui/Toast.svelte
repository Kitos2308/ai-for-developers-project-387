<script lang="ts">
	import { toastStore, type Toast } from '$lib/stores/toast.svelte';

	const toasts = $derived(toastStore.all);
</script>

{#if toasts.length > 0}
	<div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
		{#each toasts as toast (toast.id)}
			<div
				class="flex items-start gap-3 rounded-lg px-4 py-3 text-sm shadow-lg transition-all animate-in"
				class:bg-red-600={toast.type === 'error'}
				class:bg-green-600={toast.type === 'success'}
				class:bg-blue-600={toast.type === 'info'}
				class:text-white
			>
				<span class="flex-1">{toast.message}</span>
				<button
					class="text-white/70 hover:text-white shrink-0 leading-none text-lg"
					onclick={() => toastStore.dismiss(toast.id)}
				>
					&times;
				</button>
			</div>
		{/each}
	</div>
{/if}

<style>
	@keyframes slide-in {
		from { transform: translateX(100%); opacity: 0; }
		to { transform: translateX(0); opacity: 1; }
	}
	.animate-in {
		animation: slide-in 0.2s ease-out;
	}
</style>
