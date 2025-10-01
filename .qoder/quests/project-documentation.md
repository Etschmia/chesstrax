# ChessTrax - Help & About Feature Design

## Overview

This design document outlines the implementation of Help and About functionality for the ChessTrax application. The features will add two new interactive components: a Help button providing user assistance and an About button containing application information, version details, support links, and an update mechanism.

**Key Features:**
- Help button with comprehensive user guidance
- About dialog with app information, version, build details, and links
- Auto-update functionality with server version checking
- Full multilingual support (German, English, Armenian)
- Consistent UI/UX with existing design system

## Technology Stack & Dependencies

**Core Technologies:**
- React 19.1.0 with TypeScript
- react-i18next for internationalization
- lucide-react for icons
- Vite 6.2.0 for build system

**New Dependencies Required:**
```json
{
  "axios": "^1.6.0"  // For HTTP requests to check server version
}
```

## Component Architecture

### Component Hierarchy

```
App.tsx
├── Header Section
│   ├── Language Switcher
│   ├── API Key Manager Button  
│   ├── LLM Provider Button
│   ├── Help Button (NEW)
│   └── About Button (NEW)
├── Help Dialog (NEW)
├── About Dialog (NEW)
└── Existing Components...
```

### Component Definitions

#### HelpDialog Component

**Location:** `components/HelpDialog.tsx`

**Props Interface:**
```typescript
interface HelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**State Management:**
- Dialog visibility state managed by parent App component
- Content sections expandable/collapsible for better UX
- Search functionality for help content (optional enhancement)

**Content Structure:**
- Getting Started section
- Lichess Integration guide
- PGN Upload instructions
- Understanding Analysis Results
- Troubleshooting section
- FAQ section

#### AboutDialog Component

**Location:** `components/AboutDialog.tsx`

**Props Interface:**
```typescript
interface AboutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface VersionInfo {
  currentVersion: string;
  buildDate: string;
  buildTime: string;
}

