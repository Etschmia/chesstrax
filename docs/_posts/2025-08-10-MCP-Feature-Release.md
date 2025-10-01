---
layout: post
title:  "Volle Kraft voraus: Wähle deine eigene KI!"
date:   2025-08-10 10:00:00 +0200
categories: update feature
---

Es ist soweit! Ein zentrales Feature, das ich mir von Anfang an für den ChessTrax gewünscht habe, ist nun Realität. Mit dem neuesten Update erhältst du die volle Kontrolle darüber, welche "Intelligenz" deine Schachpartien analysiert.

### Das "Model Context Protocol" (MCP) ist da!

Bisher war die Analyse fest an das Gemini-Modell von Google gekoppelt. Das hat sich geändert. Ich habe das Fundament der App so umgebaut, dass sie nun flexibel mit verschiedenen KI-Anbietern kommunizieren kann. Was bedeutet das für dich?

**1. Wähle deine bevorzugte KI:** Du kannst jetzt direkt in den Einstellungen der App auswählen, ob du die Analyse von **Google Gemini** oder **OpenAI's GPT-Modellen** durchführen lassen möchtest. Die Architektur ist so gebaut, dass in Zukunft weitere Modelle (z.B. Anthropic's Claude) einfach hinzugefügt werden können.

**2. Nutze deinen eigenen API-Schlüssel:** Das ist die vielleicht wichtigste Neuerung für alle Power-User. Du hast ein eigenes Abo bei OpenAI oder Google und möchtest die volle Leistung der fortschrittlichsten Modelle für deine Analyse nutzen? Kein Problem! Du kannst jetzt deinen persönlichen API-Schlüssel in den Einstellungen hinterlegen.

### Datenschutz an erster Stelle

Mir war ein Punkt bei der Umsetzung extrem wichtig: **Dein API-Schlüssel verlässt niemals deinen Browser.** Er wird ausschließlich lokal bei dir im `localStorage` gespeichert und bei jeder Analyse direkt von deinem Computer an die jeweilige API (z.B. OpenAI) gesendet. Mein Server oder die ChessTrax-Anwendung selbst sehen deinen Schlüssel nie. Das gibt dir die Sicherheit, dass nur du die Kontrolle hast und gleichzeitig die Kosten für die Nutzung deines eigenen Schlüssels transparent bei dir liegen.

### Warum dieser Schritt?

Diese Neuerung macht den ChessTrax zu einem wesentlich mächtigeren und flexibleren Werkzeug. Du bist nicht mehr von meinem kostenlosen Kontingent abhängig und kannst die Analyse mit den stärksten verfügbaren KI-Modellen durchführen, wenn du das möchtest. Es ist ein entscheidender Schritt, um die App zukunftssicher und anpassbar für die Wünsche der Community zu machen.

Ich bin unglaublich gespannt auf euer Feedback zu diesem Feature! Probiert es aus, testet die verschiedenen Modelle und berichtet mir von euren Erfahrungen.

Auf viele aufschlussreiche Analysen!
