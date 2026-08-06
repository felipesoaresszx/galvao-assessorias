// ─── DOM References ───
const modal = document.getElementById('budgetModal');
const progressFill = document.getElementById('progressFill');
const steps = Array.from(document.querySelectorAll('.step'));
const nextBtn = document.getElementById('nextBtn');
const backBtn = document.getElementById('backBtn');
const closeBtn = document.querySelector('.modal__close');
const floatingButton = document.querySelector('.floating-button');
const budgetButtons = document.querySelectorAll('.budget-button');

// ─── State ───
let currentStep = 0;
const answers = {};
const totalSteps = steps.length;

// ─── Service Message Templates (SINCRONIZADO COM HTML) ───
const serviceMessageMap = {
  AVCB: 'Olá! Vim pelo site da Galvão Assessorias e gostaria de solicitar um orçamento para emissão de AVCB.',
  CLCB: 'Olá! Vim pelo site da Galvão Assessorias e gostaria de solicitar um orçamento para emissão de CLCB.',
  Extintores: 'Olá! Vim pelo site da Galvão Assessorias e gostaria de solicitar um orçamento para extintores.',
  Hidrantes: 'Olá! Vim pelo site da Galvão Assessorias e gostaria de solicitar um orçamento para hidrantes.',
  Alarme: 'Olá! Vim pelo site da Galvão Assessorias e gostaria de solicitar um orçamento para sistema de alarme.',
  Treinamento: 'Olá! Vim pelo site da Galvão Assessorias e gostaria de solicitar um orçamento para treinamento de brigada.',
  Manutenção: 'Olá! Vim pelo site da Galvão Assessorias e gostaria de solicitar um orçamento para manutenção.',
  Outro: 'Olá! Vim pelo site da Galvão Assessorias e gostaria de solicitar um orçamento.'
};

// ─── Functions ───

/**
 * Open modal with optional pre-selected service
 */
function openModal(defaultService = '') {
  console.log('Modal aberto com serviço:', defaultService);
  currentStep = 0;
  answers.service = defaultService || answers.service || '';
  updateUi();
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

/**
 * Close modal
 */
function closeModal() {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  removeErrorMessage();
}

/**
 * Get selected radio value by name
 */
function getSelectedValue(name) {
  const selected = document.querySelector(`input[name="${name}"]:checked`);
  return selected ? selected.value : '';
}

/**
 * Update UI - active step, progress bar, button text
 */
function updateUi() {
  // Validar que steps foi carregado
  if (steps.length === 0) {
    console.error('ERRO: Nenhum step encontrado! Verificar HTML.');
    return;
  }

  // Update active step
  steps.forEach((step, index) => {
    step.classList.toggle('active', index === currentStep);
  });

  // Update progress bar
  const progress = ((currentStep + 1) / totalSteps) * 100;
  progressFill.style.width = `${progress}%`;

  // Update button visibility and text
  backBtn.style.display = currentStep === 0 ? 'none' : 'inline-flex';
  nextBtn.textContent = currentStep === totalSteps - 1 ? 'Continuar para o WhatsApp' : 'Continuar';

  // Remove any error messages
  removeErrorMessage();
  
  console.log(`Step ${currentStep + 1}/${totalSteps}`);
}

/**
 * Show error message
 */
function showError(message) {
  removeErrorMessage();
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  errorDiv.style.cssText = `
    background: rgba(211, 47, 47, 0.15);
    border: 1px solid #d32f2f;
    border-radius: 2px;
    color: #ef5350;
    padding: 0.8rem;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    animation: slideDown 0.3s ease;
  `;
  
  const activeStep = steps[currentStep];
  if (activeStep) {
    activeStep.insertBefore(errorDiv, activeStep.firstChild);
  }
}

/**
 * Remove error message
 */
function removeErrorMessage() {
  const errorMsg = document.querySelector('.error-message');
  if (errorMsg) {
    errorMsg.remove();
  }
}

/**
 * Collect all form answers
 */
function collectAnswers() {
  answers.service = getSelectedValue('service') || answers.service || '';
  answers.propertyType = getSelectedValue('propertyType') || answers.propertyType || '';
  answers.city = document.getElementById('cityInput')?.value.trim() || '';
  answers.name = document.getElementById('nameInput')?.value.trim() || '';
  answers.phone = document.getElementById('phoneInput')?.value.trim() || '';
}

/**
 * Build formatted WhatsApp message
 */
function buildMessage() {
  const serviceText = serviceMessageMap[answers.service] || serviceMessageMap.Outro;
  return [
    serviceText,
    '',
    `📌 Serviço: ${answers.service || 'Não informado'}`,
    '',
    `🏢 Tipo de imóvel: ${answers.propertyType || 'Não informado'}`,
    '',
    `📍 Cidade: ${answers.city || 'Não informada'}`,
    '',
    `👤 Nome: ${answers.name || 'Não informado'}`,
    '',
    `📱 Telefone: ${answers.phone || 'Não informado'}`,
    '',
    'Aguardo um retorno. Obrigado!'
  ].join('\n');
}

/**
 * Validate current step
 */
function validateStep() {
  collectAnswers();

  const validationRules = [
    {
      step: 0,
      condition: !answers.service,
      message: '📌 Selecione um serviço para continuar'
    },
    {
      step: 1,
      condition: !answers.propertyType,
      message: '🏢 Escolha o tipo de imóvel para continuar'
    },
    {
      step: 2,
      condition: !answers.city,
      message: '📍 Informe a cidade para continuar'
    },
    {
      step: 3,
      condition: !answers.name,
      message: '👤 Digite seu nome para continuar'
    },
    {
      step: 4,
      condition: !answers.phone,
      message: '📱 Informe seu WhatsApp para continuar'
    }
  ];

  for (const rule of validationRules) {
    if (rule.step === currentStep && rule.condition) {
      showError(rule.message);
      return false;
    }
  }

  return true;
}

/**
 * Handle next button click
 */
function goNext() {
  // Validate current step
  if (!validateStep()) {
    return;
  }

  // Move to next step
  if (currentStep < totalSteps - 1) {
    currentStep += 1;
    updateUi();
    return;
  }

  // All steps complete - open WhatsApp
  const message = buildMessage();
  const whatsappUrl = `https://wa.me/5511978386244?text=${encodeURIComponent(message)}`;
  console.log('Abrindo WhatsApp com mensagem:', message);
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  closeModal();
}

/**
 * Handle back button click
 */
function goBack() {
  if (currentStep > 0) {
    currentStep -= 1;
    updateUi();
  }
}

// ─── Event Listeners ───

// Budget buttons throughout the page
budgetButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const defaultService = button.getAttribute('data-service') || '';
    openModal(defaultService);
  });
});

// Floating button
if (floatingButton) {
  floatingButton.addEventListener('click', () => openModal(''));
}

// Modal navigation
nextBtn.addEventListener('click', goNext);
backBtn.addEventListener('click', goBack);
closeBtn.addEventListener('click', closeModal);

// Close modal when clicking backdrop
modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

// Close modal on Escape key
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal.classList.contains('is-open')) {
    closeModal();
  }
});

// ─── Init ───
console.log(`✓ Script carregado. ${totalSteps} steps encontrados.`);
updateUi();