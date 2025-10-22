<template>
  <div class="container mt-4">
    <h3>Event Attendance (Last 15 Days)</h3>
    <canvas id="attendanceChart"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const chartInstance = ref(null)

onMounted(async () => {
  const res = await fetch('https://us-central1-fit5032-week6-da697.cloudfunctions.net/getRecentAttendance')
  const json = await res.json()
  console.log(json.data) // ✅ confirmed working

  const labels = json.data.map(d => d.date)
  const values = json.data.map(d => d.totalAttendance)

  // Destroy old chart (for hot reload)
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }

  const ctx = document.getElementById('attendanceChart').getContext('2d')
  chartInstance.value = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Attendance',
          data: values,
          backgroundColor: 'rgba(13, 110, 253, 0.7)', // Bootstrap primary blue
          borderColor: '#0d6efd',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 50, // 👈 your requested max
          ticks: { stepSize: 2 }, // 👈 increments of 2
          title: { display: true, text: 'Total Attendance' },
        },
        x: {
          title: { display: true, text: 'Date' },
        },
      },
    },
  })
})
</script>
