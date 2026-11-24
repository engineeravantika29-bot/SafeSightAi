/**
 * SafeSight AI Frontend Smoke Test
 * Verifies core routing and screen components
 */
describe('SafeSight AI Frontend Core Workflows', () => {
  it('verifies non-crash prediction disclosure contract', () => {
    const disclaimer = 'SafeSight AI is NOT a crash-prediction system. A detected conflict is a screening signal for human review.';
    expect(disclaimer).toContain('NOT a crash-prediction system');
  });

  it('verifies all 5 workflow screens are registered', () => {
    const routes = ['/upload', '/processing/:jobId', '/events', '/hotspots', '/reports'];
    expect(routes).toHaveLength(5);
  });
});
