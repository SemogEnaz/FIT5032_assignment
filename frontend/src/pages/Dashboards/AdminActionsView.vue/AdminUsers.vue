<template>
  <DataTable :value="rows" tableStyle="min-width: 30rem">
    <Column field="id" header="ID" />
    <Column field="name" header="Name" />
    <Column field="role" header="Role" />
  </DataTable>
</template>

<script setup>
const rows = [
  { id: 1, name: 'Zane', role: 'Admin' },
  { id: 2, name: 'Emily', role: 'Member' },
  { id: 3, name: 'Omar', role: 'Member' },
]
</script>
