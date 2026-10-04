const form = document.querySelector('#diagnosticForm');
const textarea = document.querySelector('#jobDescription');
const charCount = document.querySelector('#charCount');
const submitButton = document.querySelector('#submitButton');
const states = ['emptyState', 'loadingState', 'errorState', 'refusalState', 'resultState'];

let visitorId = localStorage.getItem('switchproof_visitor_id');
if (!visitorId) {
  visitorId = crypto.randomUUID();
  localStorage.setItem('switchproof_visitor_id', visitorId);
}

function showState(id) {
  states.forEach((state) => document.querySelector(`#${state}`).classList.toggle('hidden', state !== id));
}

function safeText(value) {
  return String(value ?? '').replace(/[<>]/g, '');
}

async function loadStats() {
  try {
    const response = await fetch('/api/stats');
    if (!response.ok) return;
    const stats = await response.json();
    document.querySelector('#reportsCount').textContent = stats.totalReports.toLocaleString('en-IN');
    document.querySelector('#topSkill').textContent = stats.topSkill || 'Building sample';
  } catch {}
}

textarea.addEventListener('input', () => {
  charCount.textContent = `${textarea.value.length} / 6000`;
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  showState('loadingState');
  submitButton.disabled = true;
  submitButton.textContent = 'Analysing…';

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        visitorId,
        background: form.background.value,
        experience: form.experience.value,
        jobDescription: form.jobDescription.value
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'The diagnostic could not be generated.');

    if (data.refused) {
      const box = document.querySelector('#refusalState');
      box.textContent = data.message;
      showState('refusalState');
      return;
    }

    document.querySelector('#gapList').replaceChildren(...data.gaps.map((gap) => {
      const article = document.createElement('article');
      article.className = 'gap';
      article.innerHTML = `<div class="gap-head"><h4>${safeText(gap.skill)}</h4><span class="priority">${safeText(gap.priority)}</span></div><p>${safeText(gap.why)}</p><p class="module"><b>Practice:</b> ${safeText(gap.module)}</p>`;
      return article;
    }));
    document.querySelector('#strengthText').textContent = data.transferableStrength;
    document.querySelector('#nextStepText').textContent = data.nextStep;
    document.querySelector('#disclaimerText').textContent = data.disclaimer;
    showState('resultState');
    loadStats();
  } catch (error) {
    document.querySelector('#errorState').textContent = error.message;
    showState('errorState');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Find my three gaps';
  }
});

loadStats();
