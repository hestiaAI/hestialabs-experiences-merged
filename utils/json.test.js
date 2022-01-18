import { JSONPath } from 'jsonpath-plus'
import {
  itemifyJSONOld,
  itemifyJSON,
  traverseJson,
  processJsonNode,
  makePruningPredicateToMatch,
  nodeTypes,
  pathArrayToJsonPath
} from '~/utils/json'

const { TREE, LIST, LEAF } = nodeTypes

test('traverseJson and processJsonNode and filter', () => {
  const srcJson = {
    r: 'roro',
    a: { n: 'nono', b: [{ c: 1, d: 'dodo' }, 'meuh'] }
  }
  const predicate = makePruningPredicateToMatch('dodo')
  const processAndFilter = (json, path, type, children) => {
    const item = processJsonNode(json, path, type, children)
    return predicate(item) ? item : undefined
  }
  const processed = traverseJson(srcJson, processAndFilter)
  const correctProcessed = {
    id: '',
    path: [],
    type: 'tree',
    name: '{attributes R, A}',
    children: [
      {
        id: 'a',
        path: ['a'],
        type: 'tree',
        name: 'A / {attributes N, B}',
        children: [
          {
            id: 'a.b',
            path: ['a', 'b'],
            type: 'list',
            name: 'B / [list with 2 items]',
            children: [
              {
                id: 'a.b.0',
                path: ['a', 'b', 0],
                type: 'tree',
                name: '{attributes C, D}',
                children: [
                  {
                    id: 'a.b.0.d',
                    path: ['a', 'b', 0, 'd'],
                    type: 'leaf',
                    name: 'D',
                    value: 'dodo'
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
  expect(processed).toStrictEqual(correctProcessed)
  expect(true).toStrictEqual(true)
})

test('traverseJson and processJsonNode', () => {
  const srcJson = {
    r: 'roro',
    a: { n: 'nono', b: [{ c: 1, d: 'dodo' }, 'meuh'] }
  }
  const processed = traverseJson(srcJson, processJsonNode)
  const correctProcessed = {
    id: '',
    path: [],
    type: 'tree',
    name: '{attributes R, A}',
    children: [
      { id: 'r', path: ['r'], type: 'leaf', name: 'R', value: 'roro' },
      {
        id: 'a',
        path: ['a'],
        type: 'tree',
        name: 'A / {attributes N, B}',
        children: [
          {
            id: 'a.n',
            path: ['a', 'n'],
            type: 'leaf',
            name: 'N',
            value: 'nono'
          },
          {
            id: 'a.b',
            path: ['a', 'b'],
            type: 'list',
            name: 'B / [list with 2 items]',
            children: [
              {
                id: 'a.b.0',
                path: ['a', 'b', 0],
                type: 'tree',
                name: '{attributes C, D}',
                children: [
                  {
                    id: 'a.b.0.c',
                    path: ['a', 'b', 0, 'c'],
                    type: 'leaf',
                    name: 'C',
                    value: 1
                  },
                  {
                    id: 'a.b.0.d',
                    path: ['a', 'b', 0, 'd'],
                    type: 'leaf',
                    name: 'D',
                    value: 'dodo'
                  }
                ]
              },
              { id: 'a.b.1', path: ['a', 'b', 1], type: 'leaf', value: 'meuh' }
            ]
          }
        ]
      }
    ]
  }
  // console.log(JSON.stringify(processed))
  expect(processed).toStrictEqual(correctProcessed)
  expect(true).toStrictEqual(true)
})

test('traverseJson and filter', () => {
  const srcJson = {
    r: 'roro',
    a: { n: 'nono', b: [{ c: 1, d: 'dodo' }, 'meuh'] }
  }
  const process = (json, path, type, children) => {
    const item = { path, type }
    if (type === nodeTypes.LEAF) {
      item.value = json
    }
    if (children) {
      item.children = children
    }
    return item
  }
  const predicate = item =>
    item?.value === 'dodo' || Object.keys(item?.children || {}).length > 0

  const processAndFilter = (json, path, type, children) => {
    const item = process(json, path, type, children)
    return predicate(item) ? item : undefined
  }
  const processed = traverseJson(srcJson, processAndFilter)
  const correctProcessed = {
    path: [],
    type: 'tree',
    children: [
      {
        path: ['a'],
        type: 'tree',
        children: [
          {
            path: ['a', 'b'],
            type: 'list',
            children: [
              {
                path: ['a', 'b', 0],
                type: 'tree',
                children: [
                  { path: ['a', 'b', 0, 'd'], value: 'dodo', type: 'leaf' }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
  expect(processed).toStrictEqual(correctProcessed)
})
test('traverseJson and process', () => {
  const srcJson = {
    r: 'roro',
    a: { n: 'nono', b: [{ c: 1, d: 'dodo' }, 'meuh'] }
  }
  const process = (json, path, type, children) => {
    const item = { path, type }
    if (type === nodeTypes.LEAF) {
      item.value = json
    }
    if (children) {
      item.children = children
    }
    return item
  }
  const processed = traverseJson(srcJson, process)
  const correctProcessed = {
    path: [],
    type: 'tree',
    children: [
      { path: ['r'], value: 'roro', type: 'leaf' },
      {
        path: ['a'],
        type: 'tree',
        children: [
          { path: ['a', 'n'], value: 'nono', type: 'leaf' },
          {
            path: ['a', 'b'],
            type: 'list',
            children: [
              {
                path: ['a', 'b', 0],
                type: 'tree',
                children: [
                  { path: ['a', 'b', 0, 'c'], value: 1, type: 'leaf' },
                  { path: ['a', 'b', 0, 'd'], value: 'dodo', type: 'leaf' }
                ]
              },
              { path: ['a', 'b', 1], value: 'meuh', type: 'leaf' }
            ]
          }
        ]
      }
    ]
  }
  expect(processed).toStrictEqual(correctProcessed)
})

test('traverseJson', () => {
  const srcJson = {
    r: 'roro',
    a: { n: 'nono', b: [{ c: 1, d: 'dodo' }, { c: 2 }, 'meuh'] }
  }
  const list = []

  const represent = (json, type) => {
    switch (type) {
      case nodeTypes.LEAF:
        return json
      case nodeTypes.TREE:
        return `{${Object.keys(json).join(' ')}}`
      case nodeTypes.LIST:
        return `[${json.length}]`
      default:
        return undefined
    }
  }
  const process = (json, path, type, children) => {
    list.push([path, represent(json, type), type, !!children])
  }
  traverseJson(srcJson, process)
  const correctList = [
    [['r'], 'roro', 'leaf', false],
    [['a', 'n'], 'nono', 'leaf', false],
    [['a', 'b', 0, 'c'], 1, 'leaf', false],
    [['a', 'b', 0, 'd'], 'dodo', 'leaf', false],
    [['a', 'b', 0], '{c d}', 'tree', true],
    [['a', 'b', 1, 'c'], 2, 'leaf', false],
    [['a', 'b', 1], '{c}', 'tree', true],
    [['a', 'b', 2], 'meuh', 'leaf', false],
    [['a', 'b'], '[3]', 'list', true],
    [['a'], '{n b}', 'tree', true],
    [[], '{r a}', 'tree', true]
  ]
  expect(list).toStrictEqual(correctList)
})

test('simple itemifyJSON', () => {
  const json = { n: 'root' }
  const correctItems = [
    {
      type: TREE,
      id: '',
      path: [],
      name: '{attributes N}',
      children: [{ id: 'n', path: ['n'], value: 'root', type: LEAF, name: 'N' }]
    }
  ]
  const items = itemifyJSON(JSON.stringify(json))
  expect(items).toStrictEqual(correctItems)
})

test('complex itemifyJSON', () => {
  const json = {
    n: 'root',
    a: { n: 'child', b: [{ c: 1, d: 'roro' }, { c: 2 }, 'meuh'] }
  }
  const correctItems = [
    {
      id: '',
      path: [],
      type: 'tree',
      name: '{attributes N, A}',
      children: [
        { id: 'n', path: ['n'], type: 'leaf', name: 'N', value: 'root' },
        {
          id: 'a',
          path: ['a'],
          type: 'tree',
          name: 'A / {attributes N, B}',
          children: [
            {
              id: 'a.n',
              path: ['a', 'n'],
              type: 'leaf',
              name: 'N',
              value: 'child'
            },
            {
              id: 'a.b',
              path: ['a', 'b'],
              type: 'list',
              name: 'B / [list with 3 items]',
              children: [
                {
                  id: 'a.b.0',
                  path: ['a', 'b', 0],
                  type: 'tree',
                  name: '{attributes C, D}',
                  children: [
                    {
                      id: 'a.b.0.c',
                      path: ['a', 'b', 0, 'c'],
                      type: 'leaf',
                      name: 'C',
                      value: 1
                    },
                    {
                      id: 'a.b.0.d',
                      path: ['a', 'b', 0, 'd'],
                      type: 'leaf',
                      name: 'D',
                      value: 'roro'
                    }
                  ]
                },
                {
                  id: 'a.b.1',
                  path: ['a', 'b', 1],
                  type: 'tree',
                  name: '{attributes C}',
                  children: [
                    {
                      id: 'a.b.1.c',
                      path: ['a', 'b', 1, 'c'],
                      type: 'leaf',
                      name: 'C',
                      value: 2
                    }
                  ]
                },
                {
                  id: 'a.b.2',
                  path: ['a', 'b', 2],
                  type: 'leaf',
                  value: 'meuh'
                }
              ]
            }
          ]
        }
      ]
    }
  ]
  const items = itemifyJSON(JSON.stringify(json))
  expect(items).toStrictEqual(correctItems)
})

test('itemifyJSON with empty array/object', () => {
  const json = { n: [], o: {} }
  const correctItems = [
    {
      type: TREE,
      id: '',
      path: [],
      name: '{attributes N, O}',
      children: [
        {
          id: 'n',
          path: ['n'],
          type: LIST,
          name: 'N / [empty list]'
        },
        {
          id: 'o',
          path: ['o'],
          type: TREE,
          name: 'O / {no attributes}'
        }
      ]
    }
  ]
  const items = itemifyJSON(JSON.stringify(json))
  expect(items).toStrictEqual(correctItems)
})

test('itemifyJSON with empty array/object and filter', () => {
  const json = { nono: [], o: {} }
  const correctItems = [
    {
      id: '',
      type: TREE,
      path: [],
      name: '{attributes Nono, O}',
      children: [
        {
          id: 'nono',
          path: ['nono'],
          type: LIST,
          name: 'Nono / [empty list]'
        }
      ]
    }
  ]
  const items = itemifyJSON(JSON.stringify(json), 'no')

  expect(items).toStrictEqual(correctItems)
})

test('complex itemifyJSON with filter that matches', () => {
  const json = {
    n: 'root',
    a: { n: 'child', b: [{ c: 1, d: 'roro' }, { c: 2 }, 'meuh'] }
  }
  const correctItems = [
    {
      type: TREE,
      id: '',
      name: '{attributes N, A}',
      path: [],
      children: [
        {
          type: TREE,
          id: 'a',
          name: 'A / {attributes N, B}',
          path: ['a'],
          children: [
            {
              type: LIST,
              id: 'a.b',
              name: 'B / [list with 3 items]',
              path: ['a', 'b'],
              children: [
                {
                  id: 'a.b.0',
                  type: TREE,
                  path: ['a', 'b', 0],
                  name: '{attributes C, D}',
                  children: [
                    {
                      type: LEAF,
                      id: 'a.b.0.d',
                      path: ['a', 'b', 0, 'd'],
                      name: 'D',
                      value: 'roro'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
  let items = itemifyJSON(JSON.stringify(json), 'roro')
  expect(items).toStrictEqual(correctItems)
  items = itemifyJSON(JSON.stringify(json), 'ror')
  expect(items).toStrictEqual(correctItems)
  items = itemifyJSON(JSON.stringify(json), 'ROR')
  expect(items).toStrictEqual(correctItems)
})

test('complex itemifyJSON with filter that does not match', () => {
  const json = {
    n: 'root',
    a: { n: 'child', b: [{ c: 1, d: 'roro' }, { c: 2 }, 'meuh'] }
  }
  const correctItems = [[]]
  const items = itemifyJSON(JSON.stringify(json), 'XXX')
  expect(items).toStrictEqual(correctItems)
})

test('complex itemifyJSON old', () => {
  const json = {
    n: 'root',
    a: { n: 'child', b: [{ c: 1, d: 'roro' }, { c: 2 }, 'meuh'] }
  }
  const correctItems = [
    {
      id: 11,
      name: '{attributes N, A}',
      path: [],
      type: 'tree',
      children: [
        { id: 2, value: 'root', type: 'leaf', path: ['n'], name: 'N' },
        {
          id: 11,
          name: 'A / {attributes N, B}',
          path: ['a'],
          type: 'tree',
          children: [
            {
              id: 4,
              value: 'child',
              type: 'leaf',
              path: ['a', 'n'],
              name: 'N'
            },
            {
              id: 11,
              path: ['a', 'b'],
              name: 'B / [list with 3 items]',
              type: 'list',
              children: [
                {
                  id: 8,
                  name: '{attributes C, D}',
                  path: ['a', 'b', 0],
                  type: 'tree',
                  children: [
                    {
                      id: 7,
                      value: 1,
                      type: 'leaf',
                      path: ['a', 'b', 0, 'c'],
                      name: 'C'
                    },
                    {
                      id: 8,
                      value: 'roro',
                      type: 'leaf',
                      path: ['a', 'b', 0, 'd'],
                      name: 'D'
                    }
                  ]
                },
                {
                  id: 10,
                  name: '{attributes C}',
                  path: ['a', 'b', 1],
                  type: 'tree',
                  children: [
                    {
                      id: 10,
                      value: 2,
                      type: 'leaf',
                      path: ['a', 'b', 1, 'c'],
                      name: 'C'
                    }
                  ]
                },
                { id: 11, value: 'meuh', type: 'leaf', path: ['a', 'b', 2] }
              ]
            }
          ]
        }
      ]
    }
  ]
  const items = itemifyJSONOld(JSON.stringify(json))
  expect(items).toStrictEqual(correctItems)
})

test('simple itemifyJSON old', () => {
  const json = { n: 'root' }
  const correctItems = [
    {
      type: TREE,
      id: 2,
      path: [],
      name: '{attributes N}',
      children: [{ id: 2, path: ['n'], value: 'root', type: LEAF, name: 'N' }]
    }
  ]
  const items = itemifyJSONOld(JSON.stringify(json))

  expect(items).toStrictEqual(correctItems)
})

test('itemifyJSON with empty array/object old', () => {
  const json = { n: [], o: {} }
  const correctItems = [
    {
      type: TREE,
      id: 3,
      path: [],
      name: '{attributes N, O}',
      children: [
        {
          path: ['n'],
          id: 2,
          type: LIST,
          name: 'N / [empty list]'
        },
        {
          id: 3,
          path: ['o'],
          type: TREE,
          name: 'O / {no attributes}'
        }
      ]
    }
  ]
  const items = itemifyJSONOld(JSON.stringify(json))

  expect(items).toStrictEqual(correctItems)
})

test('itemifyJSON with empty array/object and filter old', () => {
  const json = { nono: [], o: {} }
  const correctItems = [
    {
      type: TREE,
      id: 3,
      path: [],
      name: '{attributes Nono, O}',
      children: [
        {
          // TODO this is what we want:
          //
          // path: ['nono'],
          // type: LIST,
          // name: 'Nono / [empty list]'
          name: 'Nono'
        }
      ]
    }
  ]
  const items = itemifyJSONOld(JSON.stringify(json), 'no')

  expect(items).toStrictEqual(correctItems)
})

test('complex itemifyJSON with filter that matches old', () => {
  const json = {
    n: 'root',
    a: { n: 'child', b: [{ c: 1, d: 'roro' }, { c: 2 }, 'meuh'] }
  }
  const correctItems = [
    {
      id: 11,
      name: '{attributes N, A}',
      path: [],
      type: 'tree',
      children: [
        {
          id: 11,
          name: 'A / {attributes N, B}',
          path: ['a'],
          type: 'tree',
          children: [
            {
              id: 11,
              path: ['a', 'b'],
              name: 'B / [list with 1 item]',
              type: 'list',
              children: [
                {
                  id: 8,
                  name: '{attributes C, D}',
                  path: ['a', 'b', 0],
                  type: 'tree',
                  children: [
                    {
                      id: 8,
                      value: 'roro',
                      type: 'leaf',
                      path: ['a', 'b', 0, 'd'],
                      name: 'D'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
  let items = itemifyJSONOld(JSON.stringify(json), 'roro')
  expect(items).toStrictEqual(correctItems)
  items = itemifyJSONOld(JSON.stringify(json), 'ror')
  expect(items).toStrictEqual(correctItems)
  items = itemifyJSONOld(JSON.stringify(json), 'ROR')
  expect(items).toStrictEqual(correctItems)
})

test('complex itemifyJSON with filter that does not match old', () => {
  const json = {
    n: 'root',
    a: { n: 'child', b: [{ c: 1, d: 'roro' }, { c: 2 }, 'meuh'] }
  }
  const correctItems = [[]]
  const items = itemifyJSONOld(JSON.stringify(json), 'XXX')
  expect(items).toStrictEqual(correctItems)
})

test('item JsonPath for object', () => {
  const json = { a: { b: 'roro' } }
  const correctItems = [
    {
      id: '',
      type: TREE,
      name: '{attributes A}',
      path: [],
      children: [
        {
          id: 'a',
          type: TREE,
          path: ['a'],
          name: 'A / {attributes B}',
          children: [
            {
              id: 'a.b',
              type: LEAF,
              name: 'B',
              path: ['a', 'b'],
              value: 'roro'
            }
          ]
        }
      ]
    }
  ]
  const items = itemifyJSON(JSON.stringify(json))
  expect(items).toStrictEqual(correctItems)

  const obj = items[0].children[0].children[0]

  expect(obj.path).toStrictEqual(['a', 'b'])
  const path = pathArrayToJsonPath(obj.path)
  expect(JSONPath({ path, json })).toStrictEqual([json.a.b])
})

test('item JsonPath for array element', () => {
  const json = { c: ['toto'] }
  const correctItems = [
    {
      id: '',
      type: TREE,
      name: '{attributes C}',
      path: [],
      children: [
        {
          type: LIST,
          id: 'c',
          name: 'C / [list with 1 item]',
          path: ['c'],
          children: [
            {
              id: 'c.0',
              type: LEAF,
              path: ['c', 0],
              value: 'toto'
            }
          ]
        }
      ]
    }
  ]
  const items = itemifyJSON(JSON.stringify(json))
  expect(items).toStrictEqual(correctItems)

  const arrayEl = items[0].children[0].children[0]
  expect(arrayEl.path).toStrictEqual(['c', 0])
  const path = pathArrayToJsonPath(arrayEl.path)
  expect(JSONPath({ path, json })).toStrictEqual([json.c[0]])
})

test('item JsonPath for big array element', () => {
  const json = {
    c: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  }
  const correctItems = [
    {
      id: '',
      path: [],
      type: 'tree',
      name: '{attributes C}',
      children: [
        {
          id: 'c',
          path: ['c'],
          type: 'list',
          name: 'C / [list with 12 items]',
          children: [
            {
              id: 'c[0:10]',
              name: '[elements 1 - 10]',
              path: ['c'],
              children: [
                { id: 'c.0', path: ['c', 0], type: 'leaf', value: 1 },
                { id: 'c.1', path: ['c', 1], type: 'leaf', value: 2 },
                { id: 'c.2', path: ['c', 2], type: 'leaf', value: 3 },
                { id: 'c.3', path: ['c', 3], type: 'leaf', value: 4 },
                { id: 'c.4', path: ['c', 4], type: 'leaf', value: 5 },
                { id: 'c.5', path: ['c', 5], type: 'leaf', value: 6 },
                { id: 'c.6', path: ['c', 6], type: 'leaf', value: 7 },
                { id: 'c.7', path: ['c', 7], type: 'leaf', value: 8 },
                { id: 'c.8', path: ['c', 8], type: 'leaf', value: 9 },
                { id: 'c.9', path: ['c', 9], type: 'leaf', value: 10 }
              ],
              type: 'list'
            },
            {
              id: 'c[10:12]',
              name: '[elements 11 - 12]',
              path: ['c'],
              children: [
                { id: 'c.10', path: ['c', 10], type: 'leaf', value: 11 },
                { id: 'c.11', path: ['c', 11], type: 'leaf', value: 12 }
              ],
              type: 'list'
            }
          ]
        }
      ]
    }
  ]
  const items = itemifyJSON(JSON.stringify(json))
  expect(items).toStrictEqual(correctItems)

  const array = items[0].children[0]
  const subArray0 = array.children[0]

  const arrayPath0 = subArray0.children[5].path
  expect(arrayPath0).toStrictEqual(['c', 5])
  const jsonPath0 = pathArrayToJsonPath(arrayPath0)
  expect(JSONPath({ path: jsonPath0, json })).toStrictEqual([json.c[5]])

  const subArray1 = array.children[1]

  const arrayPath1 = subArray1.children[1].path
  expect(arrayPath1).toStrictEqual(['c', 11])
  const jsonPath1 = pathArrayToJsonPath(arrayPath1)
  expect(JSONPath({ path: jsonPath1, json })).toStrictEqual([json.c[11]])
})
