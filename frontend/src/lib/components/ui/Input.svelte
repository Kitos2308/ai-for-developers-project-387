<script lang="ts">
	let {
		type = 'text',
		label,
		error,
		placeholder = '',
		value = $bindable(''),
		...restProps
	}: {
		type?: string;
		label?: string;
		error?: string;
		placeholder?: string;
		value?: string;
		[key: string]: any;
	} = $props();
</script>

<div class="w-full">
	{#if label}
		<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
			{label}
		</label>
	{/if}
	<input
		{type}
		{placeholder}
		bind:value
		class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors {error ? 'border-red-500 dark:border-red-500' : ''}"
		{...restProps}
	/>
	{#if error}
		<p class="mt-1 text-sm text-red-500">{error}</p>
	{/if}
</div>
