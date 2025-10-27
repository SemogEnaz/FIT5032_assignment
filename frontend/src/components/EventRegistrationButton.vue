<template>
  <div>
    <!-- 🔒 Event in the past & not registered -->
        <button
      v-if="isPast && !event.userStatus"
      class="btn btn-secondary btn-sm w-100"
      disabled
      title="Registration closed for past events"
    >
      Event Closed
    </button>


    <!-- 🕒 Not registered yet -->
    <button
      v-else-if="!event.userStatus"
      class="btn btn-dark btn-sm w-100"
      @click="handleAction('register')"
    >
      Register
    </button>

    <!-- 🟡 Registered but not attended -->
    <button
      v-else-if="event.userStatus === 'registered'"
      class="btn btn-warning btn-sm w-100"
      @click="handleAction('attend')"
    >
      Mark Attendance
    </button>

    <!-- 🟢 Attended -->
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

const props = defineProps({
  event: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["updated"]);

// ✅ Determine if event date has passed
const isPast = computed(() => {
  const now = new Date();
  const eventDate = new Date(props.event.start);
  return eventDate < now;
});

async function handleAction(action) {
  const user = JSON.parse(localStorage.getItem("sessionUser"));
  if (!user) {
    alert("Please log in to perform this action.");
    return;
  }

  // prevent marking attendance twice
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
button {
  transition: transform 0.1s ease-in-out, background-color 0.15s ease-in-out;
}
button:hover:not(:disabled) {
  transform: scale(1.02);
}
</style>
