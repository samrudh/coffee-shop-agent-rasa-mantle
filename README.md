# Artisan Roast Coffee Shop AI Agent

```text
Author:        Samrudha Kelkar
Wave:          wave-01-mantle
Assessed on:   2026-09-05
Assessed by:   Samrudha Kelkar
Verified with: rasa-pro 3.20.0.dev6, Python 3.12, uv
```

**Artisan Roast Coffee Co.** is a production-ready conversational and voice AI assistant built with **Rasa Pro Mantle (formerly CALM v2 / Maestro)** and powered by **Google Gemini LLM**.

Designed for **Rasa Heroes Build Day (Wave 1 Mantle)**, this project demonstrates how to structure real-world enterprise applications across all **Five Levels of Progressive Control** offered by the Rasa Mantle Orchestrator.

---

## 1. Project Overview & Multi-Persona Architecture

The agent seamlessly serves three distinct enterprise personas within a single conversational model:

1. **Customer Persona**:
   - Explore specialty coffee beans, single-origins (Ethiopia, Colombia), brew methods, tasting notes, and prices.
   - Place custom coffee orders with milk selection and drink sizing using declarative confirmations.
   - Track active order status and view order history.
   - Check loyalty points balance and redeem free handcrafted drinks.
   - Query store hours, Wi-Fi, allergen safety, and bean sourcing from semantic knowledge references.

2. **Operator (Barista & Store Manager) Persona**:
   - View the live store order queue across locations (Astoria, Lower Manhattan, Hell's Kitchen).
   - Execute deterministic drink preparation and notify customers when orders are ready.
   - Monitor real-time store inventory, view low-stock alerts, and perform restocking.
   - Escalate critical out-of-stock events to regional supply management via modular sub-skills.

3. **CEO & Executive Persona**:
   - Gated by 4-digit PIN authentication (`8888`) and programmatic Role-Based Access Control (RBAC).
   - Analyze executive revenue metrics, order volumes, and average ticket sizes across 149,116 transactions.
   - Benchmark store performance across Manhattan, Hell's Kitchen, and Astoria.
   - Analyze product margins, Cost of Goods Sold (COGS), and recipe Bill-of-Materials (BOM).

---

## 2. Five Levels of Progressive Control in Rasa Mantle

| Level | Progressive Control Feature | Coffee Shop Implementation | Skill Directory |
| :--- | :--- | :--- | :--- |
| **Level 1** | **Natural Language & Knowledge References** | **Menu & Bean Origin Exploration**: Free-form natural language instructions and local embeddings (`sentence-transformers/all-MiniLM-L6-v2`) over origin and roast guides. | `skills/coffee_faq/`<br>`skills/customer_menu/` |
| **Level 2** | **Scoped Instructions (`if:` blocks)** | **Customer Loyalty & Tier Rewards**: Conditional instruction blocks (`if: session.project.loyalty_tier == "Gold"`) dynamically adjusting reward messaging and VIP discounts. | `skills/customer_loyalty/` |
| **Level 3** | **Ordered Blocks (`:::ordered_block`)** | **Barista Order Preparation Workflow**: Strictly sequenced 5-step operational block for order queue pickup, recipe verification, brewing status, and customer readiness alerts. | `skills/operator_orders/` |
| **Level 4** | **Sub-Skills Composition (`@skill.<name>`)** | **Store Inventory Restocking & Escalation**: Modular architecture where `operator_inventory` delegates to standalone sub-skills `@skill.restock_inventory` and `@skill.escalate_supply_outage`. | `skills/operator_inventory/`<br>`skills/restock_inventory/`<br>`skills/escalate_supply_outage/` |
| **Level 5a** | **Declarative Tool Constraints** | **Order Placement with Confirmation**: `requires_confirmation: enabled: true` and `requires: session.project.selected_item` preventing unconfirmed charges. | `skills/customer_order/` |
| **Level 5b** | **Context & Programmatic RBAC** | **Executive CEO Analytics**: Python decorator `@require_role("ceo")` inspecting `ToolContext.memory`, prompting for CEO PIN, and unlocking financial analytics. | `skills/ceo_analytics/`<br>`skills/authenticate_ceo/`<br>`tools/coffeeshop.py` |

---

## 3. Quickstart & Installation

### Prerequisites
- Python 3.12 (or >=3.11, <3.15)
- [uv package manager](https://astral.sh/uv): `curl -LsSf https://astral.sh/uv/install.sh | sh`
- Valid Rasa Pro License Key (`RASA_LICENSE`) with Mantle/Voice scope
- Google Gemini API Key (`GEMINI_API_KEY`)
- Deepgram API Key (`DEEPGRAM_API_KEY`, optional for voice channels)

### Setup Steps
```bash
# 1. Install dependencies into dedicated .venv
make install

# 2. Configure environment credentials
make env
# Edit .env with your RASA_LICENSE and GEMINI_API_KEY

# 3. Ingest datasets and initialize SQLite database
make reset-db

# 4. Verify system diagnostics
make verify

# 5. Validate project structure and skills
make validate

# 6. Train and package the agent
make train

# 7. Launch the conversational Inspector
make inspect
```

---

## 4. Evaluation & Testing Suite

Run all verification and evaluation instruments:
```bash
# Fast deterministic E2E assertions
make test-e2e

# LLM-as-a-Judge groundedness & relevance tests
make test-judge

# Run all test instruments together
make test-all
```

---

## 5. Rasa Heroes Wave 1 Metadata

- **Author**: Samrudha Kelkar
- **Project**: Artisan Roast Coffee Shop AI Agent (`samrudh-coffee-shop`)
- **Wave**: `wave-01-mantle`
- **Assessed on**: 2026-09-05
- **Assessed by**: Samrudha Kelkar
- **Verified with**: rasa-pro 3.20.0.dev6, Python 3.12, uv
- **License**: Apache 2.0 / Public Community Project
