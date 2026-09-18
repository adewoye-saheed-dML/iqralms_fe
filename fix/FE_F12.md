# F12 — Finance and Payout UI Alignment

Goal: separate academy-wide finance management from teacher self-service earnings/payouts.

Finance surfaces:
- pricing
- agreements
- teacher earnings
- payouts
- statements

Audit finding: payout navigation is too broad and does not clearly separate management from own-view access.

Instructions:
1. Inspect corrected pricing/payout OpenAPI and backend permissions.
2. Define capabilities for:
   - academy finance management
   - teacher own earnings
   - teacher own payouts/statements
3. Do not grant broad finance authority to staff by assumption.
4. Do not show another academy's finance records.
5. Do not invent payment gateway, accounting, bank-transfer, or tax automation.
6. Use tenant-aware query keys.
7. Keep finance UI task-focused.

Tests:
- owner/admin management
- teacher own finance
- forbidden academy-wide finance action
- academy switch
- payout list/detail isolation
- unsupported payment actions absent

Acceptance:
- finance navigation matches actual capabilities
- own vs management is clear
- unsupported finance features are not implied
- tenant cache isolation is proven

STOP.
