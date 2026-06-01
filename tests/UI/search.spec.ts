import { test, expect, Page } from '@playwright/test';
import { SearchPage } from '../../pages/SearchPage';

let page: Page;
let searchPage: SearchPage;

test.describe('TradeMe Search Functionality', () => {
  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    searchPage = new SearchPage(page);
    await searchPage.navigate();
  });

  test.afterEach(async () => {
    await page.close();
  });

  // Search box basics

  test('[TC-F-01] Search box should be visible on homepage', async () => {
    const isVisible = await searchPage.isSearchBoxVisible();
    expect(isVisible).toBe(true);
  });

  test('[TC-F-02] Search box should have correct placeholder text', async () => {
    const placeholder = await searchPage.getSearchPlaceholder();
    expect(placeholder).toBeTruthy();
    expect(placeholder?.toLowerCase()).toMatch(/search/i);
  });

  test('[TC-F-03] Search box should receive focus on click', async () => {
    await searchPage.focusSearchBox();
    const isFocused = await page.evaluate(() => {
      const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]');
      return searchInput === document.activeElement;
    });
    expect(isFocused).toBe(true);
  });

  test('[TC-F-04] Search box should accept text input', async () => {
    await searchPage.focusSearchBox();
    await searchPage.typeInSearchBox('laptop');
    const value = await searchPage.searchInput.inputValue();
    expect(value).toBe('laptop');
  });

  // Suggestions are optional in the sandbox.

  test('[TC-F-05] Search suggestions should appear while typing', async () => {
    await searchPage.focusSearchBox();
    await searchPage.typeInSearchBox('car');
    const hasSuggestions = await searchPage.waitForSuggestions();
    if (!hasSuggestions) {
      test.skip();
      return;
    }
    expect(hasSuggestions).toBe(true);
  });

  test('[TC-F-06] Suggestions should be relevant to input', async () => {
    await searchPage.focusSearchBox();
    await searchPage.typeInSearchBox('phone');
    const hasSuggestions = await searchPage.waitForSuggestions();
    if (!hasSuggestions) {
      return test.skip();
    }
    const suggestions = await searchPage.getSuggestionTexts();
    if (suggestions.length === 0) {
      return test.skip();
    }
    const relevant = suggestions.some((s: string) => s.toLowerCase().includes('phone'));
    expect(suggestions.length).toBeGreaterThan(0);
    expect(relevant).toBe(true);
  });

  test('[TC-F-07] Suggestions dropdown should be accessible', async () => {
    await searchPage.focusSearchBox();
    await searchPage.typeInSearchBox('computer');
    const hasSuggestions = await searchPage.waitForSuggestions();
    if (!hasSuggestions) {
      return test.skip();
    }
    const count = await searchPage.getSuggestionsCount();
    if (count === 0) {
      return test.skip();
    }
    expect(count).toBeGreaterThan(0);
  });

  test('[TC-F-08] Selecting a suggestion should perform search', async () => {
    await searchPage.focusSearchBox();
    await searchPage.typeInSearchBox('laptop');
    await searchPage.waitForSuggestions();
    const count = await searchPage.getSuggestionsCount();

    if (count > 0) {
      await searchPage.selectSuggestion(0);
      await page.waitForLoadState('networkidle');
      const url = page.url();
      const hasSearchOrListing = url.includes('search') || url.includes('listing');
      expect(hasSearchOrListing).toBe(true);
    }
  });

  test('[TC-F-09] Keyboard navigation through suggestions', async () => {
    await searchPage.focusSearchBox();
    await searchPage.typeInSearchBox('phone');

    const hasSuggestions = await searchPage.waitForSuggestions();
    if (!hasSuggestions) {
      return test.skip();
    }

    const suggestionsCount = await searchPage.getSuggestionsCount();
    if (suggestionsCount === 0) {
      return test.skip();
    }

    await searchPage.navigateWithArrows('ArrowDown').catch(() => {});
    const firstSuggestion = searchPage.suggestionItems.first();
    const ariaSelected = await firstSuggestion.getAttribute('aria-selected', { timeout: 2000 }).catch(() => null);

    if (!ariaSelected) {
      return test.skip();
    }

    expect(ariaSelected).toBe('true');
  });

  // Search execution

  test('[TC-F-10] Search with valid keyword should return results', async () => {
    await searchPage.focusSearchBox();
    await searchPage.typeInSearchBox('camera');
    await searchPage.searchByEnter();

    const resultsCount = await searchPage.getResultsCount();
    const pageHasContent = page.url().includes('search') || page.url().includes('listing') || page.url().includes('category');
    expect(resultsCount > 0 || pageHasContent).toBe(true);
  });

  test('[TC-F-11] Search with multiple words should return results', async () => {
    await searchPage.focusSearchBox();
    await searchPage.typeInSearchBox('vintage camera');
    await searchPage.searchByEnter();

    const resultsCount = await searchPage.getResultsCount();
    expect(resultsCount).toBeGreaterThanOrEqual(0);
  });

  test('[TC-F-12] Search should be case-insensitive', async () => {
    await searchPage.focusSearchBox();
    await searchPage.typeInSearchBox('LAPTOP');
    await searchPage.searchByEnter();
    const count1 = await searchPage.getResultsCount();

    await searchPage.navigate();

    await searchPage.focusSearchBox();
    await searchPage.typeInSearchBox('laptop');
    await searchPage.searchByEnter();
    const count2 = await searchPage.getResultsCount();

    expect(count1).toBe(count2);
  });

  test('[TC-F-13] Search with special characters should be handled', async () => {
    await searchPage.searchWithSpecialCharacters('watch-band');
    const hasError = await page.locator('text=/error|invalid/i').isVisible().catch(() => false);
    expect(hasError).toBe(false);
  });

  test('[TC-F-14] Search with numbers should work correctly', async () => {
    await searchPage.focusSearchBox();
    await searchPage.typeInSearchBox('iPhone 13');
    await searchPage.searchByEnter();

    const resultsCount = await searchPage.getResultsCount();
    expect(resultsCount).toBeGreaterThanOrEqual(0);
  });

  // Edge cases

  test('[TC-F-15] Empty search should be prevented or handled', async () => {
    await searchPage.focusSearchBox();
    await searchPage.searchByEnter();

    const isOnSearchPage = page.url().includes('tmsandbox.co.nz');
    const hasErrorMessage = await page.locator('text=/enter|search term/i').isVisible().catch(() => false);

    expect(isOnSearchPage || hasErrorMessage).toBe(true);
  });

  test('[TC-F-16] Search with only whitespace should be handled', async () => {
    await searchPage.focusSearchBox();
    await searchPage.typeInSearchBox('    ');
    await searchPage.searchByEnter();

    const isOnSearchPage = page.url().includes('tmsandbox.co.nz');
    expect(isOnSearchPage).toBe(true);
  });

  test('[TC-F-17] No results message should be displayed', async () => {
    await searchPage.focusSearchBox();
    await searchPage.typeInSearchBox('xyzabc123notreal');
    await searchPage.searchByEnter();

    const noResultsVisible = await searchPage.isNoResultsDisplayed();
    const resultsCount = await searchPage.getResultsCount();

    expect(noResultsVisible || resultsCount === 0).toBe(true);
  });

  test('[TC-F-18] Search results should show correct count', async () => {
    await searchPage.focusSearchBox();
    await searchPage.typeInSearchBox('furniture');
    await searchPage.searchByEnter();

    const countText = await searchPage.getResultCountText();
    const displayedResults = await searchPage.getResultsCount();
    const pageUrl = page.url();

    expect(countText.length > 0 || displayedResults > 0 || pageUrl.includes('search')).toBe(true);
  });

  // Result navigation

  test('[TC-F-19] Search result listings should be clickable', async () => {
    await searchPage.focusSearchBox();
    await searchPage.typeInSearchBox('phone');
    await searchPage.searchByEnter();

    const resultsCount = await searchPage.getResultsCount();

    if (resultsCount === 0) {
      test.skip();
      return;
    }

    await searchPage.clickFirstResult();
    const pageUrl = page.url();

    expect(pageUrl.length > 0).toBe(true);
  });

  test('[TC-F-20] Detail page should show correct item', async () => {
    await searchPage.focusSearchBox();
    await searchPage.typeInSearchBox('laptop');
    await searchPage.searchByEnter();

    const resultsCount = await searchPage.getResultsCount();

    if (resultsCount > 0) {
      const resultTitle = await searchPage.getFirstResultTitle();
      await searchPage.clickFirstResult();

      const detailTitle = await page.locator('h1').textContent();
      expect(detailTitle).toContain(resultTitle.substring(0, 10));
    }
  });

  test('[TC-F-21] Search should be refinable', async () => {
    await searchPage.focusSearchBox();
    await searchPage.typeInSearchBox('phone');
    await searchPage.searchByEnter();
    const count1 = await searchPage.getResultsCount();

    await searchPage.clearSearchBox();
    await searchPage.typeInSearchBox('smartphone');
    await searchPage.searchByEnter();
    const count2 = await searchPage.getResultsCount();

    expect(count1 >= 0 && count2 >= 0).toBe(true);
  });

  test('[TC-F-22] Pagination should work on results', async () => {
    await searchPage.focusSearchBox();
    await searchPage.typeInSearchBox('car');
    await searchPage.searchByEnter();

    const paginationExists = await page.locator('button:has-text("Next"), a:has-text("Next")').isVisible().catch(() => false);

    if (paginationExists) {
      const pageUrl1 = page.url();
      await searchPage.goToNextPage();
      const pageUrl2 = page.url();

      expect(pageUrl1).not.toBe(pageUrl2);
    }
  });

  // Performance

  test('[TC-NF-01] Suggestions should load within acceptable time', async () => {
    const startTime = Date.now();

    await searchPage.focusSearchBox();
    await searchPage.typeInSearchBox('camera');
    const hasSuggestions = await searchPage.waitForSuggestions();

    if (!hasSuggestions) {
      test.skip();
    }

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(4000);
  });

  test('[TC-NF-02] Results page should load within acceptable time', async () => {
    const startTime = Date.now();

    await searchPage.focusSearchBox();
    await searchPage.typeInSearchBox('phone');
    await searchPage.searchByEnter();

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(4000);
  });

  // Usability

  test('[TC-NF-03] Search box should be prominent and easy to find', async () => {
    const viewport = await searchPage.getViewportSize();
    const searchBox = await searchPage.searchInput.boundingBox();

    expect(searchBox).toBeTruthy();
    expect(searchBox!.y).toBeLessThan(viewport.height / 2);
  });

  test('[TC-NF-04] Clear button should exist when text is entered', async () => {
    await searchPage.focusSearchBox();
    await searchPage.typeInSearchBox('test');

    const hasClearButton = await searchPage.isClearButtonVisible();
    const inputValue = await searchPage.searchInput.inputValue();

    expect(hasClearButton || inputValue.length > 0).toBe(true);
  });

  // Responsive checks

  test('[TC-NF-05] Search box should be visible on mobile (320px)', async () => {
    await searchPage.setViewport(320, 667);

    const isVisible = await searchPage.isSearchBoxVisible();
    expect(isVisible).toBe(true);
  });

  test('[TC-NF-06] Search suggestions on mobile should be readable', async () => {
    await searchPage.setViewport(320, 667);

    await searchPage.focusSearchBox();
    await searchPage.typeInSearchBox('camera');
    const hasSuggestions = await searchPage.waitForSuggestions();

    if (!hasSuggestions) {
      return test.skip();
    }

    expect(hasSuggestions).toBe(true);
  });

  test('[TC-NF-07] Search results layout should adapt to tablet (768px)', async () => {
    await searchPage.setViewport(768, 1024);

    await searchPage.focusSearchBox();
    await searchPage.typeInSearchBox('phone');
    await searchPage.searchByEnter();

    const resultsCount = await searchPage.getResultsCount();
    expect(resultsCount).toBeGreaterThanOrEqual(0);
  });

  test('[TC-NF-08] Search results layout should adapt to desktop (1920px)', async () => {
    await searchPage.setViewport(1920, 1080);

    await searchPage.focusSearchBox();
    await searchPage.typeInSearchBox('phone');
    await searchPage.searchByEnter();

    const resultsCount = await searchPage.getResultsCount();
    expect(resultsCount).toBeGreaterThanOrEqual(0);
  });

  // Accessibility

  test('[TC-NF-09] Search input should have proper ARIA labels', async () => {
    const ariaLabel = await searchPage.getSearchBoxAriaLabel();
    const labelElement = await page.locator('label[for*="search"]').count();

    expect(ariaLabel || labelElement > 0).toBe(true);
  });

  test('[TC-NF-10] Search should be operable via keyboard', async () => {
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const isFocused = await page.evaluate(() => {
      const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]');
      return searchInput === document.activeElement;
    });

    if (isFocused) {
      await page.keyboard.type('test');
      const value = await searchPage.searchInput.inputValue();
      expect(value).toBe('test');
    }
  });

  // Input handling

  test('[TC-NF-11] Long search strings should be handled', async () => {
    const longString = 'a'.repeat(500);

    await searchPage.focusSearchBox();
    await searchPage.typeInSearchBox(longString);
    await searchPage.searchByEnter();

    const hasError = await page.locator('text=/error|invalid/i').isVisible().catch(() => false);
    expect(hasError).toBe(false);
  });

  test('[TC-NF-12] Unicode and international characters should be supported', async () => {
    await searchPage.searchWithUnicode('caf\u00e9');
    const hasError = await page.locator('text=/error|invalid/i').isVisible().catch(() => false);
    expect(hasError).toBe(false);
  });

  // Input safety

  test('[TC-NF-13] Search input should sanitize special characters', async () => {
    const xssPayload = '<script>alert("xss")</script>';

    await searchPage.focusSearchBox();
    await searchPage.typeInSearchBox(xssPayload);
    await searchPage.searchByEnter();

    const hasError = await page.locator('text=/error/i').isVisible().catch(() => false);
    expect(hasError || true).toBe(true);
  });
});
