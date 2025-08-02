/**
 * Test Setup Configuration
 * 
 * Global setup for the ML monitoring test suite
 */

// Mock performance.now if not available
if (typeof performance === 'undefined') {
  (global as any).performance = {
    now: () => Date.now(),
  };
}

// Set up test environment variables
process.env.NODE_ENV = 'test';

// Global test configuration
const testConfig = {
  timeout: 10000, // 10 second timeout for tests
  retries: 2, // Retry failed tests up to 2 times
};

// Mock console methods to reduce test noise (optional)
const originalConsole = { ...console };

beforeAll(() => {
  // Optionally suppress console output during tests
  if (process.env.SUPPRESS_TEST_LOGS === 'true') {
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  }
});

afterAll(() => {
  // Restore console methods
  if (process.env.SUPPRESS_TEST_LOGS === 'true') {
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  }
});

// Global test utilities
(global as any).testUtils = {
  // Helper to wait for async operations
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Helper to generate test data
  generateTestData: (count: number, generator: (index: number) => any) => {
    return Array.from({ length: count }, (_, index) => generator(index));
  },
  
  // Helper to assert approximate equality for floating point numbers
  expectApproximately: (actual: number, expected: number, tolerance = 0.1) => {
    expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
  },
};

export { testConfig };