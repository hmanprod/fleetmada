# Agent-Browser Integration Guide

Comprehensive guide for using agent-browser commands effectively in QA automation workflows.

## Core Commands

### Navigation Commands

#### `agent-browser open <URL>`
**Purpose**: Load a web application page
**Usage**: Initial page load or navigation to specific URLs
**Example**: `agent-browser open https://staging.example.com/login`

**Best Practices**:
- Always use staging/sandbox URLs, never production
- Ensure URL is accessible and doesn't require VPN
- Wait for page load completion before next command

#### `agent-browser snapshot`
**Purpose**: Capture current page state and identify interactive elements
**Usage**: After page loads or state changes
**Returns**: Page summary and element inventory

**Best Practices**:
- Take snapshot after every significant page change
- Use snapshots to identify interaction opportunities
- Capture before and after states for comparisons

### Interaction Commands

#### `agent-browser click @e<ID>`
**Purpose**: Click on interactive elements (buttons, links, etc.)
**Usage**: Trigger actions, navigate, submit forms
**Example**: `agent-browser click @e3`

**Element Selection Strategy**:
- Prioritize primary action buttons (Submit, Login, Save)
- Test navigation elements (menus, links)
- Interact with secondary actions (Cancel, Reset)
- Avoid destructive actions without confirmation

#### `agent-browser fill @e<ID> "value"`
**Purpose**: Enter text into input fields
**Usage**: Form completion, search queries, data entry
**Example**: `agent-browser fill @e1 "test@example.com"`

**Input Strategy**:
- Use realistic test data
- Test both valid and invalid inputs
- Include edge cases (empty, max length, special characters)
- Respect field types (email, phone, date formats)

## Exploration Patterns

### Breadth-First Exploration
```
1. agent-browser open <start_url>
2. agent-browser snapshot
3. Identify all interactive elements
4. Queue interactions by priority
5. Execute interactions systematically
6. Capture results after each interaction
```

### Depth-First Workflow Testing
```
1. Focus on specific user journey
2. Follow complete workflow path
3. Test variations and edge cases
4. Document workflow efficiency
5. Identify bottlenecks and issues
```

### Form-Focused Testing
```
1. Identify all form fields
2. Test field validation rules
3. Test form submission scenarios
4. Verify error handling
5. Check success confirmations
```

## State Management

### Capturing Application State
- **Before Interaction**: Always snapshot before major actions
- **After Interaction**: Capture results and new state
- **Error States**: Document unexpected behaviors
- **Success States**: Confirm expected outcomes

### Session Management
- **Login Flows**: Handle authentication requirements
- **Session Persistence**: Maintain login state across pages
- **Logout Testing**: Test session termination
- **Timeout Handling**: Test session expiration scenarios

## Error Detection Strategies

### Visual Error Indicators
- Error messages in red text
- Alert boxes or notifications
- Form field highlighting
- Broken layouts or missing content

### Functional Error Patterns
- Buttons that don't respond
- Forms that don't submit
- Navigation that leads nowhere
- Unexpected page redirects

### Performance Issues
- Slow page loads (>3 seconds)
- Unresponsive interactions
- Missing loading indicators
- Timeout errors

## Data Collection Best Practices

### Screen Documentation
```json
{
  "url": "current_page_url",
  "timestamp": "iso_timestamp",
  "actions_taken": ["list", "of", "actions"],
  "elements_found": [
    {
      "id": "element_id",
      "type": "element_type",
      "label": "element_label",
      "state": "enabled/disabled"
    }
  ],
  "errors_detected": ["list", "of", "errors"],
  "ux_observations": ["list", "of", "ux_issues"]
}
```

### Interaction Logging
- Record every command executed
- Capture command results and responses
- Note timing and performance
- Document unexpected behaviors

## Common Pitfalls and Solutions

### Authentication Challenges
**Problem**: Pages require login credentials
**Solution**: 
- Use provided test credentials
- Focus on public/demo areas when possible
- Document authentication requirements

### Dynamic Content
**Problem**: Content changes between snapshots
**Solution**:
- Wait for content to stabilize
- Focus on static elements first
- Document dynamic behavior patterns

### Complex Interactions
**Problem**: Multi-step workflows are complex
**Solution**:
- Break into smaller interaction sequences
- Document intermediate states
- Test partial completion scenarios

### Performance Limitations
**Problem**: Slow page responses affect testing
**Solution**:
- Allow adequate wait times
- Focus on critical path testing
- Document performance issues

## Integration with QA Workflow

### Pre-Exploration Setup
1. Verify target URL accessibility
2. Prepare test credentials if needed
3. Define exploration scope and goals
4. Set up result capture mechanisms

### During Exploration
1. Follow systematic exploration pattern
2. Document findings in real-time
3. Prioritize critical functionality
4. Capture evidence of issues found

### Post-Exploration Analysis
1. Compile comprehensive findings report
2. Categorize issues by severity
3. Generate actionable test cases
4. Create improvement recommendations

## Command Sequencing Examples

### Login Flow Testing
```bash
agent-browser open https://app.example.com/login
agent-browser snapshot
agent-browser fill @e1 "testuser@example.com"
agent-browser fill @e2 "password123"
agent-browser click @e3
agent-browser snapshot
```

### Navigation Testing
```bash
agent-browser open https://app.example.com/dashboard
agent-browser snapshot
agent-browser click @e5  # Main menu
agent-browser snapshot
agent-browser click @e7  # Submenu item
agent-browser snapshot
```

### Form Validation Testing
```bash
agent-browser open https://app.example.com/register
agent-browser snapshot
agent-browser fill @e1 "invalid-email"
agent-browser click @e4  # Submit
agent-browser snapshot  # Capture validation errors
agent-browser fill @e1 "valid@example.com"
agent-browser click @e4  # Submit
agent-browser snapshot  # Capture success state
```

## Troubleshooting Guide

### Element Not Found
- Take fresh snapshot to get current element IDs
- Check if page has fully loaded
- Verify element is visible and interactable

### Interaction Failures
- Confirm element is enabled
- Check for overlaying elements
- Verify correct element ID

### Unexpected Navigation
- Document the unexpected behavior
- Check for JavaScript redirects
- Verify URL changes match expectations

### Performance Issues
- Allow more time for page loads
- Check network connectivity
- Document slow response times

## Success Metrics

### Coverage Metrics
- **Page Coverage**: Percentage of accessible pages visited
- **Element Coverage**: Percentage of interactive elements tested
- **Workflow Coverage**: Percentage of user journeys completed

### Quality Metrics
- **Issues Found**: Number of bugs and UX problems identified
- **Test Cases Generated**: Number of actionable test cases created
- **Automation Feasibility**: Percentage of tests suitable for automation

### Efficiency Metrics
- **Time to Complete**: Total exploration time
- **Issues per Hour**: Rate of issue discovery
- **Coverage per Hour**: Rate of application coverage