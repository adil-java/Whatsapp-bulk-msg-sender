# WhatsApp Reminder Demo

A local-only Next.js demo that connects through WhatsApp Web, sends sequential reminders to consenting recipients, and keeps campaign and schedule state in memory.

## Run locally

1. Copy `.env.example` to `.env.local` and adjust the demo limits if needed.
2. Run `npm install`.
3. Run `npm run dev` and open `http://localhost:3000`.
4. Select **Connect WhatsApp**, then scan the QR code from WhatsApp → Linked Devices.

## CSV recipients

Upload a Google Contacts CSV directly. The importer recognizes `Name`, separate given/family name fields, and every `Phone <number> - Value` column. It also accepts simple CSV files with `name` and `phone` columns; `number`, `mobile`, and `whatsapp` are supported aliases.

```csv
name,phone
Ali Khan,03001234567
Sara Ahmed,+92 312-1234567
```

CSV phone numbers are normalized and displayed in an editable **Imported contacts** table. Names and numbers can be corrected, removed, or added before sending. Add `{recipient name}` to the message to personalize each recipient's copy from the CSV name; the earlier `{{name}}` tag remains supported.

Phone numbers from any country are accepted with or without a country code. The CSV importer removes visual formatting such as spaces, dashes, and parentheses, but does not add or require a country code.

The WhatsApp session is stored under `sessions/` and is ignored by Git. Scheduling is deliberately in-memory: pending schedules disappear if the server stops.

If Puppeteer reports a missing Chrome framework after an interrupted install, remove its named version folder and matching ZIP from `~/.cache/puppeteer/chrome/`, then run `npx puppeteer browsers install chrome` again. Restart the development server after the browser install completes.

Use this demo only with recipients who expect and consent to the messages. It does not include bulk-send or restriction-bypass features.
