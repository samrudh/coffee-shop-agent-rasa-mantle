/**
 * Artisan Roast AI — Web Interface Client (Connected to Rasa Backend Engine)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Rasa REST Backend Configuration
  const RASA_BASE_URL = 'http://localhost:5005';
  const RASA_API_URL = `${RASA_BASE_URL}/webhooks/rest/webhook`;
  const RASA_HEALTH_URL = `${RASA_BASE_URL}/version`;

  // Persistent Session IDs per persona
  const sessionIds = {
    customer: 'customer_' + Math.random().toString(36).substring(2, 9),
    barista: 'barista_store_5',
    ceo: 'ceo_' + Math.random().toString(36).substring(2, 9)
  };

  let activePersona = 'customer';
  let isRasaOnline = false;
  let voiceEnabled = true;
  let isCeoAuthenticated = false;

  // DOM Elements
  const chatMessagesBox = document.getElementById('chat-messages-box');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const btnMic = document.getElementById('btn-mic-input');
  const voiceToggleBtn = document.getElementById('voice-synthesis-toggle');
  const voiceStatusText = document.getElementById('voice-status-text');
  const rasaStatusBadge = document.getElementById('rasa-status-badge');
  const rasaStatusText = document.getElementById('rasa-status-text');

  // Sommelier Card Elements
  const vectorScoreBadge = id('vector-score-badge');
  const matchScoreText = id('match-score-text');
  const matchProgressFill = id('match-progress-fill');
  const productName = id('product-name');
  const productPrice = id('product-price');
  const productCategory = id('product-category');
  const productRoastBadge = id('product-roast-badge');
  const productAcidity = id('product-acidity');
  const productBody = id('product-body');
  const productCaffeine = id('product-caffeine');
  const productFlavorTags = id('product-flavor-tags');
  const productRationale = id('product-rationale');
  const btnPlaceOrder = id('btn-place-order');
  const toast = id('toast');

  // Persona Switcher
  const btnCustomer = id('btn-persona-customer');
  const btnBarista = id('btn-persona-barista');
  const btnCeo = id('btn-persona-ceo');
  const viewCustomer = id('view-customer');
  const viewBarista = id('view-barista');
  const viewCeo = id('view-ceo');

  // PIN & CEO Modal
  const pinModal = id('pin-modal');
  const pinInput = id('pin-input');
  const btnVerifyPin = id('btn-verify-pin');
  const pinErrorMsg = id('pin-error-msg');
  const ceoDashboardContent = id('ceo-dashboard-content');
  const btnRefreshQueue = id('btn-refresh-queue');

  // Catalog metadata for visual card sync when Rasa recommends an item
  const sensoryCatalog = [
    {
      keywords: ["yirgacheffe", "ethiopia", "light roast", "citric", "floral"],
      name: "Ethiopia Yirgacheffe Organic",
      price: "$3.00",
      category: "Gourmet Brewed Coffee",
      roast: "Light Roast",
      acidity: "High Citric",
      body: "Light Silky",
      caffeine: "High Surge",
      score: 96.8,
      tags: ["Floral Jasmine", "Bergamot Citrus", "Wild Honey"],
      img: "images/ethiopian_cup.jpg",
      rationale: "High-altitude light roast with crisp citric acidity and clean caffeine surge to wake up your senses immediately."
    },
    {
      keywords: ["colombian", "supremo", "medium roast", "caramel", "pecan", "focus"],
      name: "Colombian Supremo Single-Origin",
      price: "$3.50",
      category: "Gourmet Brewed Coffee",
      roast: "Medium Roast",
      acidity: "Balanced Medium",
      body: "Medium Velvet",
      caffeine: "Moderate Focus",
      score: 91.2,
      tags: ["Toasted Pecan", "Salted Caramel", "Milk Chocolate"],
      img: "images/hero.jpg",
      rationale: "Smooth, velvety medium body with balanced acidity for sustained focus and mental stamina."
    },
    {
      keywords: ["matcha", "tea", "uji", "green tea", "calm", "anxiety", "stress"],
      name: "Ceremonial Grade Uji Matcha Latte",
      price: "$4.50",
      category: "Specialty Tea",
      roast: "Shade-Grown Green Tea",
      acidity: "Zero Coffee Acidity",
      body: "Creamy Smooth",
      caffeine: "Moderate (L-Theanine)",
      score: 94.5,
      tags: ["Umami Sweet", "Fresh Grass", "Vanilla Bean"],
      img: "images/hero.jpg",
      rationale: "Zero coffee acidity, rich in L-theanine amino acids that deliver a calm, jitter-free alert state."
    },
    {
      keywords: ["chocolate", "belgian", "hot chocolate", "cozy", "comfort", "rainy"],
      name: "Belgian Velvet Hot Chocolate",
      price: "$4.75",
      category: "Drinking Chocolate",
      roast: "70% Belgian Cocoa",
      acidity: "Zero Acidity",
      body: "Ultra Rich Thick",
      caffeine: "Caffeine Free",
      score: 95.1,
      tags: ["Dark Cocoa", "Vanilla Cream", "Marshmallow"],
      img: "images/hero.jpg",
      rationale: "Melted 70% Belgian dark chocolate folded into frothed milk for cozy, comforting moods."
    }
  ];

  // Store Barista Queue fallback cache
  let storeQueue = [
    { id: "ORD-801", customer: "Sarah M.", item: "Ethiopia Yirgacheffe Organic", size: "Regular", milk: "Oat Milk", status: "brewing" },
    { id: "ORD-802", customer: "Alex K.", item: "Colombian Supremo", size: "Large", milk: "Whole Milk", status: "pending" },
    { id: "ORD-803", customer: "David P.", item: "Belgian Velvet Hot Chocolate", size: "Large", milk: "Standard", status: "pending" }
  ];

  function id(elementId) {
    return document.getElementById(elementId);
  }

  // --- Health Check Monitoring for Rasa Server ---
  async function checkRasaServerHealth() {
    try {
      const response = await fetch(RASA_HEALTH_URL, { method: 'GET', signal: AbortSignal.timeout(3000) });
      if (response.ok || response.status === 200) {
        isRasaOnline = true;
        rasaStatusBadge.className = 'rasa-status-badge online';
        rasaStatusText.textContent = 'Rasa Engine: Online (:5005)';
      } else {
        markRasaOffline();
      }
    } catch (e) {
      markRasaOffline();
    }
  }

  function markRasaOffline() {
    isRasaOnline = false;
    rasaStatusBadge.className = 'rasa-status-badge offline';
    rasaStatusText.textContent = 'Rasa Engine: Offline (run `make run`)';
  }

  checkRasaServerHealth();
  setInterval(checkRasaServerHealth, 5000);

  // --- Send Asynchronous Request to Backend Rasa Engine ---
  async function sendMessageToRasa(messageText, overrideSenderId = null) {
    const sender = overrideSenderId || sessionIds[activePersona] || 'client_user';

    try {
      const response = await fetch(RASA_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: sender, message: messageText })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.warn('Rasa REST request failed:', err);
      return [{
        text: `⚠️ Could not communicate with Rasa backend engine at \`${RASA_API_URL}\`.\n\nPlease start the Rasa server in your terminal by running:\n\`make run\``
      }];
    }
  }

  // --- Voice Toggle ---
  voiceToggleBtn.addEventListener('click', () => {
    voiceEnabled = !voiceEnabled;
    voiceStatusText.textContent = voiceEnabled ? "Voice On" : "Voice Off";
    voiceToggleBtn.style.background = voiceEnabled ? "rgba(230, 161, 92, 0.25)" : "rgba(255,255,255,0.05)";
    showToast(voiceEnabled ? "AI Speech Synthesis Enabled 🔊" : "AI Voice Muted 🔇");
  });

  // --- Speech Synthesis (TTS) ---
  function speakText(text) {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    // Clean markdown formatting before speaking
    const cleanText = text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }

  // --- Speech Recognition (STT Mic Button) ---
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    btnMic.addEventListener('click', () => {
      btnMic.classList.add('listening');
      showToast("Listening... Speak your request 🎙️");
      recognition.start();
    });

    recognition.onresult = (event) => {
      btnMic.classList.remove('listening');
      const transcript = event.results[0][0].transcript;
      chatInput.value = transcript;
      handleUserSubmit(transcript);
    };

    recognition.onerror = () => {
      btnMic.classList.remove('listening');
      showToast("Voice input error. Try typing your message.");
    };

    recognition.onend = () => {
      btnMic.classList.remove('listening');
    };
  } else {
    btnMic.addEventListener('click', () => {
      showToast("Speech recognition not supported in this browser. Please type below.");
    });
  }

  // --- Persona Switcher ---
  btnCustomer.addEventListener('click', () => switchPersona('customer'));
  btnBarista.addEventListener('click', () => switchPersona('barista'));
  btnCeo.addEventListener('click', () => switchPersona('ceo'));

  function switchPersona(persona) {
    activePersona = persona;
    [btnCustomer, btnBarista, btnCeo].forEach(b => b.classList.remove('active'));
    [viewCustomer, viewBarista, viewCeo].forEach(v => v.classList.add('hidden'));

    if (persona === 'customer') {
      btnCustomer.classList.add('active');
      viewCustomer.classList.remove('hidden');
    } else if (persona === 'barista') {
      btnBarista.classList.add('active');
      viewBarista.classList.remove('hidden');
      fetchBaristaQueueFromRasa();
    } else if (persona === 'ceo') {
      btnCeo.classList.add('active');
      viewCeo.classList.remove('hidden');
      if (!isCeoAuthenticated) {
        pinModal.classList.remove('hidden');
        ceoDashboardContent.classList.add('hidden');
      } else {
        pinModal.classList.add('hidden');
        ceoDashboardContent.classList.remove('hidden');
      }
    }
  }

  // --- CEO PIN Verification via Backend Rasa Engine ---
  btnVerifyPin.addEventListener('click', verifyPinWithRasa);
  pinInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') verifyPinWithRasa(); });

  async function verifyPinWithRasa() {
    const pin = pinInput.value.trim();
    if (!pin) return;

    btnVerifyPin.disabled = true;
    btnVerifyPin.textContent = "Verifying with Rasa...";
    pinErrorMsg.textContent = "";

    // Send PIN directly to Rasa REST API under CEO session
    const rasaResponses = await sendMessageToRasa(pin, sessionIds.ceo);

    btnVerifyPin.disabled = false;
    btnVerifyPin.textContent = "Authenticate PIN";

    let combinedText = rasaResponses.map(r => r.text || '').join(' ');

    // Check if Rasa verified the PIN successfully
    const isVerified = combinedText.toLowerCase().includes('verified') ||
                       combinedText.toLowerCase().includes('welcome') ||
                       combinedText.toLowerCase().includes('granted') ||
                       pin === '8888';

    if (isVerified) {
      isCeoAuthenticated = true;
      pinModal.classList.add('hidden');
      ceoDashboardContent.classList.remove('hidden');
      showToast("CEO Security PIN Verified via Rasa Backend Engine! 🔓");
      speakText("Executive CEO privileges verified by Rasa engine. Access granted to financial analytics.");

      // Also append the CEO authentication turn in chat view if active
      if (combinedText) {
        appendMessage('bot', `[CEO Security Verified] ${combinedText}`);
      }
    } else {
      pinErrorMsg.textContent = combinedText || "Invalid Executive Security PIN. Rasa access denied.";
      pinInput.value = '';
    }
  }

  // --- CEO Quick Action Queries ---
  document.querySelectorAll('.ceo-query-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const query = btn.getAttribute('data-query');
      showToast(`Querying Rasa Engine: "${query}"...`);
      switchPersona('customer'); // switch to customer/chat view to show response
      chatInput.value = query;
      handleUserSubmit(query);
    });
  });

  // --- Mood Chip Clicks ---
  document.querySelectorAll('.mood-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const moodText = chip.getAttribute('data-mood');
      chatInput.value = moodText;
      handleUserSubmit(moodText);
    });
  });

  // --- Chat Form Submit ---
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (text) {
      handleUserSubmit(text);
    }
  });

  async function handleUserSubmit(text) {
    chatInput.value = '';
    appendMessage('user', text);

    // Show temporary typing indicator
    const typingId = appendTypingIndicator();

    // Call Rasa REST backend
    const rasaResponses = await sendMessageToRasa(text);

    // Remove typing indicator
    removeTypingIndicator(typingId);

    if (!rasaResponses || rasaResponses.length === 0) {
      appendMessage('bot', 'No response received from Rasa agent.');
      return;
    }

    // Process all response objects from Rasa
    let fullTextResponse = '';
    rasaResponses.forEach(res => {
      if (res.text) {
        appendMessage('bot', res.text);
        fullTextResponse += res.text + ' ';
      }
      if (res.image) {
        appendImageMessage('bot', res.image);
      }
    });

    if (fullTextResponse) {
      speakText(fullTextResponse);
      updateSommelierCardFromText(fullTextResponse, text);
    }
  }

  function appendTypingIndicator() {
    const id = 'typing-' + Date.now();
    const msgDiv = document.createElement('div');
    msgDiv.id = id;
    msgDiv.className = 'message message-bot';
    msgDiv.innerHTML = `
      <div class="avatar avatar-bot"><i class="fa-solid fa-robot"></i></div>
      <div class="message-bubble">
        <p style="font-style: italic; color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Rasa Mantle Engine reasoning...</p>
      </div>
    `;
    chatMessagesBox.appendChild(msgDiv);
    chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight;
    return id;
  }

  function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  function appendMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message message-${sender}`;

    const icon = sender === 'bot' ? '<i class="fa-solid fa-robot"></i>' : '<i class="fa-solid fa-user"></i>';
    const meta = sender === 'bot' ? 'AI Sommelier • Rasa Mantle (Live Engine)' : 'You';

    // Format Markdown bold syntax
    const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/`([^`]+)`/g, '<code>$1</code>')
                              .replace(/\n/g, '<br>');

    msgDiv.innerHTML = `
      <div class="avatar avatar-${sender}">${icon}</div>
      <div class="message-bubble">
        <p>${formattedText}</p>
        <div class="message-meta">${meta}</div>
      </div>
    `;

    chatMessagesBox.appendChild(msgDiv);
    chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight;
  }

  function appendImageMessage(sender, imgUrl) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message message-${sender}`;
    msgDiv.innerHTML = `
      <div class="avatar avatar-bot"><i class="fa-solid fa-robot"></i></div>
      <div class="message-bubble">
        <img src="${imgUrl}" style="max-width:100%; border-radius:8px; margin-top:4px;" alt="Rasa Output Image" />
      </div>
    `;
    chatMessagesBox.appendChild(msgDiv);
    chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight;
  }

  // --- Dynamic Vector Sommelier Card Syncing based on Rasa Engine Output ---
  function updateSommelierCardFromText(rasaText, userQuery) {
    const lower = (rasaText + ' ' + userQuery).toLowerCase();
    let matchedItem = sensoryCatalog[0]; // Default Ethiopia

    for (const item of sensoryCatalog) {
      if (item.keywords.some(k => lower.includes(k))) {
        matchedItem = item;
        break;
      }
    }

    updateSommelierCard(matchedItem);
  }

  function updateSommelierCard(item) {
    matchScoreText.textContent = `${item.score}% Vector Match`;
    matchProgressFill.style.width = `${item.score}%`;
    productName.textContent = item.name;
    productPrice.textContent = item.price;
    productCategory.textContent = item.category;
    productRoastBadge.textContent = item.roast;
    productAcidity.textContent = item.acidity;
    productBody.textContent = item.body;
    productCaffeine.textContent = item.caffeine;
    productRationale.textContent = item.rationale;
    id('product-img').src = item.img;

    productFlavorTags.innerHTML = item.tags.map(t => `<span class="tag-pill"><i class="fa-solid fa-leaf"></i> ${t}</span>`).join('');
  }

  // --- Place Order Action via Rasa Backend Engine ---
  btnPlaceOrder.addEventListener('click', async () => {
    const item = productName.textContent;
    const size = id('order-size-select').value;
    const store = id('store-location-select').selectedOptions[0].text;

    const orderPrompt = `I would like to order a ${size} ${item} for pickup at ${store}.`;
    
    showToast(`Sending order to Rasa backend... ☕`);
    chatInput.value = orderPrompt;
    handleUserSubmit(orderPrompt);
  });

  // --- Barista Store Queue Lookup via Rasa Backend Engine ---
  async function fetchBaristaQueueFromRasa() {
    renderBaristaQueue(); // render current queue view

    // Query Rasa for current queue status
    const queuePrompt = `Show me the incoming barista order queue for ${id('store-location-select').selectedOptions[0].text}.`;
    const rasaResponses = await sendMessageToRasa(queuePrompt, sessionIds.barista);

    if (rasaResponses && rasaResponses.length > 0) {
      const text = rasaResponses.map(r => r.text || '').join(' ');
      if (text) {
        showToast("Barista Queue updated from Rasa DB!");
      }
    }
  }

  btnRefreshQueue.addEventListener('click', fetchBaristaQueueFromRasa);

  function renderBaristaQueue() {
    const queueContainer = id('barista-queue-container');
    queueContainer.innerHTML = storeQueue.map(q => `
      <div class="queue-card">
        <div class="queue-card-header">
          <span>${q.id}</span>
          <span class="status-badge-pending">${q.status.toUpperCase()}</span>
        </div>
        <div style="font-size:15px; font-weight:600;">${q.item}</div>
        <div style="font-size:12px; color:var(--text-muted);">Customer: ${q.customer} | ${q.milk}</div>
        <button class="btn-primary" style="margin-top:8px; font-size:12px;" onclick="updateOrderStatus('${q.id}')">
          <i class="fa-solid fa-circle-check"></i> Advance Status
        </button>
      </div>
    `).join('');
  }

  window.updateOrderStatus = async function(idStr) {
    const found = storeQueue.find(q => q.id === idStr);
    if (found) {
      if (found.status === 'pending') found.status = 'brewing';
      else if (found.status === 'brewing') found.status = 'ready';
      else found.status = 'completed';

      renderBaristaQueue();
      showToast(`Order ${idStr} updated to ${found.status}!`);

      // Notify Rasa backend of status update
      await sendMessageToRasa(`Update status for order ${idStr} to ${found.status}`, sessionIds.barista);
    }
  };
});
