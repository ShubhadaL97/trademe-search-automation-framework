import { Page } from '@playwright/test';

export class TestHelper {
  static async waitForPageLoad(page: Page) {
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
  }

  static async measureApiResponseTime(
    action: () => Promise<void>,
  ): Promise<number> {
    const startTime = Date.now();
    await action();
    return Date.now() - startTime;
  }

  static async searchAndMeasureTime(page: Page, searchTerm: string): Promise<number> {
    const startTime = Date.now();
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]');
    await searchInput.fill(searchTerm);
    await searchInput.press('Enter');
    await this.waitForPageLoad(page);
    return Date.now() - startTime;
  }

  static async isInViewport(page: Page, selector: string): Promise<boolean> {
    return await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (!element) return false;
      const rect = element.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth
      );
    }, selector);
  }

  static async getAccessibilityTree(page: Page, selector: string): Promise<string> {
    return await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (!element) return '';
      return element.outerHTML;
    }, selector);
  }

  static async injectTestData(page: Page, data: Record<string, unknown>) {
    await page.evaluate((testData) => {
      (window as any).__TEST_DATA__ = testData;
    }, data);
  }

  static async getPerformanceMetrics(page: Page): Promise<{
    loadTime: number;
    domContentLoaded: number;
    firstContentfulPaint: number;
  }> {
    return await page.evaluate(() => {
      const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');

      return {
        loadTime: timing.loadEventEnd - timing.fetchStart,
        domContentLoaded: timing.domContentLoadedEventEnd - timing.fetchStart,
        firstContentfulPaint:
          paintEntries.find((e) => e.name === 'first-contentful-paint')?.startTime || 0,
      };
    });
  }

  static getScreenshotName(testName: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${testName}-${timestamp}.png`;
  }

  static async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 100,
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        const delay = initialDelay * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  static compareResults(array1: string[], array2: string[]): boolean {
    if (array1.length !== array2.length) return false;
    return array1.every((value) => array2.includes(value));
  }

  static generateReportSummary(results: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  }): string {
    const successRate = ((results.passed / results.total) * 100).toFixed(2);
    return `
    ======================== TEST SUMMARY ========================
    Total Tests:    ${results.total}
    Passed:         ${results.passed}
    Failed:         ${results.failed}
    Skipped:        ${results.skipped}
    Success Rate:   ${successRate}%
    ==============================================================
    `;
  }
}

export class DataValidator {
  static isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  static isValidPrice(price: number): boolean {
    return price >= 0 && Number.isFinite(price);
  }

  static isValidSearchTerm(term: string): boolean {
    return term.trim().length > 0;
  }

  static sanitizeSearchTerm(term: string): string {
    return term.trim().replace(/\s+/g, ' ');
  }

  static hasXSSPayload(input: string): boolean {
    return /<[^>]*script|javascript:|on\w+\s*=|<iframe/i.test(input);
  }
}

export class TestDataFactory {
  static generateSearchTerms(count: number): string[] {
    const baseTerms = ['phone', 'laptop', 'camera', 'watch', 'furniture', 'car', 'bike'];
    const terms: string[] = [];

    for (let i = 0; i < count; i++) {
      terms.push(baseTerms[i % baseTerms.length] + (i > 0 ? i : ''));
    }

    return terms;
  }

  static generatePriceRange(min: number = 10, max: number = 1000): { min: number; max: number } {
    const minPrice = Math.floor(Math.random() * (max - min)) + min;
    const maxPrice = minPrice + Math.floor(Math.random() * (max - minPrice));
    return { min: minPrice, max: maxPrice };
  }

  static generateRandomString(length: number = 10): string {
    return Math.random().toString(36).substring(2, length + 2);
  }
}
