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

export function showBootFailure(error) {
  const el = root();
  const detail = escapeHtml(error?.stack || error?.message || String(error));
  el.innerHTML = `<section class="auth-card"><div class="auth-lace" aria-hidden="true">♡　♡　♡　♡　♡</div><div class="auth-crest">My Glow Up Era</div><h1>Diary belum dapat dibuka</h1><p class="auth-copy">Aplikasi berhenti saat menyiapkan ruang pribadimu. Rincian ini membantu menemukan penyebabnya.</p><details open><summary>Detail teknis</summary><pre class="auth-diagnostic">${detail}</pre></details><button class="auth-primary" type="button" onclick="location.reload()">Coba lagi</button></section>`;
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email: el.querySelector("#auth-email").value.trim(),
      password: el.querySelector("#auth-password").value
    });
    if (error) {
      el.querySelector("#auth-error").textContent = error.message;
      button.disabled = false; button.textContent = "Masuk ke Diary";
      return;
    }
    button.textContent = "Menyiapkan diary…";
    try {
      await onSuccess(data.user);
    } catch (failure) {
      el.querySelector("#auth-error").textContent = failure?.message || "Diary belum dapat dibuka. Coba lagi.";
      button.disabled = false;
      button.textContent = "Coba buka diary lagi";
    }
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

export function showImportChoice({ onImport, onStartFresh, hasLocalBackup = true }) {
  const el = root();
  el.innerHTML = `
    <section class="auth-card import-card">
      <div class="auth-lace" aria-hidden="true">♡　♡　♡　♡　♡</div>
      <div class="auth-crest">A new chapter</div>
      <h1>${hasLocalBackup ? "Data diary lama ditemukan" : "Mulai perjalananmu"}</h1>
      <p class="auth-copy">${hasLocalBackup ? "Sebelum impor, salinan JSON akan diunduh sebagai cadangan. Data lama di perangkat tetap disimpan sampai kamu menghapusnya sendiri." : "Impor file cadangan dari aplikasi lama, atau mulai dengan lembar kosong."}</p>
      <button class="auth-primary" id="import-old">${hasLocalBackup ? "Impor data lama" : "Pilih file cadangan JSON"}</button>
      <input id="legacy-json-file" type="file" accept=".json,application/json" hidden>
      <button class="auth-secondary" id="start-fresh">Mulai lembar baru</button>
      <p class="auth-error" id="import-error" role="alert"></p>
      <small class="auth-privacy">Impor hanya tersedia karena akun ini belum memiliki data tersimpan.</small>
    </section>`;
  const setBusy = button => { button.disabled = true; button.textContent = "Memindahkan data…"; };
  el.querySelector("#import-old").addEventListener("click", async event => {
    if (!hasLocalBackup) { el.querySelector("#legacy-json-file").click(); return; }
    setBusy(event.currentTarget);
    try { await onImport(); }
    catch (error) { el.querySelector("#import-error").textContent = error.message || "Impor gagal. Data lokal tetap tersimpan; coba lagi."; event.currentTarget.disabled = false; event.currentTarget.textContent = "Coba impor lagi"; }
  });
  el.querySelector("#legacy-json-file").addEventListener("change", async event => {
    const file = event.currentTarget.files?.[0]; if (!file) return;
    const button = el.querySelector("#import-old"); setBusy(button);
    try {
      const parsed = JSON.parse(await file.text());
      const state = parsed?.state && typeof parsed.state === "object" ? parsed.state : parsed;
      if (!state || typeof state !== "object" || !("start" in state) || !("done" in state)) throw new Error("File bukan cadangan My Glow Up Era yang dikenali.");
      await onImport(state);
    } catch (error) {
      el.querySelector("#import-error").textContent = error.message || "Impor gagal. File lokal tetap aman; coba lagi.";
      button.disabled = false; button.textContent = "Coba impor file lagi";
    }
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
