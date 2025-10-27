<template>
  <div>
    <!-- Register Button -->
    <button
      v-if="!event.userStatus"
      class="btn btn-dark btn-sm w-100"
      @click="handleAction('register')"
    >
      Register
    </button>

    <!-- Mark Attendance Button -->
    <button
      v-else-if="event.userStatus === 'registered'"
      class="btn btn-warning btn-sm w-100"
      @click="handleAction('attend')"
    >
      Mark Attendance
    </button>

    <!-- Event Attended -->
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
import { defineProps, defineEmits } from "vue";

// ✅ Props from parent
const props = defineProps({
  event: {
    type: Object,
    required: true,
  },
});

// ✅ Emit event when status changes
const emit = defineEmits(["updated"]);

async function handleAction(type) {
  const user = JSON.parse(localStorage.getItem("sessionUser"));
  if (!user) {
    alert("Please log in to perform this action.");
    return;
  }

  // If already attended, ignore
  if (props.event.userStatus === "attended") return;

  const action = type;
  const payload = {
    eventId: props.event.id,
    uid: user.uid,
    email: user.email,
    action,
  };

  console.log("📤 Sending:", payload);

  try {
    const res = await axios.post(
      "https://registerorattendevent-5bgqwovi2q-uc.a.run.app",
      payload,
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
button {
  transition: background-color 0.15s ease-in-out, transform 0.1s ease-in-out;
}
button:hover {
  transform: scale(1.02);
}
</style>
