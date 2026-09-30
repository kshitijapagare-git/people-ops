import type { OrgUnit } from '../types'

export interface TreeSelectProps {
  label: string
  nodes: OrgUnit[]
  value: string
  onChange: (id: string) => void
}

interface TreeNode {
  orgUnit: OrgUnit
  children: TreeNode[]
}

function buildForest(nodes: OrgUnit[]): TreeNode[] {
  const byParent = new Map<string | null, OrgUnit[]>()
  for (const node of nodes) {
    const siblings = byParent.get(node.parentId) ?? []
    siblings.push(node)
    byParent.set(node.parentId, siblings)
  }
  function build(parentId: string | null): TreeNode[] {
    return (byParent.get(parentId) ?? []).map((orgUnit) => ({
      orgUnit,
      children: build(orgUnit.id),
    }))
  }
  return build(null)
}

function TreeSelectNode({
  node,
  value,
  onChange,
  depth,
}: {
  node: TreeNode
  value: string
  onChange: (id: string) => void
  depth: number
}) {
  const isSelectable = node.orgUnit.kind === 'TEAM'
  const isSelected = value === node.orgUnit.id

  return (
    <li>
      {isSelectable ? (
        <button
          type="button"
          aria-pressed={isSelected}
          style={{ paddingLeft: depth * 16 }}
          onClick={() => onChange(node.orgUnit.id)}
        >
          {node.orgUnit.name}
        </button>
      ) : (
        <span style={{ paddingLeft: depth * 16, fontWeight: 600 }}>{node.orgUnit.name}</span>
      )}
      {node.children.length > 0 && (
        <ul>
          {node.children.map((child) => (
            <TreeSelectNode key={child.orgUnit.id} node={child} value={value} onChange={onChange} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  )
}

/** Renders the full Division -> Department -> Team tree; only TEAM nodes are clickable/selectable. */
export function TreeSelect({ label, nodes, value, onChange }: TreeSelectProps) {
  const forest = buildForest(nodes)

  return (
    <div role="group" aria-label={label}>
      <span>{label}</span>
      <ul>
        {forest.map((node) => (
          <TreeSelectNode key={node.orgUnit.id} node={node} value={value} onChange={onChange} depth={0} />
        ))}
      </ul>
    </div>
  )
}
