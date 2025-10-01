# Implementation Plan

- [x] 1. Print-Styling-System implementieren
  - CSS Print Media Queries und Variablen für druckfreundliche Darstellung erstellen
  - Print-spezifische Farbschema definieren (weiß/schwarz statt dunkel)
  - CSS-Klassen für Print-Modus (.print-mode, .print-white-bg, .print-dark-text) implementieren
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. PrintStyleProvider Komponente erstellen
  - React-Komponente für Print-Modus-Management entwickeln
  - State-Management für Print-Modus-Aktivierung implementieren
  - CSS-Klassen dynamisch basierend auf Print-Modus anwenden
  - _Requirements: 1.1, 1.2_

- [x] 2.1 Unit Tests für PrintStyleProvider schreiben
  - Tests für Print-Modus-Aktivierung/Deaktivierung
  - Tests für CSS-Klassen-Anwendung
  - _Requirements: 1.1, 1.2_

- [x] 3. Enhanced PDF Generator Service entwickeln
  - PdfGeneratorService Klasse mit A4-Konfiguration erstellen
  - Intelligente Break Point Detection Algorithmus implementieren
  - Multi-Page PDF Support mit jsPDF hinzufügen
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 3.1 Break Point Detection implementieren
  - Algorithmus zur Erkennung optimaler Seitenumbrüche entwickeln
  - DOM-Analyse für Abschnittsgrenzen (ReportCard-Komponenten)
  - Schusterjungen-Vermeidung durch Element-Höhen-Berechnung
  - _Requirements: 2.2, 2.3_

- [x] 3.2 A4-Format-Optimierung implementieren
  - jsPDF-Konfiguration für A4-Seitenformat (210×297mm) einrichten
  - Ränder-Berechnung und -Anwendung implementieren
  - Canvas-Skalierung für optimale A4-Darstellung anpassen
  - _Requirements: 2.1, 2.4_

- [x] 3.3 Unit Tests für PDF Generator Service schreiben
  - Tests für Break Point Detection
  - Tests für A4-Format-Konfiguration
  - Mock-Tests für jsPDF-Integration
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 4. AnalysisReport Komponente erweitern
  - Print-Modus-Unterstützung in AnalysisReport hinzufügen
  - Neue handleDownloadPrintFriendlyPdf Methode implementieren
  - Print-spezifische Styling-Anwendung auf exportable-area
  - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2, 3.3_

- [x] 4.1 Print-Modus-Integration implementieren
  - PrintStyleProvider um AnalysisReport-Komponente wrappen
  - Print-Modus-State während PDF-Generierung aktivieren
  - Temporäre DOM-Manipulation für Print-optimierte Darstellung
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 4.2 Enhanced PDF-Export-Button implementieren
  - Bestehenden PDF-Export-Button erweitern oder ersetzen
  - Loading-States und Fehlerbehandlung verbessern
  - User Feedback während PDF-Generierung optimieren
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ]* 4.3 Integration Tests für AnalysisReport schreiben
  - End-to-End Tests für PDF-Generierung
  - Tests für Print-Modus-Aktivierung
  - Visual Regression Tests für PDF-Output
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [ ] 5. Link-Darstellung für PDF optimieren
  - Linkify-Komponente für Print-Modus erweitern
  - URLs als lesbare Text in PDF-Version darstellen
  - Link-Styling für Druckmedium anpassen
  - _Requirements: 3.3_

- [ ] 6. Error Handling und Fallbacks implementieren
  - Fehlerbehandlung für PDF-Generierung verbessern
  - Fallback auf ursprüngliche PDF-Methode bei Fehlern
  - User-freundliche Fehlermeldungen hinzufügen
  - _Requirements: 4.4_

- [ ]* 6.1 Error Handling Tests schreiben
  - Tests für verschiedene Fehlerszenarien
  - Tests für Fallback-Mechanismen
  - Tests für Fehlermeldungen
  - _Requirements: 4.4_

- [ ] 7. Performance-Optimierungen implementieren
  - Canvas-Rendering für große Inhalte optimieren
  - Memory Management für PDF-Generierung verbessern
  - Lazy Loading für Print-Styles implementieren
  - _Requirements: 2.1, 2.2_

- [ ] 8. Cross-Browser-Kompatibilität sicherstellen
  - Feature Detection für PDF-APIs implementieren
  - Browser-spezifische Anpassungen für Print-Styling
  - Graceful Degradation für ältere Browser
  - _Requirements: 1.1, 2.1, 4.4_

- [ ]* 8.1 Cross-Browser Tests implementieren
  - Tests für verschiedene Browser-Engines
  - Tests für Feature Detection
  - Tests für Fallback-Verhalten
  - _Requirements: 1.1, 2.1, 4.4_