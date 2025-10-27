<template>
  <main class="container py-4">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
      <h1 class="h4">User Management</h1>
      <RouterLink to="/admin" class="link text-decoration-none">← Admin Home</RouterLink>
    </div>

    <LoadingScreen v-if="!users.length" />

    <div v-else>

      <div class="mb-3 p-3 border rounded bg-light shadow-sm">
        <h5 class="mb-2">Overview</h5>
        <p>Total Users: <strong>{{ users.length }}</strong></p>
        <p>Roles: 
          <span v-for="(count, role) in roleSummary" :key="role" class="me-3">
            {{ role }}: <strong>{{ count }}</strong>
          </span>
        </p>
      </div>
  
      <div class="card p-3 shadow-sm">
        <DataTable
          :value="users"
          paginator
          :rows="10"
          responsiveLayout="scroll"
        >
          <Column field="firstName" header="First Name"></Column>
          <Column field="email" header="Email"></Column>
          <Column field="role" header="Role"></Column>
  
          <Column header="Actions">
            <template #body="{ data }">
              <Button
                icon="pi pi-trash"
                class="p-button-danger p-button-sm"
                label="Delete"
                @click="confirmDelete(data.uid)"
              />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

  </main>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import LoadingScreen from "@/components/LoadingScreen.vue";

const users = ref([]);
const error = ref("");

//   Fetch users from Cloud Function
async function fetchUsers() {
  try {
    const res = await axios.get("https://getallusers-5bgqwovi2q-uc.a.run.app");
    if (res.data?.success && Array.isArray(res.data.users)) {
      users.value = res.data.users;
    } else {
      throw new Error("Unexpected API response");
    }
  } catch (err) {
    console.error("Error fetching users:", err);
    error.value = "Failed to fetch users.";
  }
}

//   Delete user
async function confirmDelete(uid) {
  if (!confirm("Are you sure you want to delete this user?")) return;
  try {
    const res = await axios.post("https://deleteuser-5bgqwovi2q-uc.a.run.app", { uid });
    if (res.data.success) {
      users.value = users.value.filter((u) => u.uid !== uid);
      alert("  User deleted successfully");
    } else {
      alert("⚠️ Failed to delete user: " + res.data.message);
    }
  } catch (err) {
    console.error("Error deleting user:", err);
    alert("❌ Error deleting user");
  }
}

//   Compute role summary
const roleSummary = computed(() => {
  const summary = {};
  for (const u of users.value) {
    const role = u.role || "member";
    summary[role] = (summary[role] || 0) + 1;
  }
  return summary;
});

onMounted(fetchUsers);
</script>

<style scoped>
.container {
  max-width: 900px;
}
.card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}
</style>