interface UpdateStatus {
  checking: boolean;
  available: boolean;
  installing: boolean;
  error: string | null;
  success: boolean;
}
```

**State Management:**
- Version information loaded from build-time metadata
- Update status with loading, success, and error states
- Server communication status tracking

**Content Sections:**
- App name and current version display
- Build date and time information
- Homepage link (GitHub repository)
- PayPal support link
- Update mechanism with status feedback

#### VersionService

**Location:** `services/versionService.ts`

**Interface:**
```typescript
interface IVersionService {
  getCurrentVersion(): Promise<VersionInfo>;
  checkForUpdates(): Promise<{available: boolean; latestVersion: string}>;
  performUpdate(): Promise<void>;
}
```

**Implementation Strategy:**
- Check server endpoint for latest version information
- Compare semantic versions (current vs. latest)
- Handle network errors gracefully
- Progressive Web App update mechanism integration

## Routing & Navigation

**Dialog Management:**
- Modal overlay approach consistent with existing Settings and API Key dialogs
- Keyboard navigation support (ESC to close)
- Focus management for accessibility
- Click-outside-to-close functionality

**Button Placement:**
- Help button: Header section, positioned between existing buttons
- About button: Header section, positioned at the end
- Consistent styling with existing header buttons
- Responsive layout considerations for mobile devices

## State Management Integration

### App Component State Extensions

```typescript
// Add to existing App component state
const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false);
```

### Hook Integration

**New Custom Hook:** `useVersionInfo`

```typescript
interface UseVersionInfoReturn {
  versionInfo: VersionInfo;
  updateStatus: UpdateStatus;
  checkForUpdates: () => Promise<void>;
  performUpdate: () => Promise<void>;
}
```

## API Integration Layer

### Version Check Endpoint

**Server Endpoint Design:**
```
GET /api/version
Response: {
  "latest": "0.3.0",
  "current": "0.2.0", 
  "updateAvailable": true,
  "downloadUrl": "...",
  "changelog": "..."
}
```

**Error Handling:**
- Network connectivity issues
- Server unavailable scenarios
- Invalid response format handling
- Timeout management

### Update Mechanism

**Implementation Approach:**
1. Service Worker based update for PWA compatibility
2. Browser cache invalidation strategies
3. User notification system for update completion
4. Rollback mechanism for failed updates

## Internationalization Strategy

### Translation Keys Structure

**Help Dialog Keys:**
```json
{
  "help": {
    "title": "Help & Support",
    "gettingStarted": {
      "title": "Getting Started",
      "content": "..."
    },
    "lichessIntegration": {
      "title": "Lichess Integration", 
      "content": "..."
    },
    "pgnUpload": {
      "title": "PGN File Upload",
      "content": "..."
    },
    "analysisResults": {
      "title": "Understanding Your Analysis",
      "content": "..."
    },
    "troubleshooting": {
      "title": "Troubleshooting",
      "content": "..."
    },
    "faq": {
      "title": "Frequently Asked Questions",
      "content": "..."
    }
  }
}
```

**About Dialog Keys:**
```json
{
  "about": {
    "title": "About ChessTrax",
    "version": "Version",
    "buildDate": "Build Date", 
    "buildTime": "Build Time",
    "homepage": "Homepage",
    "support": "Support the Project",
    "update": {
      "checkForUpdates": "Check for Updates",
      "checking": "Checking for updates...",
      "upToDate": "You are using the latest version",
      "updateAvailable": "Update available",
      "installing": "Installing update...",
      "success": "Update installed successfully",
      "error": "Update failed",
      "serverUnavailable": "Update server unavailable"
    }
  }
}
```

### Multi-language Content Management

**Content Localization:**
- Help content tailored for each supported language
- Technical terms consistently translated
- Cultural context considerations for support mechanisms
- Right-to-left layout support preparation (future)

## Testing Strategy

### Component Testing

**HelpDialog Tests:**
- Rendering with different content sections
- Navigation between help topics
- Search functionality (if implemented)
- Keyboard accessibility
- Screen reader compatibility

**AboutDialog Tests:**
- Version information display
- Update mechanism functionality
- Network error handling
- Loading state management
- Link functionality verification

### Integration Testing

**Version Service Tests:**
- API endpoint communication
- Update process flow
- Error scenario handling
- Network offline behavior
- Cache invalidation verification

### User Acceptance Testing

**Test Scenarios:**
1. First-time user help discovery
2. Version checking with different network conditions
3. Update process user experience
4. Multi-language switching behavior
5. Mobile device responsiveness

## Build System Integration

### Version Management

**Build-time Version Injection:**
```typescript
// vite.config.ts enhancement
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().split('T')[0]),
    __BUILD_TIME__: JSON.stringify(new Date().toTimeString().split(' ')[0])
  }
})
```

**Metadata Generation:**
- Automatic version extraction from package.json
- Build timestamp generation
- Git commit hash inclusion (optional)
- Environment-specific build markers

### Deployment Considerations

**Update Delivery Mechanism:**
- Service Worker cache invalidation
- Progressive download strategies
- Rollback capabilities
- Update notification system

## UI Architecture & Styling

### Design System Consistency

**Color Palette Usage:**
- Primary buttons: accent color (#your-accent-color)
- Secondary actions: text-secondary color
- Error states: red variants
- Success states: green variants
- Background: existing gray-secondary/tertiary

**Typography Scale:**
- Dialog titles: text-xl font-bold
- Section headers: text-lg font-semibold  
- Body content: text-base
- Metadata: text-sm text-secondary

### Responsive Design

**Breakpoint Behavior:**
- Mobile (< 640px): Full-screen dialogs with scroll
- Tablet (640px - 1024px): Modal dialogs with margins
- Desktop (> 1024px): Centered modal dialogs

**Touch Interaction:**
- Minimum 44px touch targets
- Gesture support for dialog dismissal
- Scroll behavior optimization for mobile

## Security Considerations

### Update Security

**Verification Mechanisms:**
- HTTPS-only update endpoints
- Content integrity verification
- Digital signature validation (future enhancement)
- Sandboxed update execution

**Privacy Protection:**
- No personal data transmission during version checks
- Anonymous usage analytics (optional)
- User consent for automatic updates
- Data retention policies for update logs














































































































































































































































































































































































