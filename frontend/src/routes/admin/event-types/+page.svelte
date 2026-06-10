<script lang="ts">
	import Container from '$lib/components/layout/Container.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import EventTypeList from '$lib/components/admin/EventTypeList.svelte';
	import EventTypeForm from '$lib/components/admin/EventTypeForm.svelte';
	import { getAdminEventTypes, createEventType, updateEventType, deleteEventType } from '$lib/api/admin';
	import type { EventType, CreateEventTypeRequest, UpdateEventTypeRequest } from '$lib/types';

	let eventTypes = $state<EventType[]>([]);
	let loading = $state(true);
	let showCreateModal = $state(false);
	let editingEventType = $state<EventType | null>(null);

	$effect(() => {
		loadEventTypes();
	});

	async function loadEventTypes() {
		try {
			loading = true;
			eventTypes = await getAdminEventTypes();
		} catch {
			eventTypes = [];
		} finally {
			loading = false;
		}
	}

	function openCreate() {
		editingEventType = null;
		showCreateModal = true;
	}

	function openEdit(eventType: EventType) {
		editingEventType = eventType;
		showCreateModal = true;
	}

	async function handleSave(data: CreateEventTypeRequest | UpdateEventTypeRequest) {
		try {
			if (editingEventType) {
				await updateEventType(editingEventType.id, data as UpdateEventTypeRequest);
			} else {
				await createEventType(data as CreateEventTypeRequest);
			}
			showCreateModal = false;
			await loadEventTypes();
		} catch (e) {
			console.error(e);
		}
	}

	async function handleDelete(id: string) {
		if (!confirm('Удалить этот тип события?')) return;
		try {
			await deleteEventType(id);
			await loadEventTypes();
		} catch (e) {
			console.error(e);
		}
	}
</script>

<Container>
	<div class="py-8">
		<div class="flex items-center justify-between mb-8">
			<h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Типы событий</h1>
			<Button variant="primary" onclick={openCreate}>+ Добавить</Button>
		</div>

		{#if loading}
			<div class="flex justify-center py-12">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
			</div>
		{:else}
			<EventTypeList
				{eventTypes}
				onEdit={openEdit}
				onDelete={handleDelete}
			/>
		{/if}

		<Modal
			open={showCreateModal}
			title={editingEventType ? 'Редактировать тип события' : 'Новый тип события'}
			onClose={() => showCreateModal = false}
		>
			<EventTypeForm
				eventType={editingEventType ?? undefined}
				onSave={handleSave}
				onCancel={() => showCreateModal = false}
			/>
		</Modal>
	</div>
</Container>
