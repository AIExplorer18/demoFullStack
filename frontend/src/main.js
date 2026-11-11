const API_URL = import.meta.env.VITE_API_URL;
console.log("1. Page loaded. API_URL =", API_URL);

const btn = document.getElementById("btn");
const status = document.getElementById("status");
document.getElementById("api").textContent = "API: " + (API_URL || "NOT SET");

btn.addEventListener("click", async () => {
  console.log("2. Button clicked");
  btn.disabled = true;
  status.textContent = "Calling backend...";
  try {
    console.log("3. Sending POST to:", `${API_URL}/click`);
    const res = await fetch(`${API_URL}/click`, { method: "POST" });
    console.log("4. Response status:", res.status);

    const data = await res.json();
    console.log("5. Data from backend:", data);

    status.textContent = `${data.message} Total clicks: ${data.total}`;
  } catch (err) {
    console.error("ERROR: could not reach backend:", err);
    status.textContent = "Error: could not reach backend (check API URL / CORS)";
  } finally {
    btn.disabled = false;
    console.log("6. Done");
  }
});