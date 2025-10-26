<template>
  <div class="container mt-4">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
      <h3 class="text-center text-md-start">Event Metrics (Last 15 Days)</h3>

      <!-- Toggle buttons -->
      <div class="btn-group mx-auto mx-md-0">
        <button
          class="btn btn-outline-danger"
          :class="{ active: selectedMetric === 'overall' }"
          @click="selectedMetric = 'overall'"
        >
          Overall
        </button>
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
const selectedMetric = ref('overall') // default: overall stacked view

onMounted(async () => {
  const res = await fetch('https://getchartdata-5bgqwovi2q-uc.a.run.app')
  const json = await res.json()
  jsonData.value = json.data || []
  renderChart()
})

watch(selectedMetric, renderChart)

function renderChart() {
  if (!jsonData.value.length) return

  const labels = jsonData.value.map(d => d.date)
  const attendance = jsonData.value.map(d => d.totalAttendance)
  const interest = jsonData.value.map(d => d.totalInterest)
  const noShows = interest.map((val, i) => Math.max(val - attendance[i], 0)) // only positive

  if (chartInstance.value) chartInstance.value.destroy()
  const ctx = document.getElementById('attendanceChart').getContext('2d')

  let datasets = []

  if (selectedMetric.value === 'overall') {
    datasets = [
      {
        label: 'Attendance',
        data: attendance,
        backgroundColor: 'rgba(25, 135, 84, 0.85)', // green
        borderColor: '#198754',
        borderWidth: 1,
        stack: 'stack1',
      },
      {
        label: 'No-Shows',
        data: noShows,
        backgroundColor: 'rgba(220, 53, 69, 0.8)', // red
        borderColor: '#dc3545',
        borderWidth: 1,
        stack: 'stack1',
      },
    ]
  } else if (selectedMetric.value === 'attendance') {
    datasets = [
      {
        label: 'Attendance',
        data: attendance,
        backgroundColor: 'rgba(25, 135, 84, 0.85)',
        borderColor: '#198754',
        borderWidth: 1,
      },
    ]
  } else if (selectedMetric.value === 'interest') {
    datasets = [
      {
        label: 'Interest',
        data: interest,
        backgroundColor: 'rgba(255, 193, 7, 0.85)',
        borderColor: '#ffc107',
        borderWidth: 1,
      },
    ]
  }

  chartInstance.value = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: {
          stacked: selectedMetric.value === 'overall',
          title: { display: true, text: 'Date' },
        },
        y: {
          stacked: selectedMetric.value === 'overall',
          beginAtZero: true,
          suggestedMax: Math.max(...interest) + 10,
          title: { display: true, text: 'People Count' },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y}`,
          },
        },
      },
    },
  })
}
</script>
