<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h3>Event Metrics (Last 15 Days)</h3>

      <!-- 👇 Toggle buttons -->
      <div class="btn-group">
        <button
          class="btn btn-outline-success"
          :class="{ active: selectedMetric === 'attendance' }"
          @click="selectedMetric = 'attendance'"
        >
          Attendance
        </button>
        <button
          class="btn btn-outline-warning"
          :class="{ active: selectedMetric === 'interest' }"
          @click="selectedMetric = 'interest'"
        >
          Interest
        </button>
      </div>
    </div>

    <canvas id="attendanceChart"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const chartInstance = ref(null)
const jsonData = ref([])
const selectedMetric = ref('attendance') // 👈 default metric

onMounted(async () => {
  const res = await fetch('https://getchartdata-5bgqwovi2q-uc.a.run.app')
  const json = await res.json()
  jsonData.value = json.data || []
  console.log(json.data)
  renderChart()
})

// 👇 Watch toggle changes and re-render chart
watch(selectedMetric, renderChart)

function renderChart() {
  if (!jsonData.value.length) return

  const labels = jsonData.value.map(d => d.date)
  const values =
    selectedMetric.value === 'attendance'
      ? jsonData.value.map(d => d.totalAttendance)
      : jsonData.value.map(d => d.totalInterest)

  // Destroy previous chart
  if (chartInstance.value) chartInstance.value.destroy()

  const ctx = document.getElementById('attendanceChart').getContext('2d')

  const color =
    selectedMetric.value === 'attendance'
      ? 'rgba(25, 135, 84, 0.7)' // green
      : 'rgba(255, 193, 7, 0.7)' // yellow

  chartInstance.value = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: selectedMetric.value === 'attendance' ? 'Attendance' : 'Interest',
          data: values,
          backgroundColor: color,
          borderColor: selectedMetric.value === 'attendance' ? '#198754' : '#ffc107',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 50,
          ticks: { stepSize: 2 },
          title: { display: true, text: 'Total' },
        },
        x: {
          title: { display: true, text: 'Date' },
        },
      },
    },
  })
}
</script>
