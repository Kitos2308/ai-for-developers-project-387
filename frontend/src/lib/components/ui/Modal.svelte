<script lang="ts">
	let {
		open = false,
		title,
		children,
		onClose,
		...restProps
	}: {
		open?: boolean;
		title?: string;
		children?: any;
		onClose?: () => void;
		[key: string]: any;
	} = $props();
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4" {...restProps}>
		<div class="fixed inset-0 bg-black/50 backdrop-blur-sm" onclick={onClose}></div>
		<div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
			{#if title}
				<div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
					<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
				<button
					onclick={onClose}
					class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
				>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
			{/if}
			<div class="p-6">
				{@render children?.()}
			</div>
		</div>
	</div>
{/if}
