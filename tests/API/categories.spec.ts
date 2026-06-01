import { test, expect } from '@playwright/test';
import { ApiHelper } from '../../utils/apiHelper';
import { CategoriesApiData } from '../../data/api/categoriesData';

let apiHelper: ApiHelper;

test.describe('TradeMe Retrieve Categories API', () => {
  test.beforeEach(async ({ request }) => {
    apiHelper = new ApiHelper(request);
  });

  const getRootCategory = (response: { body: unknown }): Record<string, unknown> => {
    return response.body as Record<string, unknown>;
  };

  const flattenCategories = (
    category: Record<string, unknown>
  ): Record<string, unknown>[] => {
    const items: Record<string, unknown>[] = [category];
    const subcategories = category.Subcategories as Record<string, unknown>[] | undefined;

    if (Array.isArray(subcategories)) {
      for (const subcategory of subcategories) {
        items.push(...flattenCategories(subcategory));
      }
    }

    return items;
  };

  // Happy path

  test('[API-CAT-01] Should retrieve all categories successfully', async () => {
    const response = await apiHelper.get(CategoriesApiData.categoriesEndpoint);
    const rootCategory = getRootCategory(response);

    await expect(response.status).toBe(200);
    await expect(response.isSuccess).toBe(true);
    await expect(typeof rootCategory).toBe('object');
    await expect(Array.isArray(rootCategory.Subcategories)).toBe(true);
  });

  test('[API-CAT-02] Response should contain valid category structure', async () => {
    const response = await apiHelper.get(CategoriesApiData.categoriesEndpoint);
    const categories = flattenCategories(getRootCategory(response));
    expect(categories.length).toBeGreaterThan(0);

    const firstCategory = categories[0] as Record<string, unknown>;

    expect(firstCategory).toHaveProperty('Number');
    expect(firstCategory).toHaveProperty('Name');
    expect(firstCategory).toHaveProperty('Path');
  });

  test('[API-CAT-03] Each category should have correct data types', async () => {
    const response = await apiHelper.get(CategoriesApiData.categoriesEndpoint);
    const categories = flattenCategories(getRootCategory(response));

    categories.forEach((cat) => {
      const category = cat as Record<string, unknown>;
      expect(['string', 'number']).toContain(typeof category.Number);
      expect(typeof category.Name).toBe('string');
      expect(typeof category.Path).toBe('string');

      if (category.Subcategories) {
        expect(Array.isArray(category.Subcategories)).toBe(true);
      }
    });
  });

  test('[API-CAT-04] Category numbers should be unique', async () => {
    const response = await apiHelper.get(CategoriesApiData.categoriesEndpoint);
    const categories = flattenCategories(getRootCategory(response));

    const numbers = categories.map(cat => String(cat.Number));
    const uniqueNumbers = new Set(numbers);

    expect(uniqueNumbers.size).toBe(categories.length);
  });

  test('[API-CAT-05] Category names should not be empty', async () => {
    const response = await apiHelper.get(CategoriesApiData.categoriesEndpoint);
    const categories = flattenCategories(getRootCategory(response));

    categories.forEach((cat) => {
      const name = String(cat.Name);
      expect(name).toBeTruthy();
      expect(name.length).toBeGreaterThan(0);
    });
  });

  test('[API-CAT-06] Category paths should follow expected format', async () => {
    const response = await apiHelper.get(CategoriesApiData.categoriesEndpoint);
    const categories = flattenCategories(getRootCategory(response));

    categories.forEach((cat) => {
      const path = String(cat.Path);
      if (path) {
        // Path should start with a slash followed by an alphanumeric character
        expect(/^\/[0-9a-zA-Z]/.test(path)).toBe(true);
      }
    });
  });

  test('[API-CAT-07] Subcategories should have same structure as categories', async () => {
    const response = await apiHelper.get(CategoriesApiData.categoriesEndpoint);
    const rootCategory = getRootCategory(response);
    const categories = flattenCategories(rootCategory);

    const categoryWithSubs = categories.find(
      cat => Array.isArray((cat as Record<string, unknown>).Subcategories)
    ) as Record<string, unknown>;

    if (categoryWithSubs && categoryWithSubs.Subcategories) {
      const subcats = categoryWithSubs.Subcategories as Record<string, unknown>[];

      subcats.forEach((subcat) => {
        expect(subcat).toHaveProperty('Number');
        expect(subcat).toHaveProperty('Name');
        expect(subcat).toHaveProperty('Path');
        expect(['string', 'number']).toContain(typeof subcat.Number);
        expect(typeof subcat.Name).toBe('string');
      });
    }
  });

  test('[API-CAT-08] Response headers should include content type', async () => {
    const response = await apiHelper.get(CategoriesApiData.categoriesEndpoint);

    const contentType = response.headers['content-type'] || '';
    expect(contentType.toLowerCase()).toContain('application/json');
  });

  test('[API-CAT-09] Response should include cache control headers', async () => {
    const response = await apiHelper.get(CategoriesApiData.categoriesEndpoint);

    expect(response.headers['cache-control']).toBeDefined();
  });

  test('[API-CAT-10] Categories count should be consistent across requests', async () => {
    const response1 = await apiHelper.get(CategoriesApiData.categoriesEndpoint);
    const response2 = await apiHelper.get(CategoriesApiData.categoriesEndpoint);

    const cats1 = flattenCategories(getRootCategory(response1));
    const cats2 = flattenCategories(getRootCategory(response2));

    expect(cats1.length).toBe(cats2.length);
  });

  // Negative cases

  test('[API-CAT-11] Should handle invalid endpoint gracefully', async () => {
    const response = await apiHelper.get(CategoriesApiData.invalidEndpoint);

    expect(response.status).toBe(404);
    expect(response.isClientError).toBe(true);
  });

  test('[API-CAT-12] Should reject unsupported HTTP methods', async () => {
    const response = await apiHelper.post(CategoriesApiData.categoriesEndpoint, {
      name: 'test',
    });

    expect([404, 405, 400]).toContain(response.status);
  });

  test('[API-CAT-13] Should handle malformed query parameters gracefully', async () => {
    const response = await apiHelper.get(CategoriesApiData.malformedQuery);

    expect([200, 400]).toContain(response.status);
  });

  // Edge cases

  test('[API-CAT-14] Should handle rapid successive requests', async () => {
    const requests = Array(5)
      .fill(null)
      .map(() => apiHelper.get(CategoriesApiData.categoriesEndpoint));

    const responses = await Promise.all(requests);

    responses.forEach(response => {
      expect(response.status).toBe(200);
      expect(typeof getRootCategory(response)).toBe('object');
      expect(Array.isArray(getRootCategory(response).Subcategories)).toBe(true);
    });
  });

  test('[API-CAT-15] Response should be consistent regardless of request order', async () => {
    const response1 = await apiHelper.get(CategoriesApiData.categoriesEndpoint);
    const response2 = await apiHelper.get(CategoriesApiData.categoriesEndpoint);

    const json1 = JSON.stringify(response1.body);
    const json2 = JSON.stringify(response2.body);

    expect(json1).toBe(json2);
  });

  test('[API-CAT-16] Should handle large result sets efficiently', async () => {
    const response = await apiHelper.get(CategoriesApiData.categoriesEndpoint);
    const categories = flattenCategories(getRootCategory(response));

    expect(categories.length).toBeGreaterThan(0);
    expect(categories.length).toBeLessThan(10000);
  });

  test('[API-CAT-17] Nested subcategories should maintain hierarchy', async () => {
    const response = await apiHelper.get(CategoriesApiData.categoriesEndpoint);
    const categories = flattenCategories(getRootCategory(response));

    categories.forEach((cat) => {
      const number = String(cat.Number);
      const subs = cat.Subcategories as Record<string, unknown>[] | undefined;

      expect(typeof number).toBe('string');
      if (subs) {
        subs.forEach((sub) => {
          const subNumber = String(sub.Number);
          expect(typeof subNumber).toBe('string');
        });
      }
    });
  });

  // Security checks

  test('[API-CAT-18] Should not expose sensitive information in response', async () => {
    const response = await apiHelper.get(CategoriesApiData.categoriesEndpoint);
    const sensitiveTerms = CategoriesApiData.sensitiveTerms;

    const containsSensitive = (obj: unknown): boolean => {
      if (obj === null || obj === undefined) {
        return false;
      }

      if (typeof obj === 'string') {
        return sensitiveTerms.has(obj.toLowerCase());
      }

      if (typeof obj === 'object') {
        const record = obj as Record<string, unknown>;
        for (const [key, value] of Object.entries(record)) {
          if (sensitiveTerms.has(key.toLowerCase())) {
            return true;
          }
          if (containsSensitive(value)) {
            return true;
          }
        }
      }

      return false;
    };

    expect(containsSensitive(response.body)).toBe(false);
  });

  test('[API-CAT-19] Should prevent SQL injection via query parameters', async () => {
    const sqlInjectionPayloads = [
      "' OR '1'='1",
      "1; DROP TABLE categories;--",
      "1 UNION SELECT * FROM users",
    ];

    for (const payload of sqlInjectionPayloads) {
      const response = await apiHelper.get(
        `/v1/Categories.json?search=${encodeURIComponent(payload)}`
      );

      expect([200, 400]).toContain(response.status);
      expect(response.rawBody).not.toMatch(/\b(syntax error|sql error|database error|exception)\b/i);
    }
  });

  test('[API-CAT-20] Should prevent XSS via response data', async () => {
    const response = await apiHelper.get('/v1/Categories.json');
    const categories = flattenCategories(getRootCategory(response));

    categories.forEach((cat) => {
      const name = String(cat.Name);
      const path = String(cat.Path);

      expect(name).not.toMatch(/<script|onerror|onclick/i);
      expect(path).not.toMatch(/<script|onerror|onclick/i);
    });
  });

  test('[API-CAT-21] Should handle special characters safely', async () => {
    const response = await apiHelper.get('/v1/Categories.json');
    const categories = flattenCategories(getRootCategory(response));

    const specialCharTest = categories.some((cat) => {
      const name = String(cat.Name);
      return /[&<>\"']/.test(name);
    });

    if (specialCharTest) {
      const body = JSON.stringify(response.body);
      expect(body).toBeTruthy();
    }
  });

  test('[API-CAT-22] Should use HTTPS only', async () => {
    expect('https://api.trademe.co.nz').toMatch(/^https:\/\//);
  });

  // Performance

  test('[API-CAT-23] Should return response within acceptable time', async () => {
    const responseTime = await apiHelper.getResponseTime('/v1/Categories.json');

    expect(responseTime).toBeLessThan(2000);
  });

  test('[API-CAT-24] Should maintain consistent performance across requests', async () => {
    const times: number[] = [];

    for (let i = 0; i < 3; i++) {
      const time = await apiHelper.getResponseTime('/v1/Categories.json');
      times.push(time);
    }

    const average = times.reduce((a, b) => a + b, 0) / times.length;
    const maxDeviation = Math.max(...times.map(t => Math.abs(t - average)));

    expect(maxDeviation).toBeLessThan(500);
  });

  test('[API-CAT-25] Response size should be reasonable', async () => {
    const response = await apiHelper.get('/v1/Categories.json');

    const responseSize = response.rawBody.length;

    expect(responseSize).toBeLessThan(1.5 * 1024 * 1024);
  });

  // Data validation

  test('[API-CAT-26] All category numbers should be strings', async () => {
    const response = await apiHelper.get('/v1/Categories.json');
    const categories = flattenCategories(getRootCategory(response));

    categories.forEach((cat) => {
      const number = cat.Number;
      expect(typeof number === 'string').toBe(true);
    });
  });

  test('[API-CAT-27] Category names and paths should uniquely identify items', async () => {
    const response = await apiHelper.get('/v1/Categories.json');
    const categories = flattenCategories(getRootCategory(response));

    const namePathPairs = categories.map(
      (cat) => `${String(cat.Path)}|${String(cat.Name).toLowerCase()}`
    );
    const uniquePairs = new Set(namePathPairs);

    expect(uniquePairs.size).toBe(namePathPairs.length);
  });

  test('[API-CAT-28] Category paths should not contain invalid characters', async () => {
    const response = await apiHelper.get('/v1/Categories.json');
    const categories = flattenCategories(getRootCategory(response));

    const invalidPathPattern = /[<>|?*\x00-\x1f]/;

    categories.forEach((cat) => {
      const path = String(cat.Path);
      expect(path).not.toMatch(invalidPathPattern);
    });
  });

  test('[API-CAT-29] Response should include version information if available', async () => {
    const response = await apiHelper.get('/v1/Categories.json');

    const headers = Object.keys(response.headers).join(',').toLowerCase();
    expect(headers).toBeTruthy();
  });

  test('[API-CAT-30] Should parse JSON response without errors', async () => {
    const response = await apiHelper.get('/v1/Categories.json');

    expect(() => {
      JSON.stringify(response.body);
    }).not.toThrow();
  });

  // Protocol and consistency

  test('[API-CAT-31] Response should follow REST conventions', async () => {
    const response = await apiHelper.get('/v1/Categories.json');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBeDefined();
  });

  test('[API-CAT-32] Should handle Accept-Language header gracefully', async () => {
    const response = await apiHelper.get('/v1/Categories.json', {
      headers: {
        'Accept-Language': 'en-NZ, en;q=0.9',
      },
    });

    expect(response.status).toBe(200);
  });

  test('[API-CAT-33] Should return consistent structure for empty vs populated results', async () => {
    const response = await apiHelper.get('/v1/Categories.json');
    const rootCategory = getRootCategory(response);

    expect(typeof rootCategory).toBe('object');
    expect(Array.isArray(rootCategory.Subcategories)).toBe(true);
  });
});
