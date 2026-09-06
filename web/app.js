/**
 * Artisan Roast AI — Sensory Coffee Sommelier & Multi-Persona Web Interface Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const chatMessagesBox = document.getElementById('chat-messages-box');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const btnMic = document.getElementById('btn-mic-input');
  const voiceToggleBtn = document.getElementById('voice-synthesis-toggle');
  const voiceStatusText = document.getElementById('voice-status-text');
  
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

  // State Variables
  let voiceEnabled = true;
  let isCeoAuthenticated = false;
  let activeStoreId = 5;

  // Local Catalog for Vector Matching Engine Demo
  const sensoryCatalog = [
    {
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
      rationale: "Because you are feeling sleepy, this high-altitude light roast delivers a bright citric acidity and clean caffeine surge to wake up your senses immediately without feeling heavy in your stomach."
    },
    {
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
      rationale: "Smooth, velvety medium body with balanced acidity. Provides sustained focus and mental stamina for strategy sessions without jitters."
    },
    {
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
      rationale: "Zero coffee acidity, rich in L-theanine amino acids that deliver a calm, jitter-free alert state. Perfect for reducing stress and anxiety."
    },
    {
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
      rationale: "Melted 70% Belgian dark chocolate folded into frothed milk. Decadent, ultra-rich, caffeine-free indulgence for cozy, comforting moods."
    }
  ];

  // Store Barista Queue Data
  let storeQueue = [
    { id: "ORD-801", customer: "Sarah M.", item: "Ethiopia Yirgacheffe Organic", size: "Regular", milk: "Oat Milk", status: "brewing" },
    { id: "ORD-802", customer: "Alex K.", item: "Colombian Supremo", size: "Large", milk: "Whole Milk", status: "pending" },
    { id: "ORD-803", customer: "David P.", item: "Belgian Velvet Hot Chocolate", size: "Large", milk: "Standard", status: "pending" }
  ];

  function id(elementId) {
    return document.getElementById(elementId);
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
    const utterance = new SpeechSynthesisUtterance(text);
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
      showToast("Listening... Speak your mood or request 🎙️");
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
    [btnCustomer, btnBarista, btnCeo].forEach(b => b.classList.remove('active'));
    [viewCustomer, viewBarista, viewCeo].forEach(v => v.classList.add('hidden'));

    if (persona === 'customer') {
      btnCustomer.classList.add('active');
      viewCustomer.classList.remove('hidden');
    } else if (persona === 'barista') {
      btnBarista.classList.add('active');
      viewBarista.classList.remove('hidden');
      renderBaristaQueue();
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

  // --- CEO PIN Verification ---
  btnVerifyPin.addEventListener('click', verifyPin);
  pinInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') verifyPin(); });

  function verifyPin() {
    const pin = pinInput.value.trim();
    if (pin === '8888') {
      isCeoAuthenticated = true;
      pinModal.classList.add('hidden');
      ceoDashboardContent.classList.remove('hidden');
      showToast("CEO Security PIN Verified. Executive analytics unlocked! 🔓");
      speakText("Executive CEO privileges verified. Access granted to financial revenue and profit margins.");
    } else {
      pinErrorMsg.textContent = "Invalid Executive Security PIN. Access denied.";
      pinInput.value = '';
    }
  }

  // --- Mood Chip Clicks ---
  document.querySelectorAll('.mood-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const moodText = chip.getAttribute('data-mood');
      chatInput.value = moodText;
      handleUserSubmit(moodText);
    });
  });

  // --- Chat Submit ---
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (text) {
      handleUserSubmit(text);
    }
  });

  function handleUserSubmit(text) {
    chatInput.value = '';
    appendMessage('user', text);

    // Simulate Sommelier Reasoning & Vector Match
    setTimeout(() => {
      let matched = sensoryCatalog[0]; // Default Ethiopia for sleepy/energy
      let queryLower = text.toLowerCase();

      if (queryLower.includes('stress') || queryLower.includes('anxio') || queryLower.includes('jitter') || queryLower.includes('calm')) {
        matched = sensoryCatalog[2]; // Matcha
      } else if (queryLower.includes('cozy') || queryLower.includes('rain') || queryLower.includes('chocolate') || queryLower.includes('comfort')) {
        matched = sensoryCatalog[3]; // Hot Chocolate
      } else if (queryLower.includes('focus') || queryLower.includes('meeting') || queryLower.includes('work') || queryLower.includes('colombia')) {
        matched = sensoryCatalog[1]; // Colombian Supremo
      }

      updateSommelierCard(matched);

      const botReply = `Based on your sensory query, our vector matcher recommends **${matched.name}** (${matched.score}% Match Score). ${matched.rationale} Would you like to place an order for pickup?`;
      appendMessage('bot', botReply);
      speakText(`I recommend the ${matched.name}. ${matched.rationale}`);
    }, 600);
  }

  function appendMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message message-${sender}`;
    
    const icon = sender === 'bot' ? '<i class="fa-solid fa-robot"></i>' : '<i class="fa-solid fa-user"></i>';
    const meta = sender === 'bot' ? 'AI Sommelier • Rasa Mantle' : 'You';

    msgDiv.innerHTML = `
      <div class="avatar avatar-${sender}">${icon}</div>
      <div class="message-bubble">
        <p>${text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>
        <div class="message-meta">${meta}</div>
      </div>
    `;

    chatMessagesBox.appendChild(msgDiv);
    chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight;
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

  // --- Place Order Action ---
  btnPlaceOrder.addEventListener('click', () => {
    const item = productName.textContent;
    const size = id('order-size-select').value;
    const store = id('store-location-select').selectedOptions[0].text;
    const orderId = 'ORD-' + Math.floor(800 + Math.random() * 100);

    // Add to queue
    storeQueue.unshift({ id: orderId, customer: "Guest User", item: `${item} (${size})`, size, milk: "Standard", status: "pending" });

    const msg = `Order **${orderId}** confirmed! 1x ${item} (${size}) placed for pickup at ${store}. Earned 35 loyalty points. ☕`;
    appendMessage('bot', msg);
    speakText(`Order ${orderId} confirmed for pickup at ${store}. Estimated prep time is 5 minutes.`);
    showToast(`Order ${orderId} placed successfully! 🎉`);
  });

  // --- Render Barista Queue ---
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

  window.updateOrderStatus = function(idStr) {
    const found = storeQueue.find(q => q.id === idStr);
    if (found) {
      if (found.status === 'pending') found.status = 'brewing';
      else if (found.status === 'brewing') found.status = 'ready';
      else found.status = 'completed';
      renderBaristaQueue();
      showToast(`Order ${idStr} updated to ${found.status}!`);
    }
  };

  // --- Toast Notification ---
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
  }
});
