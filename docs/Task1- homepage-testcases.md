# Homepage Test Cases

This document converts the original `homepage-testcases.txt` into Markdown format.

| Test Case | Description | Automate | Suite | Reason |
| --- | --- | --- | --- | --- |
| TC1 | Verify homepage loads successfully and returns HTTP 200 response. | Yes | Smoke | Basic application availability check. |
| TC2 | Verify logo, navigation menu, search box, login and signup links are visible on homepage. | Yes | Smoke | Critical UI elements validation. |
| TC3 | Verify clicking the site logo redirects users to the homepage. | Yes | Sanity | Standard navigation behavior. |
| TC4 | Verify main navigation category links are visible and open correct category pages. | Yes | Sanity | Core navigation functionality. |
| TC5 | Verify search input placeholder text and focus behavior. | Yes | Sanity | Basic usability validation. |
| TC6 | Verify relevant search suggestions are displayed while typing in the search box. | Yes | Integration | Validates search UI and backend interaction. |
| TC7 | Verify search with valid keyword returns relevant results. | Yes | Smoke | Core business functionality. |
| TC8 | Verify search with empty input behaves as expected (no results or validation message). | Yes | Regression | Input validation edge case. |
| TC9 | Verify search with special characters does not break UI or system behavior. | Yes | Regression | Input robustness validation. |
| TC10 | Verify search with no matching results displays appropriate message. | Yes | Regression | Negative scenario handling. |
| TC11 | Verify featured listings render with image, title and details correctly. | Yes | Regression | Content rendering stability. |
| TC12 | Verify featured listing or search result links redirect to correct detail page. | Yes | Integration | End-to-end navigation validation. |
| TC13 | Verify trending categories section is displayed and category links are clickable. | Yes | Sanity | Category discovery functionality. |
| TC14 | Verify footer links navigate to correct pages. | Yes | Sanity | Secondary navigation validation. |
| TC15 | Verify login and register links navigate correctly to authentication pages. | Yes | Smoke | Critical user entry points. |
| TC16 | Verify cookie/privacy banner behavior and persistence after acceptance. | Yes | Regression | Compliance and user preference validation. |
| TC17 | Verify responsive layout across desktop, tablet and mobile viewports. | Partial Automation | Regression | Cross-device usability validation. |
| TC18 | Verify application layout works correctly on very small viewport (320px width). | Yes | Regression | Extreme responsive edge case validation. |
| TC19 | Verify accessibility checks such as labels, keyboard navigation and ARIA roles. | Yes | Regression | Accessibility and usability compliance. |
| TC20 | Verify homepage does not display broken images or missing content. | Yes | Regression | Content quality validation. |
