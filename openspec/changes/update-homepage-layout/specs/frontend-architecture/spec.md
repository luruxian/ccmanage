## MODIFIED Requirements
### Requirement: Homepage Layout and User Experience
The homepage SHALL use a two-column layout with a header section and main content area, providing clear information hierarchy and improved user experience. The login form SHALL be accessible through a button in the header via a modal dialog, rather than occupying the main content area.

#### Scenario: User visits homepage
- **WHEN** a user navigates to the application root URL
- **THEN** they see a two-column layout with header at the top
- **AND** the main content area displays Claude Code introduction and features
- **AND** a login button is visible in the header section

#### Scenario: User accesses login functionality
- **WHEN** a user clicks the login button in the header
- **THEN** a modal dialog opens with the login form
- **AND** the user can enter credentials and submit the form
- **AND** upon successful login, the modal closes and user is redirected to dashboard

#### Scenario: Responsive homepage layout
- **WHEN** a user accesses the homepage on mobile devices
- **THEN** the layout adapts to single column for better mobile experience
- **AND** the header remains accessible with responsive navigation
- **AND** the login modal is optimized for mobile interaction

### Requirement: UI Component Consistency
All homepage components SHALL use shadcn/ui components for consistent styling and behavior, following the established design system.

#### Scenario: Header component implementation
- **WHEN** the header is rendered
- **THEN** it uses shadcn NavigationMenu for navigation items
- **AND** uses shadcn Button for the login action
- **AND** follows design system spacing and typography

#### Scenario: Login modal implementation
- **WHEN** the login modal is opened
- **THEN** it uses shadcn Dialog component for the modal container
- **AND** uses shadcn Form, Input, and Label components for the form
- **AND** includes proper validation and error states

#### Scenario: Content section implementation
- **WHEN** the introduction content is displayed
- **THEN** it uses shadcn Card components for feature highlights
- **AND** uses shadcn Typography for text content
- **AND** uses shadcn Badge for feature tags
- **AND** follows consistent spacing and color scheme