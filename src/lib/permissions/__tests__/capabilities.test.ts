import { describe, it, expect } from 'vitest';
import { can, type Capability, type PermissionContext } from '../capabilities';

interface TestCase {
  scenario: string;
  context: PermissionContext;
  expectedCapabilities: Capability[];
}

const ALL_CAPABILITIES: Capability[] = [
  'manage_academy',
  'manage_teachers',
  'manage_students',
  'manage_curriculum',
  'manage_scheduling',
  'manage_finance',
  'view_audit',
  'view_own_payouts',
  'view_academy_payouts',
  'manage_notifications',
  'manage_imports',
  'manage_pricing',
  'view_own_progress',
  'manage_progress',
  'view_own_assessments',
  'manage_assessments',
  'view_own_schedule',
  'view_own_pricing',
  'manage_own_waitlist',
];

describe('Capabilities Module', () => {
  const testCases: TestCase[] = [
    {
      scenario: 'Owner',
      context: { activeRole: 'owner', userRole: null },
      expectedCapabilities: [
        'manage_academy',
        'manage_staff',
        'manage_students',
        'manage_curriculum',
        'manage_scheduling',
        'manage_finance',
        'view_audit',
        'view_own_payouts',
        'view_academy_payouts',
        'manage_notifications',
        'manage_imports',
        'manage_pricing',
        'manage_progress',
        'manage_assessments',
      ],
    },
    {
      scenario: 'Admin',
      context: { activeRole: 'admin', userRole: null },
      expectedCapabilities: [
        'manage_academy',
        'manage_staff',
        'manage_students',
        'manage_curriculum',
        'manage_scheduling',
        'manage_finance',
        'view_audit',
        'view_own_payouts',
        'view_academy_payouts',
        'manage_notifications',
        'manage_imports',
        'manage_pricing',
        'manage_progress',
        'manage_assessments',
      ],
    },
    {
      scenario: 'Teacher (cannot manage teacher, student, or curriculum administration)',
      context: { activeRole: 'teacher', userRole: null },
      expectedCapabilities: [
        'manage_scheduling',
        'view_own_payouts',
        'manage_progress',
        'manage_assessments',
      ],
    },
    {
      scenario: 'Teacher',
      context: { activeRole: 'teacher', userRole: null },
      expectedCapabilities: [
        'manage_scheduling',
        'view_own_payouts',
        'manage_progress',
        'manage_assessments',
      ],
    },
    {
      scenario: 'Lead Teacher (global role)',
      context: { activeRole: null, userRole: 'lead' },
      expectedCapabilities: [
        'manage_scheduling',
        'manage_progress',
        'manage_assessments',
      ],
    },
    {
      scenario: 'Substitute Teacher (global role)',
      context: { activeRole: null, userRole: 'sub' },
      expectedCapabilities: [
        'manage_scheduling',
        'view_own_payouts',
        'manage_progress',
        'manage_assessments',
      ],
    },
    {
      scenario: 'Student',
      context: { activeRole: null, userRole: 'student' },
      expectedCapabilities: [
        'view_own_progress',
        'view_own_assessments',
        'view_own_pricing',
        'view_own_schedule',
        'manage_own_waitlist',
      ],
    },
    {
      scenario: 'Parent',
      context: { activeRole: null, userRole: 'parent' },
      expectedCapabilities: [
        'view_own_progress',
        'view_own_assessments',
        'view_own_schedule',
        'manage_own_waitlist',
      ],
    },
  ];

  testCases.forEach(({ scenario, context, expectedCapabilities }) => {
    it(`should return correct capabilities for ${scenario}`, () => {
      ALL_CAPABILITIES.forEach((cap) => {
        const hasCapability = can(cap, context);
        const shouldHaveCapability = expectedCapabilities.includes(cap);
        
        expect(hasCapability, `Expected ${scenario} to ${shouldHaveCapability ? 'HAVE' : 'NOT HAVE'} ${cap}`).toBe(shouldHaveCapability);
      });
    });
  });
});
