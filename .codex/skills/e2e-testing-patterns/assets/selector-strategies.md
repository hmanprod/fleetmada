# Selector Strategies

## Preferred Order
1. Accessible role and name (`getByRole`, `findByRole`)
2. Label text (`getByLabelText`)
3. Visible text when stable and unique
4. `data-testid` / `data-cy`
5. CSS selectors (last resort)

## Rules
- Select elements the way users perceive them.
- Keep selector intent readable in test code.
- Do not couple selectors to styling classes.
- Avoid positional selectors like `nth-child`.

## Examples
- Good: `page.getByRole('button', { name: 'Save' })`
- Good: `cy.get('[data-cy="checkout-submit"]')`
- Bad: `cy.get('.btn.btn-primary:nth-child(3)')`
