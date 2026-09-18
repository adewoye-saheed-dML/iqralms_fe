import { describe, it, expect } from 'vitest';
import { navigationConfig } from '../config';

describe('Navigation Configuration', () => {
  it('should have basic dashboard route accessible to all', () => {
    const dashboardNav = navigationConfig.find((item) => item.label === 'Dashboard');
    expect(dashboardNav).toBeDefined();
    expect(dashboardNav?.href).toBe('/app/dashboard');
    expect(dashboardNav?.allowedOrgRoles).toBeUndefined();
    expect(dashboardNav?.allowedUserRoles).toBeUndefined();
  });

  it('should restrict academy settings to owner and admin', () => {
    const academyNav = navigationConfig.find((item) => item.label === 'Academy');
    expect(academyNav).toBeDefined();
    expect(academyNav?.allowedOrgRoles).toEqual(['owner', 'admin']);
  });

  it('should not contain global roles in org roles (no role leakage)', () => {
    const globalRoles = ['lead', 'sub', 'student', 'parent'];
    navigationConfig.forEach(item => {
      if (item.allowedOrgRoles) {
        globalRoles.forEach(globalRole => {
          expect(item.allowedOrgRoles).not.toContain(globalRole);
        });
      }
    });
  });
});
