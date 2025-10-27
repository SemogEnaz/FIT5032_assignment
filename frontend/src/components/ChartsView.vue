<template>
  <div class="container mt-4 chart-container">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
      <h3 class="text-center text-md-start mb-0">Event Metrics</h3>
      <p class="text-center">Attendance and interest by users for last 5 and upcoming 5 events including today</p>

      <div class="btn-group mx-auto mx-md-0 d-flex">
        <button
          class="btn btn-outline-primary"
          :class="{ active: selectedMetric === 'overall' }"
          @click="changeMetric('overall')"
        >
          Overall
        </button>
        <button
          class="btn btn-outline-success"
          :class="{ active: selectedMetric === 'attendance' }"
          @click="changeMetric('attendance')"
        >
          Attendance
        </button>
        <button
          class="btn btn-outline-warning"
          :class="{ active: selectedMetric === 'interest' }"
          @click="changeMetric('interest')"
        >
          Interest
        </button>
      </div>
    </div>

    <canvas id="attendanceChart"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const chartInstance = ref(null)
const jsonData = ref([])
const selectedMetric = ref('overall') // default metric

onMounted(async () => {
  const res = await fetch('https://getchartdata-5bgqwovi2q-uc.a.run.app')
  const json = await res.json()
  jsonData.value = json.data || []
  renderChart() // initial render
})

function changeMetric(metric) {
  selectedMetric.value = metric
  renderChart() // re-render each time a toggle is clicked
}

function renderChart() {
  if (!jsonData.value.length) return

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const labels = jsonData.value.map(d => d.date)
  const attendance = jsonData.value.map(d => d.totalAttendance)
  const interest = jsonData.value.map(d => d.totalInterest)
  const eventDates = jsonData.value.map(d => new Date(d.date))
  const noShows = interest.map((val, i) => Math.max(val - attendance[i], 0))

  // Destroy old chart
  if (chartInstance.value) {
    chartInstance.value.destroy()
    chartInstance.value = null
  }

  const ctx = document.getElementById('attendanceChart').getContext('2d')
  const datasets = []

  if (selectedMetric.value === 'overall') {
    const pastIndices = eventDates.map((date, i) => (date < today ? i : null)).filter(i => i !== null)
    const futureIndices = eventDates.map((date, i) => (date >= today ? i : null)).filter(i => i !== null)

    const pastAttendance = eventDates.map((_, i) => (pastIndices.includes(i) ? attendance[i] : 0))
    const pastNoShows = eventDates.map((_, i) => (pastIndices.includes(i) ? noShows[i] : 0))
    const futureInterest = eventDates.map((_, i) => (futureIndices.includes(i) ? interest[i] : 0))


    datasets.push(
      {
        label: 'Attendance',
        data: pastAttendance,
        backgroundColor: 'rgba(25, 135, 84, 0.85)', // green
        borderColor: '#198754',
        borderWidth: 1,
        stack: 'stack1',
      },
      {
        label: 'No-Shows',
        data: pastNoShows,
        backgroundColor: 'rgba(220, 53, 69, 0.8)', // red
        borderColor: '#dc3545',
        borderWidth: 1,
        stack: 'stack1',
      },
      {
        label: 'Interest (Upcoming)',
        data: futureInterest,
        backgroundColor: 'rgba(255, 193, 7, 0.85)', // yellow
        borderColor: '#ffc107',
        borderWidth: 1,
        stack: 'stack1',
      }
    )
  }

  if (selectedMetric.value === 'attendance') {
    const filteredAttendance = eventDates.map((date, i) => (date < today ? attendance[i] : 0))
    datasets.push({
      label: 'Attendance',
      data: filteredAttendance,
      backgroundColor: 'rgba(25, 135, 84, 0.85)',
      borderColor: '#198754',
      borderWidth: 1,
    })
  }

  if (selectedMetric.value === 'interest') {
    const filteredInterest = eventDates.map((date, i) => interest[i])
    datasets.push({
      label: 'Interest',
      data: filteredInterest,
      backgroundColor: 'rgba(255, 193, 7, 0.85)',
      borderColor: '#ffc107',
      borderWidth: 1,
    })
  }

  // Build new chart
  chartInstance.value = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
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

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 300px; /* default height */
}

@media (max-width: 576px) {
  .chart-container {
    min-height: 300px; /* phone screens */
  }
}

</style>
