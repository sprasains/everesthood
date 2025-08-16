# Everesthood Design System

## Overview

The Everesthood Design System provides a comprehensive set of design tokens, components, and guidelines for building consistent, accessible, and beautiful user interfaces. This system is built on top of Material-UI (MUI) and Tailwind CSS, with custom theming and components.

## Design Tokens

### Colors

#### Primary Palette
- **Primary**: `#8b5cf6` (Purple) - Main brand color
- **Primary Light**: `#a855f7` - Lighter variant
- **Primary Dark**: `#7c3aed` - Darker variant
- **Secondary**: `#06b6d4` (Cyan) - Accent color
- **Secondary Light**: `#0891b2` - Lighter variant

#### Neutral Palette
- **Background**: `#0f172a` (Slate 900) - Main background
- **Surface**: `#1e293b` (Slate 800) - Card backgrounds
- **Border**: `#334155` (Slate 700) - Borders and dividers
- **Text Primary**: `#f8fafc` (Slate 50) - Primary text
- **Text Secondary**: `#cbd5e1` (Slate 300) - Secondary text
- **Text Muted**: `#64748b` (Slate 500) - Muted text

#### Status Colors
- **Success**: `#10b981` (Emerald 500)
- **Warning**: `#f59e0b` (Amber 500)
- **Error**: `#ef4444` (Red 500)
- **Info**: `#3b82f6` (Blue 500)

#### Subscription Tiers
- **Free**: `#64748b` (Slate 500)
- **Premium**: `#f59e0b` (Amber 500)
- **Creator**: `#8b5cf6` (Purple 500)

### Typography

#### Font Family
- **Primary**: `Inter` - Modern, clean sans-serif
- **Fallback**: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

#### Font Sizes
- **xs**: `0.75rem` (12px)
- **sm**: `0.875rem` (14px)
- **base**: `1rem` (16px)
- **lg**: `1.125rem` (18px)
- **xl**: `1.25rem` (20px)
- **2xl**: `1.5rem` (24px)
- **3xl**: `1.875rem` (30px)
- **4xl**: `2.25rem` (36px)

#### Font Weights
- **Light**: `300`
- **Normal**: `400`
- **Medium**: `500`
- **Semibold**: `600`
- **Bold**: `700`
- **Extrabold**: `800`

### Spacing

#### Base Units
- **xs**: `0.25rem` (4px)
- **sm**: `0.5rem` (8px)
- **md**: `1rem` (16px)
- **lg**: `1.5rem` (24px)
- **xl**: `2rem` (32px)
- **2xl**: `3rem` (48px)
- **3xl**: `4rem` (64px)

### Border Radius

- **sm**: `0.25rem` (4px)
- **md**: `0.5rem` (8px)
- **lg**: `0.75rem` (12px)
- **xl**: `1rem` (16px)
- **2xl**: `1.5rem` (24px)
- **full**: `9999px`

### Shadows

#### Elevation Levels
- **sm**: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
- **md**: `0 4px 6px -1px rgba(0, 0, 0, 0.1)`
- **lg**: `0 10px 15px -3px rgba(0, 0, 0, 0.1)`
- **xl**: `0 20px 25px -5px rgba(0, 0, 0, 0.1)`
- **2xl**: `0 25px 50px -12px rgba(0, 0, 0, 0.25)`

#### Special Shadows
- **Primary Glow**: `0 4px 12px rgba(139, 92, 246, 0.3)`
- **Glass**: `0 8px 32px rgba(0, 0, 0, 0.1)`

### Animations

#### Transitions
- **Fast**: `0.15s ease-in-out`
- **Normal**: `0.2s ease-in-out`
- **Slow**: `0.3s ease-in-out`

#### Keyframes
- **Fade In**: `opacity: 0 → 1`
- **Slide Up**: `transform: translateY(20px) → translateY(0)`
- **Scale**: `transform: scale(0.95) → scale(1)`
- **Float**: `transform: translateY(0px) rotate(0deg) → translateY(-20px) rotate(180deg)`

## Components

### Layout Components

#### AppLayoutShell
The main layout wrapper that provides:
- Responsive sidebar and navbar
- Authentication state handling
- Beautiful landing page for non-authenticated users
- Proper spacing and container management

**Usage:**
```tsx
<AppLayoutShell>
  <YourPageContent />
</AppLayoutShell>
```

#### AppSidebar
Modern sidebar with:
- User profile section with XP progress
- Organized navigation sections
- Active state indicators
- Hover animations
- Responsive design

**Features:**
- User avatar and subscription badge
- XP progress bar
- Organized navigation sections
- Smooth hover effects
- Active page highlighting

#### Navbar
Enhanced top navigation with:
- Brand logo with animations
- Main navigation shortcuts
- User welcome message
- Subscription tier indicators
- Action buttons (upgrade, notifications, etc.)

**Features:**
- Dynamic styling based on subscription tier
- Responsive design
- Smooth animations
- Comprehensive dropdown menu

### UI Components

#### Card
Versatile card component with multiple variants and sizes.

**Variants:**
- `default` - Standard card with border
- `elevated` - Card with shadow
- `outlined` - Transparent with border
- `glass` - Glassmorphism effect

**Sizes:**
- `sm` - Small padding
- `md` - Medium padding (default)
- `lg` - Large padding

