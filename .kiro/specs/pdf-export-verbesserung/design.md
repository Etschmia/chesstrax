# Design Document

## Overview

Das Design für die PDF-Export-Verbesserung fokussiert sich auf die Erstellung eines druckfreundlichen PDFs mit weißem Hintergrund und intelligenter A4-Seitenaufteilung. Die Lösung nutzt eine Kombination aus CSS-Medienabfragen für Print-Styling und erweiterte jsPDF-Funktionalität für bessere Seitenkontrolle.

## Architecture

### Current State Analysis
- Aktuell verwendet die Anwendung `html2canvas` + `jsPDF` für PDF-Generierung
- Das PDF wird als Screenshot der Web-Ansicht erstellt mit dunklem Hintergrund (`#262421`)
- Keine Seitenkontrolle oder intelligente Umbrüche
- Feste Canvas-Größe ohne A4-Optimierung

### Proposed Architecture
Die Lösung implementiert einen zweistufigen Ansatz:

1. **Print-optimierte Styling-Schicht**: CSS-Klassen und Medienabfragen für druckfreundliche Darstellung
2. **Erweiterte PDF-Generierung**: Verbesserte jsPDF-Konfiguration mit A4-Format und intelligenten Seitenumbrüchen

## Components and Interfaces

### 1. Print Styling System

**PrintStyleProvider Component**
```typescript
interface PrintStyleProviderProps {
  children: React.ReactNode;
  isPrintMode: boolean;
}
```

**CSS Print Classes**
- `.print-mode`: Aktiviert Print-Styling
- `.print-white-bg`: Weißer Hintergrund für Print
- `.print-dark-text`: Dunkler Text für Print
- `.print-page-break`: Erzwingt Seitenumbruch
- `.print-avoid-break`: Verhindert Seitenumbruch innerhalb des Elements

### 2. Enhanced PDF Generator

**PdfGenerator Service**
```typescript
interface PdfGeneratorConfig {
  format: 'a4';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  pageBreakStrategy: 'auto' | 'manual';
}

interface PdfGeneratorService {
  generatePdf(element: HTMLElement, config: PdfGeneratorConfig): Promise<void>;
  calculateOptimalBreaks(element: HTMLElement): BreakPoint[];
}
```

### 3. Modified AnalysisReport Component

**Enhanced Export Functionality**
```typescript
interface AnalysisReportProps {
  // ... existing props
  printMode?: boolean;
}

// New methods
const handleDownloadPrintFriendlyPdf = async () => {
  // Aktiviert Print-Modus
  // Generiert PDF mit A4-Format
  // Implementiert intelligente Seitenumbrüche
}
```

## Data Models

### Print Configuration
```typescript
interface PrintConfig {
  backgroundColor: '#ffffff';
  textColor: '#1a1a1a';
  accentColor: '#2563eb'; // Druckfreundliches Blau
  margins: {
    top: 20; // mm
    right: 15; // mm  
    bottom: 20; // mm
    left: 15; // mm
  };
  pageSize: {
    width: 210; // mm (A4)
    height: 297; // mm (A4)
  };
}
```

### Break Point Detection
```typescript
interface BreakPoint {
  elementId: string;
  yPosition: number;
  breakType: 'section' | 'card' | 'list-item';
  priority: 'high' | 'medium' | 'low';
}
```

## Error Handling

### PDF Generation Errors
1. **Canvas Rendering Fehler**: Fallback auf vereinfachtes Layout
2. **Memory Limits**: Chunked Processing für große Inhalte  
3. **Browser Compatibility**: Feature Detection und Graceful Degradation

### Print Styling Errors
1. **CSS Load Failures**: Inline Fallback-Styles
2. **Font Loading Issues**: System Font Fallbacks

## Testing Strategy

### Unit Tests
- PdfGenerator Service Funktionalität
- Print Style Provider Komponente
- Break Point Detection Algorithmus

### Integration Tests  
- End-to-End PDF Generation
- Print Mode Aktivierung/Deaktivierung
- Cross-Browser Kompatibilität

### Visual Regression Tests
- PDF Output Vergleich
- Print Preview Darstellung
- Responsive Verhalten

## Implementation Details

### Phase 1: Print Styling System
1. CSS Print Media Queries implementieren
2. Print-spezifische Farbschema definieren
3. PrintStyleProvider Komponente erstellen

### Phase 2: Enhanced PDF Generation
1. jsPDF Konfiguration für A4-Format erweitern
2. Intelligente Break Point Detection implementieren
3. Multi-Page PDF Support hinzufügen

### Phase 3: UI Integration
1. AnalysisReport Komponente erweitern
2. Print Mode Toggle implementieren
3. Enhanced Loading States hinzufügen

## Technical Considerations

### Performance Optimizations
- Lazy Loading der PDF-Bibliotheken (bereits implementiert)
- Canvas Rendering Optimierung
- Memory Management für große PDFs

### Browser Compatibility
- Modern Browser Support (Chrome 80+, Firefox 75+, Safari 13+)
- Feature Detection für PDF APIs
- Graceful Degradation für ältere Browser

### Accessibility
- High Contrast Print Mode
- Screen Reader kompatible PDF Struktur
- Keyboard Navigation während PDF Generation

## Print-Specific Styling Rules

### Color Mapping
```css
.print-mode {
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-tertiary: #e9ecef;
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --accent: #0d6efd;
  --border: #dee2e6;
}
```

### Typography Adjustments
- Schriftgröße: Optimiert für 300 DPI Druck
- Zeilenhöhe: Erhöht für bessere Lesbarkeit
- Schriftgewicht: Angepasst für Druckmedium

### Layout Modifications
- Entfernung von Schatten und Gradienten
- Vereinfachte Border-Styles
- Optimierte Abstände für A4-Format