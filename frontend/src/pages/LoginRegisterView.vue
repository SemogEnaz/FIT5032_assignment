<template>
  <main class="container py-4" style="max-width:760px;">
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

      <button class="btn btn-dark">Login</button>
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

      <button class="btn btn-dark mt-3">Create account</button>
    </form>
  </main>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

/* -------------------- state -------------------- */
const isLogin = ref(true)

// login form state
const login = ref({ email: '', password: '' })
const loginError = ref('')

/* -------------------- ADMIN SEED -------------------- */
const ADMIN_USER = {
  id: 'admin',
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@claytonpool.local',
  password: 'Admin#123',     // demo only
  address: '',
  phone: '',
  role: 'admin'
};

// ensure admin exists once in localStorage
(function ensureAdminSeed(){
  const list = JSON.parse(localStorage.getItem('users') || '[]');
  if (!list.some(u => u.email.toLowerCase() === ADMIN_USER.email.toLowerCase())) {
    list.push(ADMIN_USER);
    localStorage.setItem('users', JSON.stringify(list));
  }
})();

// register form state
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

// common errors
const errors = ref({
  userName: null,
  password: null,
  email: null,
  confirmPassword: null,
})

/* -------------------- validators -------------------- */
// name (first name) ≥ 3 chars
const validateName = (blur) => {
  const name = register.value.firstName?.trim() || ''
  if (name.length < 3) {
    if (blur) errors.value.userName = 'Name must be at least 3 characters'
  } else {
    errors.value.userName = null
  }
}

// password: upper, lower, number, special
const validatePassword = (blur) => {
  const p = register.value.password || ''
  const minLen = 8
  const hasUpper = /[A-Z]/.test(p)
  const hasLower = /[a-z]/.test(p)
  const hasNum   = /\d/.test(p)
  const hasSpec  = /[!@#$%^&*()\-_=+[\]{};:'",.<>/?\\|`~]/.test(p)
  if (p.length < minLen) { if (blur) errors.value.password = `Password must be at least ${minLen} characters.` }
  else if (!hasUpper)    { if (blur) errors.value.password = 'Include at least one uppercase letter.' }
  else if (!hasLower)    { if (blur) errors.value.password = 'Include at least one lowercase letter.' }
  else if (!hasNum)      { if (blur) errors.value.password = 'Include at least one number.' }
  else if (!hasSpec)     { if (blur) errors.value.password = 'Include at least one special character.' }
  else { errors.value.password = null }
}

const validateEmail = (blur) => {
  const email = register.value.email?.trim() || ''
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
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

// login email validator
const validateLoginEmail = (blur) => {
  const email = login.value.email?.trim() || ''
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
  if (!email) { if (blur) errors.value.loginEmail = 'Email is required.' }
  else if (!pattern.test(email)) { if (blur) errors.value.loginEmail = 'Enter a valid email address.' }
  else { errors.value.loginEmail = null }
}

/* -------------------- cookie utils -------------------- */
function setCookie(name, value, maxAgeSeconds = 60 * 60 * 24 * 7) { // 7 days
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`
}

/* -------------------- storage helpers -------------------- */
function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '[]')
}
function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users))
}
function setSessionUser(user) {
  localStorage.setItem('sessionUser', JSON.stringify(user))
  setCookie('sessionUser', user.email)            // identifies who is logged in (demo)
  setCookie('loginSuccess', 'true')               // requirement: login success token
}

/* -------------------- submit handlers -------------------- */
function submitLogin() {
  loginError.value = '';
  validateLoginEmail(true);
  if (errors.value.loginEmail) return;

  // 1) Hard-coded admin short-circuit
  if (
    login.value.email.toLowerCase() === ADMIN_USER.email.toLowerCase() &&
    login.value.password === ADMIN_USER.password
  ) {
    setSessionUser(ADMIN_USER);                           // sets cookies + session
    window.dispatchEvent(new StorageEvent('storage', { key: 'sessionUser' }));
    router.push('/');                                     // go home
    return;
  }

  // 2) Normal member login
  const users = getUsers();
  const found = users.find(u => u.email.toLowerCase() === login.value.email.toLowerCase());

  if (!found) { loginError.value = 'Account does not exist — please register.'; return; }
  if (found.password !== login.value.password) { loginError.value = 'Invalid email or password.'; return; }

  // If someone manually edited storage, force admin role on admin email
  if (found.email.toLowerCase() === ADMIN_USER.email.toLowerCase()) found.role = 'admin';

  setSessionUser(found);
  window.dispatchEvent(new StorageEvent('storage', { key: 'sessionUser' }));
  router.push('/');
}

function submitRegister() {
  registerError.value = ''
  // validate required register fields
  validateName(true)
  validateEmail(true)
  validatePassword(true)
  validateConfirmPassword(true)

  if (errors.value.userName || errors.value.email || errors.value.password || errors.value.confirmPassword || !isPasswordsMatch.value) return

    if (register.value.email.toLowerCase() === ADMIN_USER.email.toLowerCase()) {
    registerError.value = 'This email is reserved for the administrator.';
    return;
    }


  const users = getUsers();
  if (users.find(u => u.email === register.value.email)) {
    registerError.value = 'Email is already registered.'
    return;
  }

  const newUser = {
    id: crypto.randomUUID?.() || String(Date.now()),
    firstName: register.value.firstName,
    lastName: register.value.lastName,
    email: register.value.email,
    password: register.value.password, // demo only — don’t store plaintext in real apps
    address: register.value.address || '',
    phone: register.value.phone || '',
    role: register.value.role || 'member'
  }

  console.log('User Created')

  users.push(newUser)

    console.log('User Added to list')

  saveUsers(users)
    console.log('User Saved to db')

  setSessionUser(newUser) // logs in immediately + sets loginSuccess cookie
  registerError.value = ''
  isLogin.value = true    // optional: flip back to login UI

  window.dispatchEvent(new StorageEvent('storage', { key: 'sessionUser' }))
  router.push('/')

}

/* -------------------- UI helpers -------------------- */
function toggleMode() {
  isLogin.value = !isLogin.value
  // clear any error flashes when switching
  loginError.value = ''
  registerError.value = ''
}
</script>

