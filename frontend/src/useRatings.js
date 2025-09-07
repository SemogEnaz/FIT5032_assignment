// src/composables/useRatings.js
import { ref } from 'vue'

const STORAGE_KEY = 'ratings_v1'  // { [itemId]: { ratings: { [email]: number } } }

function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    localStorage.setItem(STORAGE_KEY, '{}')
    return {}
  }
}
function saveStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

const storeRef = ref(loadStore())

export function useRatings() {
  function getUserEmailFromSession() {
    try {
      const u = JSON.parse(localStorage.getItem('sessionUser') || 'null')
      return u?.email || null
    } catch { return null }
  }
  function isLoggedIn() {
    return document.cookie.includes('loginSuccess=true') && !!getUserEmailFromSession()
  }

  function getStats(itemId) {
    const entry = storeRef.value[itemId] || { ratings: {} }
    const values = Object.values(entry.ratings)
    const count = values.length
    const avg = count ? values.reduce((a, b) => a + b, 0) / count : 0
    return { avg, count }
  }

  function getUserRating(itemId) {
    const email = getUserEmailFromSession()
    if (!email) return 0
    const entry = storeRef.value[itemId] || { ratings: {} }
    return Number(entry.ratings[email] || 0)
  }

  function setUserRating(itemId, value) {
    if (!isLoggedIn()) {
      throw new Error('Not authenticated')
    }
    const email = getUserEmailFromSession()
    if (!email) throw new Error('Missing user')

    const next = { ...storeRef.value }
    next[itemId] = next[itemId] || { ratings: {} }
    next[itemId].ratings[email] = Number(value)

    storeRef.value = next
    saveStore(next)
    return getStats(itemId)
  }

  // Admin helper (optional): wipe ratings for item
  function resetItem(itemId) {
    const next = { ...storeRef.value }
    if (next[itemId]) next[itemId].ratings = {}
    storeRef.value = next
    saveStore(next)
  }

  return { getStats, getUserRating, setUserRating, resetItem, isLoggedIn }
}
