import { Page, Locator } from '@playwright/test';

export class SearchPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly suggestionsDropdown: Locator;
  readonly suggestionItems: Locator;
  readonly clearButton: Locator;
  readonly noResultsMessage: Locator;
  readonly resultCount: Locator;
  readonly resultListings: Locator;
  readonly resultTitle: Locator;
  readonly pagination: Locator;
  readonly categoryFilter: Locator;
  readonly priceFilter: Locator;
  readonly conditionFilter: Locator;

  constructor(page: Page) {
    this.page = page;

    // The sandbox markup has changed a few times, so these selectors stay broad.
    this.searchInput = page.locator('input[type="search"], input[type="text"][placeholder*="search" i], input[placeholder*="Search"], input[name*="search" i], input[name="q"]').first();
    this.searchButton = page.locator('button:has-text("Search"), [aria-label*="Search"], button[type="submit"]').first();
    this.clearButton = page.locator('button:has-text("Clear"), [aria-label*="Clear"]');

    // Autocomplete is optional in the sandbox, but keep selectors ready when it appears.
    this.suggestionsDropdown = page.locator(
      '[role="listbox"], [role="list"], .suggestions, .autocomplete, ul[class*="suggest"], ' +
      'div[class*="dropdown"], .search-suggestions, [class*="autocomplete-list"], ' +
      '[id*="suggestions"], [id*="autocomplete"]'
    );

    this.suggestionItems = page.locator(
      '[role="option"], [role="listitem"], .suggestion-item, li[class*="suggestion"], ' +
      'div[class*="suggestion-item"], [class*="autocomplete-item"], ' +
      '.search-suggestion, [data-suggestion]'
    );

    // Results pages vary between category and listing views.
    this.noResultsMessage = page.locator('text=/No results|no matches|nothing found|0 results/i');
    this.resultCount = page.locator('text=/Found.*results|Showing.*of|Results|result/i');
    this.resultListings = page.locator(
      'article, .listing, .listing-item, [data-test-id="search-result"], ' +
      '.search-result, li[class*="result"], [class*="result-item"], ' +
      '[role="region"] > *, .product-item'
    );
    this.resultTitle = page.locator('h1, h2, h3, h4[role="heading"], [class*="title"]');

    this.pagination = page.locator('[aria-label*="pagination"], .pagination, nav:has-text("Next"), [class*="paginat"]');

    this.categoryFilter = page.locator('select[name*="category" i], [aria-label*="Category" i] select, [class*="category"] select');
    this.priceFilter = page.locator('input[name*="price" i], [aria-label*="Price" i], [class*="price"] input');
    this.conditionFilter = page.locator('input[name*="condition" i], [aria-label*="Condition" i] input, [class*="condition"] input');
  }

  async navigate() {
    await this.page.goto('https://www.tmsandbox.co.nz/');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async isSearchBoxVisible(): Promise<boolean> {
    return await this.searchInput.isVisible();
  }

  async getSearchPlaceholder(): Promise<string | null> {
    return await this.searchInput.getAttribute('placeholder');
  }

  async focusSearchBox() {
    await this.searchInput.focus();
  }

  async typeInSearchBox(text: string) {
    await this.searchInput.fill(text);
    await this.page.waitForTimeout(500);
  }

  async clearSearchBox() {
    await this.searchInput.clear();
  }

  async waitForSuggestions(timeout: number = 3000): Promise<boolean> {
    try {
      await this.suggestionsDropdown.first().waitFor({ state: 'visible', timeout });
      await this.page.waitForTimeout(300);
      return true;
    } catch {
      return false;
    }
  }

  async getSuggestionsCount(): Promise<number> {
    try {
      return await this.suggestionItems.count();
    } catch {
      return 0;
    }
  }

  async getSuggestionTexts(): Promise<string[]> {
    try {
      return await this.suggestionItems.allTextContents();
    } catch {
      return [];
    }
  }

  async selectSuggestion(index: number) {
    const suggestions = this.suggestionItems;
    await suggestions.nth(index).click();
  }

  async selectSuggestionByText(text: string) {
    const suggestion = this.page.locator(`[role="option"]:has-text("${text}"), .suggestion-item:has-text("${text}")`);
    await suggestion.click();
  }

  async searchByEnter() {
    await this.searchInput.press('Enter');
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
    await this.page.waitForTimeout(2000);
    // Results can render after the URL changes.
    await this.page.waitForTimeout(500);
  }

  async searchByButton() {
    await this.searchButton.click();
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
  }

  async navigateWithArrows(direction: 'ArrowDown' | 'ArrowUp', count: number = 1) {
    for (let i = 0; i < count; i++) {
      await this.searchInput.press(direction);
    }
  }

  async selectWithKeyboard() {
    await this.searchInput.press('Enter');
  }

  async isNoResultsDisplayed(): Promise<boolean> {
    return await this.noResultsMessage.isVisible().catch(() => false);
  }

  async getResultsCount(): Promise<number> {
    try {
      return await this.resultListings.count();
    } catch {
      return 0;
    }
  }

  async getResultCountText(): Promise<string> {
    const text = await this.resultCount.textContent().catch(() => null);
    return text || '';
  }

  async getFirstResultTitle(): Promise<string> {
    try {
      const text = await this.resultListings.first().locator('h2, a:first-of-type, .title, [class*="title"]').textContent({ timeout: 5000 });
      return text?.trim() || '';
    } catch {
      return '';
    }
  }

  async clickFirstResult() {
    try {
      const firstResult = this.resultListings.first();
      await firstResult.click({ timeout: 5000 }).catch(() => {});
      await this.page.waitForLoadState('domcontentloaded').catch(() => {});
    } catch {
      // Some result containers are not direct links.
    }
  }

  async clickResultByTitle(title: string) {
    const result = this.page.locator(`text=${title}`).first();
    await result.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async goToNextPage() {
    const nextButton = this.page.locator('a:has-text("Next"), button:has-text("Next")');
    await nextButton.click();
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
  }

  async goToPreviousPage() {
    const prevButton = this.page.locator('a:has-text("Previous"), button:has-text("Previous")');
    await prevButton.click();
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
  }

  async applyPriceFilter(minPrice: number, maxPrice: number) {
    const minInput = this.page.locator('input[name*="min"], input[placeholder*="Min"]');
    const maxInput = this.page.locator('input[name*="max"], input[placeholder*="Max"]');

    await minInput.fill(String(minPrice));
    await maxInput.fill(String(maxPrice));
    await this.page.locator('button:has-text("Apply"), button:has-text("Filter")').click();
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
  }

  async applyCategoryFilter(category: string) {
    const select = this.page.locator('select, [role="combobox"]');
    await select.selectOption(category);
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
  }

  async applyConditionFilter(condition: string) {
    const conditionInput = this.page.locator(`input[value="${condition}"]`);
    await conditionInput.check();
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
  }

  async getPageLoadTime(): Promise<number> {
    const navigationTiming = await this.page.evaluate(() => {
      const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return timing.loadEventEnd - timing.fetchStart;
    });
    return navigationTiming;
  }

  async getSuggestionsLoadTime(): Promise<number> {
    const before = Date.now();
    await this.waitForSuggestions();
    return Date.now() - before;
  }

  async isClearButtonVisible(): Promise<boolean> {
    return await this.clearButton.isVisible().catch(() => false);
  }

  async getSearchBoxAriaLabel(): Promise<string | null> {
    return await this.searchInput.getAttribute('aria-label');
  }

  async isKeyboardAccessible(): Promise<boolean> {
    await this.page.keyboard.press('Tab');
    const focused = await this.searchInput.evaluate((el) => el === document.activeElement);
    return focused;
  }

  async getViewportSize(): Promise<{ width: number; height: number }> {
    return this.page.viewportSize() || { width: 1920, height: 1080 };
  }

  async setViewport(width: number, height: number) {
    await this.page.setViewportSize({ width, height });
  }

  async searchWithSpecialCharacters(text: string) {
    await this.focusSearchBox();
    await this.typeInSearchBox(text);
    await this.searchByEnter();
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
  }

  async searchWithUnicode(text: string) {
    await this.focusSearchBox();
    await this.typeInSearchBox(text);
    await this.searchByEnter();
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
  }

  async getResultListingTexts(): Promise<string[]> {
    return await this.resultListings.allTextContents();
  }
}
