<template>
  <main class="container py-4" style="max-width:500px;">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1 class="h4 m-0">{{ isLogin ? 'Login' : 'Register' }}</h1>
      <button class="btn btn-outline-secondary btn-sm" @click="toggleMode">
        Switch to {{ isLogin ? 'Register' : 'Login' }}
      </button>
    </div>

    <!-- LOGIN -->
    <form v-if="isLogin" @submit.prevent="submitLogin" class="card p-4 shadow-sm d-flex">
      <p class="text-muted mb-3">Welcome back! Please enter your email and password.</p>

      <div class="mb-3">
        <label class="form-label">Email</label>
        <input
          type="email"
          class="form-control"
          v-model.trim="login.email"
          @blur="validateLoginEmail(true)"
          @input="validateLoginEmail(false)"
          required
        />
        <div v-if="errors.loginEmail" class="text-danger small">{{ errors.loginEmail }}</div>
      </div>

      <div class="mb-3">
        <label class="form-label">Password</label>
        <input
          type="password"
          class="form-control"
          v-model="login.password"
          minlength="8"
          required
        />
      </div>

      <div v-if="loginError" class="alert alert-danger py-2" role="alert">
        {{ loginError }}
      </div>

      <button class="btn btn-dark" :disabled="busy">{{ busy ? 'Signing in…' : 'Login' }}</button>
    </form>

    <!-- REGISTER -->
    <form v-else @submit.prevent="submitRegister" class="card p-4 shadow-sm d-flex">
      <p class="text-muted mb-3">Create your member account (address & phone optional).</p>

      <div class="row g-3">
        <div class="col-12 col-md-6">
          <label class="form-label">First Name</label>
          <input
            type="text"
            class="form-control"
            v-model.trim="register.firstName"
            @blur="validateName(true)"
            @input="validateName(false)"
            required
            minlength="3"
          />
          <div v-if="errors.userName" class="text-danger small">{{ errors.userName }}</div>
        </div>

        <div class="col-12 col-md-6">
          <label class="form-label">Last Name</label>
          <input
            type="text"
            class="form-control"
            v-model.trim="register.lastName"
            required
          />
        </div>

        <div class="col-12">
          <label class="form-label">Email</label>
          <input
            type="email"
            class="form-control"
            v-model.trim="register.email"
            @blur="validateEmail(true)"
            @input="validateEmail(false)"
            required
          />
          <div v-if="errors.email" class="text-danger small">{{ errors.email }}</div>
        </div>

        <div class="col-12 col-md-6">
          <label class="form-label">Password</label>
          <input
            type="password"
            class="form-control"
            v-model="register.password"
            @blur="validatePassword(true)"
            @input="validatePassword(false)"
            minlength="8"
            maxlength="64"
            required
          />
          <div v-if="errors.password" class="text-danger small">{{ errors.password }}</div>
          <div class="form-text">8+ chars incl. upper, lower, number, special.</div>
        </div>

        <div class="col-12 col-md-6">
          <label class="form-label">Confirm Password</label>
          <input
            type="password"
            class="form-control"
            v-model="register.confirmPassword"
            @blur="validateConfirmPassword(true)"
            @input="validateConfirmPassword(false)"
            required
          />
          <div v-if="!isPasswordsMatch" class="text-danger small">Passwords do not match.</div>
          <div v-if="errors.confirmPassword" class="text-danger small">{{ errors.confirmPassword }}</div>
        </div>

        <div class="col-12">
          <label class="form-label">Address <span class="text-muted">(optional)</span></label>
          <input type="text" class="form-control" v-model.trim="register.address" />
        </div>

        <div class="col-12 col-md-6">
          <label class="form-label">Phone <span class="text-muted">(optional)</span></label>
          <input type="tel" class="form-control" v-model.trim="register.phone" placeholder="04xx xxx xxx" />
        </div>
      </div>

      <div v-if="registerError" class="alert alert-danger py-2 mt-3" role="alert">
        {{ registerError }}
      </div>

      <button class="btn btn-dark mt-3" :disabled="busy">{{ busy ? 'Creating…' : 'Create account' }}</button>
    </form>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// 🔥 Firebase Auth
import { getAuth, setPersistence, browserLocalPersistence, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, updateProfile } from 'firebase/auth'
// make sure your firebase app is initialized once (e.g., in src/firebase/init.js)
const auth = getAuth()

const router = useRouter()

/* -------------------- state -------------------- */
const isLogin = ref(true)
const busy = ref(false)

// login form
const login = ref({ email: '', password: '' })
const loginError = ref('')

// register form
const register = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  address: '',
  phone: '',
  role: 'member',
})
const registerError = ref('')

