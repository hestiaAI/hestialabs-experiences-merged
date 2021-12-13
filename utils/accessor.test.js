import { posix } from 'path'
import { JSONPath } from 'jsonpath-plus'
import minimatch from 'minimatch'
import Ajv from 'ajv'
import { matchNormalized, findMatches } from './accessor'

const ajv = new Ajv()
const path = posix

function findObjects(fileDict, accessor) {
  return Object.entries(fileDict)
    .flatMap(([name, content]) => findMatches(name, content, accessor))
    .filter(found => !!found)
}

function matchFiles(files, pattern) {
  return Object.entries(files).filter(([name]) =>
    matchNormalized(name, pattern)
  )
}

test('normalize and match', () => {
  expect(minimatch('bar.foo', '*.foo')).toBe(true)
  expect(path.normalize('/foo//baz/asdf/quux/..')).toBe('/foo/baz/asdf')
  expect(path.normalize('/foo//**/asdf/quux/..')).toBe('/foo/**/asdf')
  expect(path.normalize('foo/**//asdf/quux/..')).toBe('foo/**/asdf')

  expect(matchNormalized('bar.foo', '*.foo')).toBe(true)
  expect(matchNormalized('/foo/asdf', '/foo//asdf/quux/..')).toBe(true)
  expect(matchNormalized('/foo/bar.foo', '/foo//asdf/../*.foo')).toBe(true)
})

test('find files', () => {
  const files = {
    '/bambalam/rototo/woo.png': { furniture: [{ s: 4 }, { s: 1 }] },
    '/bomba.csv': { furniture: [{ s: 4 }, { s: 2 }] },
    '/bambalam/rototo/woo.csv': { furniture: [{ s: 4 }, { s: 2 }, { s: 1 }] }
  }
  const found = matchFiles(files, '**/*.csv')
  expect(found.length).toBe(2)
  expect(found[0][0]).toBe('/bomba.csv')
  expect(found[1][0]).toBe('/bambalam/rototo/woo.csv')
})

const mkA = (filePath, jsonPath, jsonSchema) => ({
  filePath,
  jsonPath,
  jsonSchema
})

test('match objects', () => {
  const content = { fur: [{ s: 5 }, { s: 4 }] }

  const schema = {
    type: 'object',
    properties: { s: { type: 'integer' } },
    required: ['s']
  }

  let found = findMatches('/bo.c', content, mkA('**/bo.c'))
  expect(found[0]).toStrictEqual(content)

  found = findMatches('/bo.c', content, mkA('**/bo.c', '$.fur[0]'))
  expect(found[0]).toStrictEqual({ s: 5 })

  found = findMatches('/bo.c', content, mkA('**/bo.c', '$.fur[0]', schema))
  expect(found[0]).toStrictEqual({ s: 5 })

  const wrongSchema = {
    type: 'object',
    properties: { s: { type: 'string' } },
    required: ['s']
  }
  found = findMatches('/bo.c', content, mkA('**/bo.c', '$.fur[0]', wrongSchema))
  expect(found).toStrictEqual(null)

  found = findMatches('/ob.c', content, mkA('**/bo.c', '$.furn[0]'))
  expect(found).toStrictEqual(null)

  found = findMatches('/bo.c', content, mkA('**/bo.c', '$.furni[0]'))
  expect(found).toStrictEqual(null)
})

test('find objects', () => {
  const files = {
    '/bambalam/rototo/woo.png': { furniture: [{ s: 4 }, { s: 1 }] },
    '/bomba.csv': { furniture: [{ s: 5 }, { s: 4 }, { s: 2 }] },
    '/bambalam/rototo/woo.csv': { furniture: [{ s: 4 }, { s: 2 }, { s: 1 }] }
  }

  const found = findObjects(files, {
    filePath: '/bomba.csv',
    jsonPath: '$.furniture[0]'
  })
  expect(found[0]).toStrictEqual({ s: 5 })
})

test('jsonpath examples', () => {
  const json = { furniture: [{ s: 4 }, { s: 1 }] }
  expect(JSONPath({ path: '$.foo', json })).toStrictEqual([])
  expect(JSONPath({ path: '$.furniture', json })).toStrictEqual([
    json.furniture
  ])
  expect(JSONPath({ path: '$..furniture[?(@.s==1)]', json })).toStrictEqual([
    { s: 1 }
  ])
})

test('ajv examples', () => {
  const schema1 = {
    type: 'object',
    properties: {
      foo: { type: 'integer' },
      bar: { type: 'string' }
    },
    required: ['foo']
    // additionalProperties: true
  }

  const validate1 = ajv.compile(schema1)
  expect(validate1({ foo: 1, bul: 'tt', bar: 'abc' })).toBe(true)
  expect(validate1({ foo: 1, bar: 'ABC' })).toBe(true)
  expect(validate1({ foo: 1 })).toBe(true)
  expect(validate1({ bar: 'ABC' })).toBe(false)

  const schema2 = {
    type: 'object',
    properties: {
      fur: {
        type: 'array',
        items: {
          type: 'object',
          properties: { s: { type: 'integer' } },
          required: ['s']
        }
      }
    },
    required: ['fur']
  }
  const validate2 = ajv.compile(schema2)
  expect(validate2({ fur: [{ s: 5 }, { s: 4 }] })).toBe(true)
})
