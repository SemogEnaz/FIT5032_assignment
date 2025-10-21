<template>
  <DataTable 
    :value="rows"
    paginator :rows="5" :rowsPerPageOptions="[5, 10]"
    tableStyle="min-width: 30rem;">

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
