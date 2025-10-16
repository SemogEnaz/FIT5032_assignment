<template>
  <main class="admin-home py-4">
    <!-- Header -->
    <section class="container text-center mb-4">
      <h1 class="mb-2">Admin</h1>
      <p class="text-muted mb-0">Choose a task to get started.</p>
    </section>

    <!-- Big nav buttons -->
    <section class="section">
      <div class="container">
        <nav class="big-nav" aria-label="Admin navigation">
          <RouterLink class="tile" to="/admin/events" aria-label="Create Events">
            <span class="tile__emoji" aria-hidden="true">📅</span>
            <span class="tile__title">Create Events</span>
            <span class="tile__desc">Add new events to the club calendar.</span>
          </RouterLink>

          <RouterLink class="tile" to="/admin/blog" aria-label="Manage Blog">
            <span class="tile__emoji" aria-hidden="true">✍️</span>
            <span class="tile__title">Manage Blog</span>
            <span class="tile__desc">Create, edit, and delete blog posts.</span>
          </RouterLink>

          <RouterLink class="tile" to="/admin/email" aria-label="Bulk Email">
            <span class="tile__emoji" aria-hidden="true">📣</span>
            <span class="tile__title">Bulk Email</span>
            <span class="tile__desc">Send announcements to users.</span>
          </RouterLink>

          <RouterLink class="tile" to="/admin/users" aria-label="Manage Users">
            <span class="tile__emoji" aria-hidden="true">👥</span>
            <span class="tile__title">Manage Users</span>
            <span class="tile__desc">Edit roles or delete users.</span>
          </RouterLink>
        </nav>
      </div>
    </section>
  </main>
</template>

<script setup>
</script>

<style scoped>
.container { width: min(1100px, 92%); margin: 0 auto; }
.section { padding: 1rem 0 0.5rem; }

/* Grid of big tiles */
.big-nav {
  display: grid;
  grid-template-columns: repeat(4, minmax(200px, 1fr));
  gap: 1rem;
}

.tile {
  display: grid;
  grid-template-rows: auto auto 1fr;
  align-content: start;
  gap: 0.35rem;
  padding: clamp(1rem, 2.5vw, 1.25rem);
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #fff;
  text-decoration: none;
  color: inherit;
  transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.04);
}

.tile:focus,
.tile:hover {
  transform: translateY(-2px);
  border-color: #cbd5e1;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
  outline: none;
}

.tile__emoji {
  font-size: clamp(1.6rem, 4vw, 2rem);
  line-height: 1;
}
.tile__title {
  font-weight: 800;
  font-size: clamp(1.05rem, 2.2vw, 1.2rem);
}
.tile__desc {
  color: #6b7280;
  font-size: 0.95rem;
}

/* Responsive */
@media (max-width: 1000px) {
  .big-nav { grid-template-columns: repeat(2, minmax(220px, 1fr)); }
}
@media (max-width: 580px) {
  .big-nav { grid-template-columns: 1fr; }
}
</style>