**Usage:**
```tsx
<Card
  title="Card Title"
  subtitle="Card subtitle"
  variant="elevated"
  size="md"
  headerAction={<Button>Action</Button>}
  footer={<Button>Footer Action</Button>}
>
  Card content goes here
</Card>
```

#### Modal
Standardized modal component with consistent styling.

**Variants:**
- `default` - Standard modal
- `glass` - Glassmorphism effect
- `minimal` - Minimal styling

**Sizes:**
- `sm` - 400px max width
- `md` - 600px max width (default)
- `lg` - 900px max width
- `xl` - 1200px max width

**Usage:**
```tsx
<Modal
  title="Modal Title"
  subtitle="Modal subtitle"
  size="md"
  variant="glass"
  actions={{
    primary: {
      label: "Save",
      onClick: handleSave,
      loading: isLoading
    },
    cancel: {
      label: "Cancel",
      onClick: handleCancel
    }
  }}
  onClose={handleClose}
>
  Modal content goes here
</Modal>
```

## Guidelines

### Layout Principles

1. **Consistent Spacing**: Use the defined spacing scale for all margins and padding
2. **Responsive Design**: All components should work across all screen sizes
3. **Accessibility**: Follow WCAG guidelines for color contrast and keyboard navigation
4. **Performance**: Use efficient animations and avoid layout shifts

### Color Usage

1. **Primary Color**: Use for main actions, links, and brand elements
2. **Secondary Color**: Use for accents and secondary actions
3. **Neutral Colors**: Use for backgrounds, borders, and text
4. **Status Colors**: Use sparingly for feedback and alerts

### Typography Guidelines

1. **Hierarchy**: Use font sizes to establish clear information hierarchy
2. **Readability**: Ensure sufficient contrast and line height
3. **Consistency**: Use consistent font weights and sizes across similar elements

### Animation Guidelines

1. **Purposeful**: Only animate elements that provide value to the user
2. **Smooth**: Use easing functions for natural motion
3. **Fast**: Keep animations under 300ms for responsiveness
4. **Reduced Motion**: Respect user preferences for reduced motion

### Component Guidelines

1. **Composition**: Build complex components from simple, reusable pieces
2. **Props**: Use consistent prop naming and types
3. **Styling**: Use the design system tokens for all styling
4. **Documentation**: Document all props and usage examples

## Implementation

### Theme Configuration

The design system is implemented through:
- **Tailwind Config**: Custom colors, spacing, and utilities
- **MUI Theme**: Material-UI theme with custom palette and components
- **Global CSS**: Font loading and utility classes

### File Structure

```
app/
├── components/
│   ├── layout/
│   │   ├── AppLayoutShell.tsx
│   │   ├── AppSidebar.tsx
│   │   └── Navbar.tsx
│   └── ui/
│       ├── Card.tsx
│       └── Modal.tsx
├── globals.css
└── layout.tsx
lib/
└── lib/
    └── theme.ts
tailwind.config.ts
```

### Usage Examples

#### Basic Page Structure
```tsx
export default function MyPage() {
  return (
    <AppLayoutShell>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Page Title
        </Typography>
        
        <Card title="Section Title" variant="elevated">
          Content goes here
        </Card>
      </Box>
    </AppLayoutShell>
  );
}
```

#### Form with Modal
```tsx
const [isModalOpen, setIsModalOpen] = useState(false);

return (
  <>
    <Button onClick={() => setIsModalOpen(true)}>
      Open Modal
    </Button>
    
    <Modal
      title="Form Title"
      open={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      actions={{
        primary: {
          label: "Submit",
          onClick: handleSubmit,
          loading: isLoading
        },
        cancel: {
          onClick: () => setIsModalOpen(false)
        }
      }}
    >
      <form>
        {/* Form content */}
      </form>
    </Modal>
  </>
);
```

## Shared Components Usage Examples

### SecretInput
```tsx
import SecretInput from '@/components/SecretInput';
<SecretInput label="API Key" value={apiKey} onChange={setApiKey} />
```
- Use for credential capture in modals and forms.
- Always redact secrets in debug panels and logs.

### JsonViewer
```tsx
import JsonViewer from '@/components/JsonViewer';
<JsonViewer data={payload} />
```
- Use for displaying technical details, debug payloads, and API responses.

### RunProgress
```tsx
import RunProgress from '@/components/RunProgress';
<RunProgress result={testRunResult} />
```
- Use for streaming agent run progress and showing test run results.

### Agent Template Form Pattern
- Use `react-hook-form` + Zod for validation and helper text.
- Provide example values and error toasts.
- Add a "Test run" button for optimistic feedback.
- Include a debug panel toggle to show the final payload (secrets redacted).
- Use skeletons and empty states for loading and no data.

#### Example
```tsx
<AgentTemplateForm onSubmit={handleCreate} />
```

See `app/agents/templates/AgentTemplateForm.tsx` for a full implementation.

## Best Practices

1. **Consistency**: Always use design system components and tokens
2. **Accessibility**: Test with screen readers and keyboard navigation
3. **Performance**: Optimize animations and avoid unnecessary re-renders
4. **Maintainability**: Keep components simple and well-documented
5. **Scalability**: Design components to work in various contexts

## Future Enhancements

- [ ] Dark/Light theme toggle
- [ ] Component library documentation site
- [ ] Design tokens export for design tools
- [ ] Accessibility audit and improvements
- [ ] Performance optimization guidelines
- [ ] Component testing examples