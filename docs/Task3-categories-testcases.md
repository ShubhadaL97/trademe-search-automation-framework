# Categories API Test Cases

This document lists all test cases defined in `tests/API/categories.spec.ts`.

| Test Case | Description |
| --- | --- |
| API-CAT-01 | Should retrieve all categories successfully |
| API-CAT-02 | Response should contain valid category structure |
| API-CAT-03 | Each category should have correct data types |
| API-CAT-04 | Category numbers should be unique |
| API-CAT-05 | Category names should not be empty |
| API-CAT-06 | Category paths should follow expected format |
| API-CAT-07 | Subcategories should have same structure as categories |
| API-CAT-08 | Response headers should include content type |
| API-CAT-09 | Response should include cache control headers |
| API-CAT-10 | Categories count should be consistent across requests |
| API-CAT-11 | Should handle invalid endpoint gracefully |
| API-CAT-12 | Should reject unsupported HTTP methods |
| API-CAT-13 | Should handle malformed query parameters gracefully |
| API-CAT-14 | Should handle rapid successive requests |
| API-CAT-15 | Response should be consistent regardless of request order |
| API-CAT-16 | Should handle large result sets efficiently |
| API-CAT-17 | Nested subcategories should maintain hierarchy |
| API-CAT-18 | Should not expose sensitive information in response |
| API-CAT-19 | Should prevent SQL injection via query parameters |
| API-CAT-20 | Should prevent XSS via response data |
| API-CAT-21 | Should handle special characters safely |
| API-CAT-22 | Should use HTTPS only |
| API-CAT-23 | Should return response within acceptable time |
| API-CAT-24 | Should maintain consistent performance across requests |
| API-CAT-25 | Response size should be reasonable |
| API-CAT-26 | All category numbers should be strings |
| API-CAT-27 | Category names and paths should uniquely identify items |
| API-CAT-28 | Category paths should not contain invalid characters |
| API-CAT-29 | Response should include version information if available |
| API-CAT-30 | Should parse JSON response without errors |
| API-CAT-31 | Response should follow REST conventions |
| API-CAT-32 | Should handle Accept-Language header gracefully |
| API-CAT-33 | Should return consistent structure for empty vs populated results |
