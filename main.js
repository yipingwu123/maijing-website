const leadForm = document.querySelector("#leadForm");
const formStatus = document.querySelector("#formStatus");
const siteHeader = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#siteNav");

function setStatus(message, type = "") {
  formStatus.textContent = message;
  formStatus.className = `form-status ${type}`.trim();
}

menuToggle?.addEventListener("click", () => {
  const isOpen = siteHeader?.classList.toggle("is-open") ?? false;
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "关闭导航" : "打开导航");
});

siteNav?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    siteHeader?.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "打开导航");
  }
});

leadForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("");

  const formData = new FormData(leadForm);
  const phone = String(formData.get("phone") || "").trim();
  if (!phone) {
    setStatus("请先填写电话，方便我们联系你。", "error");
    return;
  }

  const city = String(formData.get("city") || "").trim();
  const intent = String(formData.get("intent") || "").trim();
  const problem = String(formData.get("problem") || "").trim();
  const message = [
    city ? `所在城市：${city}` : "",
    intent ? `合作意向：${intent}` : "",
    problem ? `当前问题：${problem}` : ""
  ]
    .filter(Boolean)
    .join("\n");

  const payload = {
    contactName: String(formData.get("contactName") || "").trim(),
    phone,
    company: String(formData.get("company") || "").trim(),
    message,
    source: "maijing-website"
  };

  const submitButton = leadForm.querySelector("button[type='submit']");
  submitButton.disabled = true;
  submitButton.textContent = "提交中...";

  try {
    const response = await fetch("/prod-api/saas/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    setStatus("已收到咨询信息，我们会尽快联系。", "success");
    leadForm.reset();
  } catch (error) {
    setStatus("当前环境暂未连接线索接口，请稍后再试或直接电话联系。", "error");
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = "提交合作咨询 <span>→</span>";
  }
});
