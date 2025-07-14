// Global test setup
beforeEach(() => {
  // Mock any global objects or functions here
  console.log = jest.fn();
  console.error = jest.fn();
});

afterEach(() => {
  // Clean up after each test
  jest.clearAllMocks();
});
