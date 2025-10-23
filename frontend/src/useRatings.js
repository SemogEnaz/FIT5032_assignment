// src/composables/useRatings.js
import axios from "axios";

export function useRatings() {
  async function setUserRating(eventId, rating) {
    const res = await axios.post("https://rateevent-5bgqwovi2q-uc.a.run.app", {
      eventId,
      rating,
    });
    return res.data; // { success, avgRating, ratingCount }
  }

  function isLoggedIn() {
    return !!localStorage.getItem("sessionUser");
  }

  return { setUserRating, isLoggedIn };
}
