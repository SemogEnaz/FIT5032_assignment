<template>
  <div>
    <button
      v-if="isPast && !event.userStatus"
      class="btn btn-secondary btn-sm w-100"
      disabled
    >
      Event Closed
    </button>

    <button
      v-else-if="!event.userStatus && !isPast"
      class="btn btn-dark btn-sm w-100"
      @click="handleAction('register')"
    >
      Register
    </button>

    <RouterLink
      v-else-if="isUpcoming && event.userStatus === 'registered'"
      to="/events"
      class="btn btn-outline-primary btn-sm w-100 text-decoration-none"
    >
      Registered ✓
    </RouterLink>

    <button
      v-else-if="isPast && event.userStatus === 'registered'"
      class="btn btn-warning btn-sm w-100"
      @click="handleAction('attend')"
    >
      Mark Attendance
    </button>

    <button
      v-else-if="event.userStatus === 'attended'"
      class="btn btn-success btn-sm w-100"
      disabled
    >
      Event Attended
    </button>
  </div>
</template>

<script setup>
import axios from "axios";
import { computed, defineProps, defineEmits } from "vue";
import { RouterLink } from "vue-router";

const props = defineProps({
  event: { type: Object, required: true },
});

const emit = defineEmits(["updated"]);

const now = new Date();

const isPast = computed(() => new Date(props.event.start) < now);
const isUpcoming = computed(() => new Date(props.event.start) > now);

async function handleAction(action) {
  const user = JSON.parse(localStorage.getItem("sessionUser"));
  if (!user) {
    alert("Please log in to perform this action.");
    return;
  }

  if (props.event.userStatus === "attended") return;

  try {
    const res = await axios.post(
      "https://registerorattendevent-5bgqwovi2q-uc.a.run.app",
      {
        eventId: props.event.id,
        uid: user.id,
        email: user.email,
        action,
      },
      { headers: { "Content-Type": "application/json" } }
    );

    if (res.data.success) {
      // eslint-disable-next-line vue/no-mutating-props
      props.event.userStatus = res.data.status;
      emit("updated", { id: props.event.id, status: res.data.status });
      alert(res.data.message);
    } else {
      alert(res.data.message);
    }
  } catch (err) {
    console.error("❌ Event action failed:", err);
    alert("Error performing action. Please try again.");
  }
}
</script>

<style scoped>
button,
a.btn {
  transition: background-color 0.15s ease, transform 0.1s ease-in-out;
}
button:hover:not(:disabled),
a.btn:hover {
  transform: scale(1.02);
}
</style>
