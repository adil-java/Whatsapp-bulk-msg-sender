# WhatsApp Reminder Demo

A local-only Next.js demo that connects through WhatsApp Web, sends sequential reminders to consenting recipients, and keeps campaign and schedule state in memory.

## Run locally

1. Copy `.env.example` to `.env.local` and adjust the demo limits if needed.
2. Run `npm install`.
3. Run `npm run dev` and open `http://localhost:3000`.
4. Select **Connect WhatsApp**, then scan the QR code from WhatsApp → Linked Devices.

## CSV recipients

Upload a `.csv` file with `name` and `phone` columns. `number`, `mobile`, and `whatsapp` are also accepted as phone-column names.

```csv
name,phone
Ali Khan,03001234567
Sara Ahmed,+92 312-1234567
```

CSV phone numbers are normalized and previewed before sending. Use `{{name}}` in the message to personalize each recipient's copy.

The WhatsApp session is stored under `sessions/` and is ignored by Git. Scheduling is deliberately in-memory: pending schedules disappear if the server stops.

If Puppeteer reports a missing Chrome framework after an interrupted install, remove its named version folder and matching ZIP from `~/.cache/puppeteer/chrome/`, then run `npx puppeteer browsers install chrome` again. Restart the development server after the browser install completes.

Use this demo only with recipients who expect and consent to the messages. It does not include bulk-send or restriction-bypass features.
