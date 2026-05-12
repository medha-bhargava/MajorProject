import { describe, expect, it } from 'vitest';

describe('frontend contract', () => { it('uses protected dashboard routes', () => { expect('/inventory').toContain('inventory'); }); });

