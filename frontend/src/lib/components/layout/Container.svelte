<script lang="ts">
	let {
		children,
		...restProps
	}: {
		children?: any;
		[key: string]: any;
	} = $props();
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" {...restProps}>
	{@render children?.()}
</div>
