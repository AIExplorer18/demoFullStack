import "./style.css";

const API_URL = import.meta.env.VITE_API_URL;
console.log("1. Page loaded. API_URL =", API_URL);

const $ = (id) => document.getElementById(id);
const btn = $("btn");
const stage = $("stage");
const packet = $("packet");
const server = $("server");
const counter = $("counter");
const logList = $("log");
const status = $("status");
$("api").textContent = API_URL || "NOT SET (add VITE_API_URL)";

function setStatus(text, isError = false) {
  status.textContent = text;
  status.classList.toggle("is-error", isError);
}

function setCounter(value) {
  counter.textContent = value;
  counter.classList.remove("bump");
  void counter.offsetWidth; // forces a reflow so the animation can restart
  counter.classList.add("bump");
}

// Plays one packet animation and resolves when it ends (with a safety timeout)
function runPacket(cls) {
  return new Promise((resolve) => {
    packet.className = `packet ${cls}`;
    packet.addEventListener("animationend", resolve, { once: true });
    setTimeout(resolve, 900);
  });
}

function addLog({ ok, code, text, ms }) {
  logList.querySelector(".empty")?.remove();
  const li = document.createElement("li");
  li.className = `entry ${ok ? "" : "entry--fail"}`;
  for (const value of [code, "POST /click", text, `${ms} ms`]) {
    const span = document.createElement("span");
    span.textContent = value;
    li.appendChild(span);
  }
  li.firstElementChild.className = "entry__code";
  logList.appendChild(li);                       // CSS shows the newest on top
  while (logList.children.length > 5) logList.firstElementChild.remove();
}

// Ask the backend if it is alive when the page opens
async function checkHealth() {
  try {
    const res = await fetch(`${API_URL}/`);
    const data = await res.json();
    console.log("Health check:", data);
    server.dataset.state = "online";
    $("serverState").textContent = data.database === "connected" ? "Online, database" : "Online, memory";
  } catch (err) {
    console.error("Health check failed:", err);
    server.dataset.state = "offline";
    $("serverState").textContent = "Offline";
  }
}
checkHealth();

btn.addEventListener("click", async () => {
  console.log("2. Button clicked");
  btn.disabled = true;
  btn.textContent = "Waiting for server...";
  stage.classList.add("is-busy");
  setStatus("");

  const t0 = performance.now();
  let ms = 0;

  try {
    console.log("3. Sending POST to:", `${API_URL}/click`);
    const request = fetch(`${API_URL}/click`, { method: "POST" }).then((res) => {
      ms = Math.round(performance.now() - t0);
      return res;
    });

    // Packet travels to the server while the real request is in flight
    const [res] = await Promise.all([request, runPacket("is-sending")]);
    console.log("4. Response status:", res.status);
    if (!res.ok) throw new Error(`Server answered ${res.status}`);

    server.classList.add("is-receiving");
    const data = await res.json();
    console.log("5. Data from backend:", data);

    await runPacket("is-replying");
    setCounter(data.total);
    addLog({ ok: true, code: res.status, text: `total ${data.total}`, ms });
  } catch (err) {
    console.error("ERROR: could not reach backend:", err);
    addLog({ ok: false, code: "ERR", text: "no response", ms: Math.round(performance.now() - t0) });
    setStatus("The request failed. Check that VITE_API_URL points to your backend and that FRONTEND_URL allows this site.", true);
  } finally {
    stage.classList.remove("is-busy");
    server.classList.remove("is-receiving");
    packet.className = "packet";
    btn.disabled = false;
    btn.textContent = "Send request";
    console.log("6. Done");
  }
});