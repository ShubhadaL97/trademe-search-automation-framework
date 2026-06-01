export const TEST_CONFIG = {
  BASE_URL: process.env.BASE_URL || 'https://www.tmsandbox.co.nz/',
  TIMEOUT: {
    SHORT: 3000,
    MEDIUM: 5000,
    LONG: 10000,
  },
  WAIT_TIMES: {
    SUGGESTIONS: 2000,
    RESULTS: 4000,
    PAGE_LOAD: 5000,
  },
  PERFORMANCE: {
    MAX_SUGGESTIONS_LOAD_TIME: 2000,
    MAX_RESULTS_LOAD_TIME: 4000,
    MAX_PAGE_LOAD_TIME: 5000,
  },
  VIEWPORT: {
    MOBILE: { width: 320, height: 667 },
    TABLET: { width: 768, height: 1024 },
    DESKTOP: { width: 1920, height: 1080 },
  },
  TEST_DATA: {
    VALID_SEARCHES: ['laptop', 'phone', 'camera', 'furniture', 'car'],
    SPECIAL_CHARS: ['watch-band', 'shirt-sleeve', 'coffee-maker'],
    UNICODE_CHARS: ['caf\u00e9', 'na\u00efve', 'r\u00e9sum\u00e9'],
    LONG_SEARCH: 'a'.repeat(500),
    EMPTY_SEARCH: '',
    WHITESPACE_SEARCH: '    ',
    NO_RESULTS_SEARCH: 'xyzabc123notreal',
  },
};

export const TEST_SUITES = {
  SMOKE: ['TC-F-01', 'TC-F-02', 'TC-F-03', 'TC-F-04', 'TC-F-10', 'TC-F-15'],
  SANITY: ['TC-F-03', 'TC-F-04', 'TC-F-05', 'TC-F-06'],
  INTEGRATION: ['TC-F-05', 'TC-F-08', 'TC-F-09', 'TC-F-10', 'TC-F-19', 'TC-F-20', 'TC-F-21', 'TC-F-22'],
  REGRESSION: ['TC-F-12', 'TC-F-13', 'TC-F-14', 'TC-F-15', 'TC-F-16', 'TC-F-17', 'TC-F-18'],
  PERFORMANCE: ['TC-NF-01', 'TC-NF-02'],
  ACCESSIBILITY: ['TC-NF-13', 'TC-NF-14'],
  SECURITY: ['TC-NF-21'],
  RESPONSIVE: ['TC-NF-09', 'TC-NF-10', 'TC-NF-11', 'TC-NF-12'],
};
