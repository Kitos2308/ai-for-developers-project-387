<script lang="ts">
	let {
		children,
		padding = 'p-6',
		...restProps
	}: {
		children?: any;
		padding?: string;
		[key: string]: any;
	} = $props();
</script>

<div
	class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm {padding}"
	{...restProps}
>
	{@render children?.()}
</div>
