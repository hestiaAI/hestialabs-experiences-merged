import type { DatabaseConfig } from '@/types'
import { SQLType } from '@/types/database-config'

const { TEXT } = SQLType

const config: DatabaseConfig = {
  tables: [
    {
      name: 'TrackerControl',
      columns: [
        ['uid', TEXT],
        ['daddr', TEXT],
        ['time', TEXT],
        ['tracker', TEXT],
        ['category', TEXT],
        ['package', TEXT],
        ['app', TEXT],
        ['filePath', TEXT, 'FILEPATH']
      ]
    }
  ],
  getters: [
    {
      fileId: 'tracker-control',
      path: '$.result.items[*]',
      table: 'TrackerControl',
      getters: [
        {
          column: 'uid',
          path: '$.uid'
        },
        {
          column: 'daddr',
          path: '$.daddr'
        },
        {
          column: 'time',
          path: '$.date'
        },
        {
          column: 'tracker',
          path: '$.Tracker'
        },
        {
          column: 'category',
          path: '$.Category'
        },
        {
          column: 'package',
          path: '$.Package'
        },
        {
          column: 'app',
          path: '$.App'
        }
      ]
    }
  ]
}

export default config
