// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
/**
 * Test setup file
 */
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
