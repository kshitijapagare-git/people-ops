import { describe, expect, it } from 'vitest'
import * as store from '../data/peopleOpsStore'
import { StoreError } from '../data/peopleOpsStore'

describe('org unit hierarchy', () => {
  it('seeds exactly one root DIVISION org unit in an empty state', () => {
    const state = store.emptyState()
    const orgUnits = store.listOrgUnits(state)
    expect(orgUnits).toHaveLength(1)
    expect(orgUnits[0]).toMatchObject({ kind: 'DIVISION', parentId: null })
  })

  it('rejects creating a DEPARTMENT under a non-DIVISION parent', () => {
    let state = store.emptyState()
    const division = store.listOrgUnits(state)[0]
    state = store.createOrgUnit(state, { name: 'Platform', kind: 'DEPARTMENT', parentId: division.id })
    const department = store.listOrgUnits(state).find((orgUnit) => orgUnit.kind === 'DEPARTMENT')!
    expect(() =>
      store.createOrgUnit(state, { name: 'Bad Department', kind: 'DEPARTMENT', parentId: department.id }),
    ).toThrow(StoreError)
  })

  it('rejects creating a TEAM under a non-DEPARTMENT parent', () => {
    let state = store.emptyState()
    const division = store.listOrgUnits(state)[0]
    expect(() => store.createOrgUnit(state, { name: 'Bad Team', kind: 'TEAM', parentId: division.id })).toThrow(
      StoreError,
    )
  })

  it('allows a valid DIVISION -> DEPARTMENT -> TEAM chain', () => {
    let state = store.emptyState()
    const division = store.listOrgUnits(state)[0]
    state = store.createOrgUnit(state, { name: 'Engineering', kind: 'DEPARTMENT', parentId: division.id })
    const department = store.listOrgUnits(state).find((orgUnit) => orgUnit.kind === 'DEPARTMENT')!
    state = store.createOrgUnit(state, { name: 'Payments Team', kind: 'TEAM', parentId: department.id })
    const team = store.listOrgUnits(state).find((orgUnit) => orgUnit.kind === 'TEAM')!
    expect(team).toMatchObject({ name: 'Payments Team', kind: 'TEAM', parentId: department.id })
  })

  it('rejects a DIVISION created with a parent', () => {
    const state = store.emptyState()
    const division = store.listOrgUnits(state)[0]
    expect(() => store.createOrgUnit(state, { name: 'Second HQ', kind: 'DIVISION', parentId: division.id })).toThrow(
      StoreError,
    )
  })

  it('rejects deleting an org unit that still has children', () => {
    let state = store.emptyState()
    const division = store.listOrgUnits(state)[0]
    state = store.createOrgUnit(state, { name: 'Engineering', kind: 'DEPARTMENT', parentId: division.id })
    expect(() => store.deleteOrgUnit(state, division.id)).toThrow(StoreError)
  })

  it('re-validates the parent-kind rule when updating an org unit', () => {
    let state = store.emptyState()
    const division = store.listOrgUnits(state)[0]
    state = store.createOrgUnit(state, { name: 'Engineering', kind: 'DEPARTMENT', parentId: division.id })
    const department = store.listOrgUnits(state).find((orgUnit) => orgUnit.kind === 'DEPARTMENT')!
    state = store.createOrgUnit(state, { name: 'Payments Team', kind: 'TEAM', parentId: department.id })
    const team = store.listOrgUnits(state).find((orgUnit) => orgUnit.kind === 'TEAM')!
    expect(() => store.updateOrgUnit(state, team.id, { parentId: division.id })).toThrow(StoreError)
  })

  describe('department mirroring', () => {
    it('mirrors a created department as a DEPARTMENT org unit under the seeded division', () => {
      const state = store.createDepartment(store.emptyState(), { name: 'Engineering', code: 'ENG' })
      const division = store.listOrgUnits(state).find((orgUnit) => orgUnit.kind === 'DIVISION')!
      const mirrored = store.listOrgUnits(state).find((orgUnit) => orgUnit.kind === 'DEPARTMENT')!
      expect(mirrored).toMatchObject({ name: 'Engineering', kind: 'DEPARTMENT', parentId: division.id })
    })

    it('renames the mirrored org unit when the department is renamed', () => {
      let state = store.createDepartment(store.emptyState(), { name: 'Engineering', code: 'ENG' })
      const department = store.listDepartments(state)[0]
      state = store.updateDepartment(state, department.id, { name: 'Platform' })
      const mirrored = store.listOrgUnits(state).find((orgUnit) => orgUnit.kind === 'DEPARTMENT')!
      expect(mirrored.name).toBe('Platform')
    })

    it('removes the mirrored org unit when the department is deleted', () => {
      let state = store.createDepartment(store.emptyState(), { name: 'Engineering', code: 'ENG' })
      const department = store.listDepartments(state)[0]
      state = store.deleteDepartment(state, department.id)
      expect(store.listOrgUnits(state).some((orgUnit) => orgUnit.kind === 'DEPARTMENT')).toBe(false)
    })

    it('rejects deleting a department whose mirrored org unit still has TEAM children', () => {
      let state = store.createDepartment(store.emptyState(), { name: 'Engineering', code: 'ENG' })
      const department = store.listDepartments(state)[0]
      const mirrored = store.listOrgUnits(state).find((orgUnit) => orgUnit.kind === 'DEPARTMENT')!
      state = store.createOrgUnit(state, { name: 'Payments Team', kind: 'TEAM', parentId: mirrored.id })
      expect(() => store.deleteDepartment(state, department.id)).toThrow(StoreError)
    })
  })
})
