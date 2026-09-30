import { describe, expect, it } from 'vitest'
import * as store from '../data/peopleOpsStore'
import { StoreError } from '../data/peopleOpsStore'
import type { JobRoleDraft } from '../types'

const baseJobRole: JobRoleDraft = {
  title: 'Software Engineer',
  level: 'MID',
  baseSalary: 500000,
  isPeopleManager: false,
}

describe('jobRole title uniqueness', () => {
  it('rejects a duplicate title within the same level (case-insensitive, trimmed)', () => {
    const state = store.createJobRole(store.emptyState(), baseJobRole)
    expect(() =>
      store.createJobRole(state, { ...baseJobRole, title: '  software engineer  ' }),
    ).toThrow(StoreError)
  })

  it('allows the same title in a different level', () => {
    const state = store.createJobRole(store.emptyState(), baseJobRole)
    const next = store.createJobRole(state, { ...baseJobRole, level: 'SENIOR' })
    expect(store.listJobRoles(next)).toHaveLength(2)
  })

  it('allows editing a job role and resaving with its own unchanged title', () => {
    const state = store.createJobRole(store.emptyState(), baseJobRole)
    const updated = store.updateJobRole(state, 'jobRole_1', { title: baseJobRole.title })
    expect(store.getJobRole(updated, 'jobRole_1')).toMatchObject({ title: baseJobRole.title })
  })

  it('rejects renaming a job role to a title already used by another role at the same level', () => {
    let state = store.createJobRole(store.emptyState(), baseJobRole)
    state = store.createJobRole(state, { ...baseJobRole, title: 'Staff Engineer' })
    expect(() => store.updateJobRole(state, 'jobRole_1', { title: 'staff engineer' })).toThrow(StoreError)
  })

  it('rejects a baseSalary that is not greater than zero', () => {
    expect(() => store.createJobRole(store.emptyState(), { ...baseJobRole, baseSalary: 0 })).toThrow(StoreError)
    expect(() =>
      store.createJobRole(store.emptyState(), { ...baseJobRole, baseSalary: -100 }),
    ).toThrow(StoreError)
  })
})