// admin seed (kept for dev convenience)
const ADMIN_USER = {
  id: 'admin',
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@claytonpool.local',
  password: 'Admin#123',
  address: '',
  phone: '',
  role: 'admin'
}

// ensure admin exists once in localStorage
;(function ensureAdminSeed(){
  const list = JSON.parse(localStorage.getItem('users') || '[]');
  if (!list.some(u => u.email?.toLowerCase() === ADMIN_USER.email.toLowerCase())) {
    list.push(ADMIN_USER);
    localStorage.setItem('users', JSON.stringify(list));
  }
})()

/* -------------------- validators -------------------- */
const errors = ref({
  userName: null,
  password: null,
  email: null,
  confirmPassword: null,
  loginEmail: null,
})

const validateName = (blur) => {
  const name = register.value.firstName?.trim() || ''
  if (name.length < 3) { if (blur) errors.value.userName = 'Name must be at least 3 characters' }
  else { errors.value.userName = null }
}
const validatePassword = (blur) => {
  const p = register.value.password || ''
  const minLen = 8
  const hasUpper = /[A-Z]/.test(p)
  const hasLower = /[a-z]/.test(p)
  const hasNum   = /\d/.test(p)
  const hasSpec  = /[!@#$%^&*()\-_=+[\]{};:'",.<>/?\\|`~]/.test(p)
  if (p.length < minLen) { if (blur) errors.value.password = `Password must be at least ${minLen} characters.` }
  else if (!hasUpper) { if (blur) errors.value.password = 'Include at least one uppercase letter.' }
  else if (!hasLower) { if (blur) errors.value.password = 'Include at least one lowercase letter.' }
  else if (!hasNum) { if (blur) errors.value.password = 'Include at least one number.' }
  else if (!hasSpec) { if (blur) errors.value.password = 'Include at least one special character.' }
  else { errors.value.password = null }
}


const validateEmail = async (blur) => {
  const email = register.value.email?.trim() || ''
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  // // Check firestore for existing user
  // const response = await fetch('https://<your-region>-<your-project-id>.cloudfunctions.net/checkEmailExists', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email: register.value.email }),
  // });

  // const data = await response.json();

  // if (data.exists) {
  //   errors.value.email = 'This email is already in use.';
  //   return;
  // }

  if (!email) { if (blur) errors.value.email = 'Email is required.' }
  else if (!pattern.test(email)) { if (blur) errors.value.email = 'Please enter a valid email address.' }

  else { errors.value.email = null }
}
const validateConfirmPassword = (blur) => {
  const pwd = register.value.password || ''
  const confirm = register.value.confirmPassword || ''
  if (!confirm) { if (blur) errors.value.confirmPassword = 'Please confirm your password.' }
  else if (pwd !== confirm) { if (blur) errors.value.confirmPassword = 'Passwords do not match.' }
  else { errors.value.confirmPassword = null }
}
const isPasswordsMatch = computed(() =>
  register.value.confirmPassword === '' ||
  register.value.password === register.value.confirmPassword
)
const validateLoginEmail = (blur) => {
  const email = login.value.email?.trim() || ''
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
  if (!email) { if (blur) errors.value.loginEmail = 'Email is required.' }
  else if (!pattern.test(email)) { if (blur) errors.value.loginEmail = 'Enter a valid email address.' }
  else { errors.value.loginEmail = null }
}

/* -------------------- cookie + storage helpers -------------------- */
function setCookie(name, value, maxAgeSeconds = 60 * 60 * 24 * 7) {
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`
}
function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '[]')
}
async function saveUsers(user) {
  console.log("📦 Sending user:", user);

  try {
    const res = await fetch("https://createuser-5bgqwovi2q-uc.a.run.app", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: user.uid,
        firstName: register.value.firstName,
        lastName: register.value.lastName,
        email: user.email,
        address: register.value.address,
        phone: register.value.phone,
        role: "member",
      }),
    });

    // Print raw response
    const text = await res.text();
    console.log("🛰️ Response status:", res.status);
    console.log("🛰️ Response body:", text);

    if (!res.ok) {
      throw new Error(`Backend returned ${res.status}: ${text}`);
    }

    try {
      return JSON.parse(text); // if it's JSON
    } catch {
      return text; // fallback to plain text
    }
  } catch (e) {
    console.error("❌ Error adding new registration to database:", e);
    throw e;
  }
}

  
function setSessionUser(user) {
  localStorage.setItem('sessionUser', JSON.stringify(user))
  setCookie('sessionUser', user.email)
  setCookie('loginSuccess', 'true')
}

/* -------------------- submit: LOGIN (Firebase + local session) -------------------- */
async function submitLogin() {
  loginError.value = ''
  validateLoginEmail(true)
  if (errors.value.loginEmail) return

  // dev admin bypass (still allowed)
  if (
    login.value.email.toLowerCase() === ADMIN_USER.email.toLowerCase() &&
    login.value.password === ADMIN_USER.password
  ) {
    setSessionUser(ADMIN_USER)
    window.dispatchEvent(new StorageEvent('storage', { key: 'sessionUser' }))
    router.push('/')
    return
  }

  try {
    busy.value = true
    await setPersistence(auth, browserLocalPersistence) // Firebase persistence
    const cred = await signInWithEmailAndPassword(auth, login.value.email, login.value.password)

    // Ensure a local profile exists (create minimal if missing)
    const users = getUsers()
    let profile = users.find(u => u.email.toLowerCase() === cred.user.email.toLowerCase())
    if (!profile) {
      profile = {
        id: cred.user.uid,
        firstName: cred.user.displayName?.split(' ')?.[0] || '',
        lastName: cred.user.displayName?.split(' ')?.slice(1).join(' ') || '',
        email: cred.user.email,
        password: '', // do NOT store firebase password; left blank in local profile
        address: '',
        phone: '',
        role: (cred.user.email.toLowerCase() === ADMIN_USER.email.toLowerCase()) ? 'admin' : 'member'
      }
      users.push(profile)
      saveUsers(users)
    } else {
      // ensure admin role if email matches admin
      if (profile.email.toLowerCase() === ADMIN_USER.email.toLowerCase()) profile.role = 'admin'
    }

    setSessionUser(profile)
    window.dispatchEvent(new StorageEvent('storage', { key: 'sessionUser' }))
    router.push('/')
  } catch (e) {
    // Friendly Firebase error messages
    const map = {
      'auth/invalid-email': 'Invalid email address.',
      'auth/user-not-found': 'Account does not exist — please register.',
      'auth/wrong-password': 'Invalid email or password.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.'
    }
    loginError.value = map[e.code] || 'Login failed. Please try again.'
  } finally {
    busy.value = false
  }
}

/* -------------------- submit: REGISTER (Firebase + local profile + session) -------------------- */
async function submitRegister() {
  registerError.value = ''
  validateName(true); await validateEmail(true); validatePassword(true); validateConfirmPassword(true)
  if (errors.value.userName || errors.value.email || errors.value.password || errors.value.confirmPassword || !isPasswordsMatch.value) return

  // prevent using reserved admin email
  if (register.value.email.toLowerCase() === ADMIN_USER.email.toLowerCase()) {
    registerError.value = 'This email is reserved for the administrator.'
    return
  }

  try {
    busy.value = true
    await setPersistence(auth, browserLocalPersistence)
    const cred = await createUserWithEmailAndPassword(auth, register.value.email, register.value.password)

    // Optional: set displayName in Firebase
    const displayName = `${register.value.firstName} ${register.value.lastName}`.trim()
    if (displayName) { try { await updateProfile(cred.user, { displayName }) } catch { /* empty */ } }

    // also persist a local profile with the extra fields your app uses
    const newUser = {
      uid: cred.user.uid,
      firstName: register.value.firstName,
      lastName: register.value.lastName,
      email: cred.user.email,
      password: '', // never store Firebase password locally
      address: register.value.address || '',
      phone: register.value.phone || '',
      role: register.value.role || 'member'
    }

    await saveUsers(newUser);

    setSessionUser(newUser) // immediate login
    
    isLogin.value = true
    window.dispatchEvent(new StorageEvent('storage', { key: 'sessionUser' }))
    router.push('/')
  } catch (e) {
    const map = {
      'auth/email-already-in-use': 'Email is already registered.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/weak-password': 'Password is too weak.',
      'auth/operation-not-allowed': 'Registration temporarily disabled.'
    }
    registerError.value = map[e.code] || 'Registration failed. Please try again.'
  } finally {
    busy.value = false
  }
}

/* -------------------- keep UI in sync with Firebase session -------------------- */
onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (!user) return
    // if a Firebase session exists but local session is missing (e.g., refresh), reconstruct it
    const users = getUsers()
    let profile = users.find(u => u.email?.toLowerCase() === user.email?.toLowerCase())
    if (!profile) {
      profile = {
        id: user.uid,
        firstName: user.displayName?.split(' ')?.[0] || '',
        lastName: user.displayName?.split(' ')?.slice(1).join(' ') || '',
        email: user.email,
        password: '',
        address: '',
        phone: '',
        role: (user.email?.toLowerCase() === ADMIN_USER.email.toLowerCase()) ? 'admin' : 'member'
      }
      users.push(profile); saveUsers(users)
    }
    setSessionUser(profile)
  })
})

/* -------------------- UI helpers -------------------- */
function toggleMode() {
  isLogin.value = !isLogin.value
  loginError.value = ''
  registerError.value = ''
}
</script>
