# WhatsApp Reminder Demo

A local-only Next.js demo that connects through WhatsApp Web, sends sequential reminders to consenting recipients, and keeps campaign and schedule state in memory.

## Run locally

1. Copy `.env.example` to `.env.local` and adjust the demo limits if needed.
2. Run `npm install`.
3. Run `npm run dev` and open `http://localhost:3000`.
4. Select **Connect WhatsApp**, then scan the QR code from WhatsApp → Linked Devices.

The WhatsApp session is stored under `sessions/` and is ignored by Git. Scheduling is deliberately in-memory: pending schedules disappear if the server stops.

Use this demo only with recipients who expect and consent to the messages. It does not include bulk-send or restriction-bypass features.
