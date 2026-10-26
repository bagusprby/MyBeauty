import "../styles/auth-screen.css";

function root() {
  let el = document.getElementById("auth-screen");
  if (!el) { el = document.createElement("main"); el.id = "auth-screen"; document.body.prepend(el); }
  document.body.classList.add("auth-gated");
  return el;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>\"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

export function hideAuthScreen() {
  document.body.classList.remove("auth-gated");
  document.getElementById("auth-screen")?.remove();
}

export function showLogin({ supabase, signupAllowed, onSuccess }) {
  const el = root();
  el.innerHTML = `
    <section class="auth-card">
      <div class="auth-lace" aria-hidden="true">♡　♡　♡　♡　♡</div>
      <div class="auth-crest">My Glow Up Era</div>
      <h1>Ruang pribadimu</h1>
      <p class="auth-copy">Masuk untuk membuka jurnal dan perjalanan glow up-mu.</p>
      <form id="auth-form">
        <label for="auth-email">Email</label>
        <input id="auth-email" type="email" autocomplete="username" required>
        <label for="auth-password">Kata sandi</label>
        <input id="auth-password" type="password" autocomplete="current-password" required minlength="6">
        <p class="auth-error" id="auth-error" role="alert"></p>
        <button class="auth-primary" type="submit">Masuk ke Diary</button>
      </form>
      ${signupAllowed ? `<button class="auth-secondary" id="auth-signup" type="button">Buat akun pemilik</button>` : ""}
      <small class="auth-privacy">Data pribadi hanya tersedia setelah masuk ke akunmu.</small>
    </section>`;
  const form = el.querySelector("#auth-form");
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const button = form.querySelector("button[type=submit]");
    button.disabled = true; button.textContent = "Memeriksa…";
    const { error } = await supabase.auth.signInWithPassword({
      email: el.querySelector("#auth-email").value.trim(),
      password: el.querySelector("#auth-password").value
    });
    if (error) {
      el.querySelector("#auth-error").textContent = error.message;
      button.disabled = false; button.textContent = "Masuk ke Diary";
      return;
    }
    await onSuccess();
  });
  el.querySelector("#auth-signup")?.addEventListener("click", async event => {
    const button = event.currentTarget;
    button.disabled = true; button.textContent = "Membuat akun…";
    const { error } = await supabase.auth.signUp({
      email: el.querySelector("#auth-email").value.trim(),
      password: el.querySelector("#auth-password").value
    });
    el.querySelector("#auth-error").textContent = error ? error.message : "Periksa email untuk menyelesaikan pendaftaran.";
    button.disabled = false; button.textContent = "Buat akun pemilik";
  });
}

export function showImportChoice({ onImport, onStartFresh }) {
  const el = root();
  el.innerHTML = `
    <section class="auth-card import-card">
      <div class="auth-lace" aria-hidden="true">♡　♡　♡　♡　♡</div>
      <div class="auth-crest">A new chapter</div>
      <h1>Data diary lama ditemukan</h1>
      <p class="auth-copy">Sebelum impor, salinan JSON akan diunduh sebagai cadangan. Data lama di perangkat tetap disimpan sampai kamu menghapusnya sendiri.</p>
      <button class="auth-primary" id="import-old">Impor data lama</button>
      <button class="auth-secondary" id="start-fresh">Mulai lembar baru</button>
      <p class="auth-error" id="import-error" role="alert"></p>
      <small class="auth-privacy">Impor hanya tersedia karena akun ini belum memiliki perjalanan tersimpan.</small>
    </section>`;
  const setBusy = button => { button.disabled = true; button.textContent = "Memindahkan data…"; };
  el.querySelector("#import-old").addEventListener("click", async event => {
    setBusy(event.currentTarget);
    try { await onImport(); }
    catch (error) { el.querySelector("#import-error").textContent = error.message || "Impor gagal. Data lokal tetap tersimpan; coba lagi."; event.currentTarget.disabled = false; event.currentTarget.textContent = "Coba impor lagi"; }
  });
  el.querySelector("#start-fresh").addEventListener("click", async event => {
    setBusy(event.currentTarget);
    try { await onStartFresh(); }
    catch (error) { el.querySelector("#import-error").textContent = error.message || "Belum dapat membuat lembar baru."; event.currentTarget.disabled = false; event.currentTarget.textContent = "Mulai lembar baru"; }
  });
}

export function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportState(state) {
  const date = new Date().toISOString().slice(0, 10);
  downloadJson(`my-glow-up-era-${date}.json`, { format: "glow30_v1", exportedAt: new Date().toISOString(), state });
}
