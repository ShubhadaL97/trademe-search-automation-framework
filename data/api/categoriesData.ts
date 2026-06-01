export const CategoriesApiData = {
  categoriesEndpoint: '/v1/Categories.json',
  invalidEndpoint: '/v1/InvalidCategories.json',
  malformedQuery: '/v1/Categories.json?invalid=<script>',
  sqlInjectionPayloads: [
    "' OR '1'='1",
    '1; DROP TABLE categories;--',
    '1 UNION SELECT * FROM users',
  ],
  httpsBaseUrl: 'https://api.trademe.co.nz',
  acceptLanguageHeader: {
    'Accept-Language': 'en-NZ, en;q=0.9',
  },
  responseSizeLimitBytes: 1.5 * 1024 * 1024,
  invalidPathPattern: /[<>|?*\x00-\x1f]/,
  sensitiveTerms: new Set(['password', 'secret', 'token', 'apikey', 'api_key']),
};
