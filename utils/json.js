import _ from 'lodash'
import { toDateString } from '@/utils/dates'
export function filterCondition(item, filter) {
  filter = filter.toLowerCase()
  return (
    (item.name && `${item.name}`.toLowerCase().includes(filter)) ||
    (item.value && `${item.value}`.toLowerCase().includes(filter))
  )
}

export const nodeTypes = { TREE: 'tree', LIST: 'list', LEAF: 'leaf' }
const { TREE, LIST, LEAF } = nodeTypes

export function minifyList(list, path, base = 0) {
  const groupsPerLevel = 10
  if (list.length <= groupsPerLevel) return list
  const groupSize = Math.pow(
    groupsPerLevel,
    Math.floor(Math.log(list.length - 1) / Math.log(groupsPerLevel))
  )
  return _.chunk(list, groupSize).map((group, i) => {
    const from = base + groupSize * i + 1
    const to = base + groupSize * i + group.length
    return {
      id: `${path.join('.')}[${from - 1}:${to}]`,
      name: `[elements ${from} - ${to}]`,
      path,
      children: minifyList(group, path, base + i * groupSize),
      type: nodeTypes.LIST
    }
  })
}

/**
 * itemifyJSON transforms some JSON into a tree, suitable for a Vuetify VTreeview component.
 * @param {String} jsonText
 * @param {String} filterString (optional) a string that needs to be contained
 * in the name or the value of a node for it to match
 * @returns {Array} the tree
 */
export function itemifyJSON(jsonString, filterString) {
  const json = JSON.parse(jsonString)
  const predicate = makePruningPredicateToMatch(filterString)
  const processAndFilter = (json, path, type, children) => {
    const item = processJsonNode(json, path, type, children)
    return predicate(item) ? item : undefined
  }
  const found = traverseJson(json, processAndFilter)
  // We wrap everything in an array for the convenience
  // of vuetify's tree view
  return [found || []]
}

export function traverseJson(json, process, path = []) {
  if (typeof json !== 'object') {
    // value (leaf)
    return process(json, path, LEAF, undefined)
  } else if (Array.isArray(json)) {
    // array (list)
    const processedChildren = json
      .map((t, i) => traverseJson(t, process, [...path, i]))
      .filter(ch => ch !== undefined)
    return process(json, path, LIST, processedChildren)
  } else if (json !== null) {
    // object (tree)
    // The processed children are in a list rather than an object,
    // because that's more convenient for vuetify's tree view
    const processedChildren = Object.entries(json)
      .map(([key, t]) => traverseJson(t, process, [...path, key]))
      .filter(ch => ch !== undefined)
    return process(json, path, TREE, processedChildren)
  } else {
    // json === null (leaf, I guess)
    return process(json, path, LEAF, undefined)
  }
}

function attributeNameFromPath(path) {
  const key = path[path.length - 1]
  return key && isNaN(key) ? key : undefined
}

export function processJsonNode(json, path, type, processedChildren) {
  const item = { id: path.join('.'), path, type }
  const attrName = formatAttributeName(attributeNameFromPath(path))
  if (type === LEAF) {
    if (attrName) {
      item.name = attrName
    }
    item.value = toDateString(attrName, json)
  } else if (type === LIST) {
    const description = formatArray(json)
    item.name = attrName ? `${attrName} / ${description}` : description
    if (processedChildren.length > 0) {
      item.children = minifyList(processedChildren, path)
    }
  } else if (type === TREE) {
    const description = formatObject(json)
    item.name = attrName ? `${attrName} / ${description}` : description
    if (processedChildren.length > 0) {
      // no minifying, objects have few attributes, right?
      item.children = processedChildren
    }
  }
  return item
}

export function makePruningPredicateToMatch(filter) {
  if (!filter) {
    return () => true
  }
  const lowerCaseFilter = filter.toLowerCase()
  return item => {
    const name = attributeNameFromPath(item.path)
    if (name && name.toLowerCase().includes(lowerCaseFilter)) {
      return true
    }
    const value = item.value && '' + item.value
    if (value && value.toLowerCase().includes(lowerCaseFilter)) {
      return true
    }
    return item.children && item.children.length > 0
  }
}

export function formatObject(object) {
  if (!object) {
    // null is also of type object, we transform it to an empty string
    return ''
  }
  const keys = Object.keys(object)
  if (keys.length === 0) {
    return '{no attributes}'
  }
  return `{attributes ${keys.map(k => _.startCase(k)).join(', ')}}`
}

export function formatArray(array) {
  if (array.length === 0) {
    return '[empty list]'
  }
  const plural = array.length > 1
  return `[list with ${array.length} item${plural ? 's' : ''}]`
}

export function formatAttributeName(name) {
  return _.startCase(name)
}

export function pathArrayToJsonPath(pathArray) {
  return (
    '$' +
    pathArray.reduce((path, el) => {
      path += isNaN(el) ? `['${el}']` : `[${el}]`
      return path
    }, '')
  )
}

export function nJsonPoints(json) {
  if (json === null) return 0
  else if (Array.isArray(json)) return json.length + _.sumBy(json, nJsonPoints)
  else if (_.isObject(json)) return nJsonPoints(Object.values(json))
  else return 1
}
