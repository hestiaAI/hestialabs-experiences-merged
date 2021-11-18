import allPreprocessors from './preprocessors'
import { validExtensions, extractFirstDirectory } from './utils'

// require all modules on the path and with the pattern defined
// Warning! The arguments passed to require.context must be literals!
// https://github.com/webpack/docs/wiki/context#context-module-api
// https://stackoverflow.com/a/54066904/8238129
// https://stackoverflow.com/a/57009738/8238129
const reqJSON = require.context(
  './experiences/',
  true,
  /^\.\/[a-z-]+\/[a-z-]+\.json$/
)
const reqYARRRML = require.context(
  './experiences/',
  true,
  /^\.\/[a-z-]+\/[a-z0-9-]+.ya?ml$/
)
const reqSPARQL = require.context(
  './experiences/',
  true,
  /^\.\/[a-z-]+\/queries\/[a-z0-9-]+.rq$/
)
const reqVEGA = require.context(
  './experiences/',
  true,
  /^\.\/[a-z-]+\/visualizations\/[a-z0-9-]+.vega.json$/
)

// files in assets/data/ are loaded only with file-loader
const reqData = require.context('../assets/data/', true, /.*/)
const dataSamples = reqData
  .keys()
  // filter out invalid keys, and only keep valid extensions
  // JSON files appear twice
  // -> for example ./people.json and ./people
  .filter(k =>
    k.match(new RegExp(`^\\.\\/[a-z0-9-]+\\.(${validExtensions.join('|')})$`))
  )
  .map(key => ({
    key,
    filename: key.replace('./', ''),
    path: reqData(key)
  }))

// Import configs from JSON files
const manifests = Object.fromEntries(
  reqJSON.keys().map(path => {
    // Extract directory name of the experience
    const dir = extractFirstDirectory(path)

    // Extract JSON config
    const {
      title,
      subtitle = 'Data Experience',
      icon,
      ext: extensions,
      files = [],
      multiple = false,
      data: dataFiles = [],
      collaborator,
      isGenericViewer,
      url,
      showDataExplorer,
      preprocessors = {},
      ...rest
    } = reqJSON(path)

    if (typeof collaborator === 'object' && collaborator.icon) {
      collaborator.icon = require(`@/manifests/icons/${collaborator.icon}`)
    }

    let data = dataSamples.filter(({ filename }) =>
      dataFiles.includes(filename)
    )
    let ext = extensions

    if (dir === 'playground') {
      // Add all data samples to playground
      data = dataSamples
      // All extensions are allowed in the playground
      ext = validExtensions.join(',')
    }
    // Validate config
    const requiredParams = { title, icon, ext }
    if (!isGenericViewer && !url) {
      Object.entries(requiredParams).forEach(([name, param]) => {
        if (!param) {
          throw new Error(`[${dir}] ${name} is required`)
        }
      })
      if (ext.split(',').some(v => !validExtensions.includes(v))) {
        throw new Error(`[${dir}] parameter ext is invalid`)
      }

      if (dir !== 'playground' && ext.includes('zip') && !files.length) {
        throw new Error(
          `[${dir}] extension zip specified but list of files to extract is empty`
        )
      }
    }
    Object.values(preprocessors).forEach(preprocessor => {
      if (!(preprocessor in allPreprocessors)) {
        throw new Error(`[${dir}] Preprocessor ${preprocessor} does not exist`)
      }
    })
    const preprocessorFuncs = Object.fromEntries(
      Object.entries(preprocessors).map(([filename, preprocessorName]) => [
        filename,
        allPreprocessors[preprocessorName]
      ])
    )

    if (isGenericViewer && !showDataExplorer) {
      throw new Error('the explorer experience must show the data explorer')
    }

    const module = require(`./experiences/${dir}/`)

    return [
      dir,
      {
        title,
        subtitle,
        icon: require(`@/manifests/icons/${icon}`),
        ext,
        files,
        multiple,
        data,
        preprocessors: preprocessorFuncs,
        collaborator,
        isGenericViewer,
        url,
        showDataExplorer,
        sparql: {},
        vega: {},
        ...rest,
        ...module.default
      }
    ]
  })
)

reqYARRRML.keys().forEach(path => {
  // Extract directory name of the experience
  const dir = extractFirstDirectory(path)
  // Take corresponding manifest
  const manifest = manifests[dir]
  // Add YARRRML
  if (manifest.yarrrml !== undefined) {
    throw new Error(`[${dir}] Only one YARRRML file should be defined`)
  }
  manifest.yarrrml = reqYARRRML(path).default
})

reqSPARQL.keys().forEach(path => {
  // Extract directory name of the experience
  const dir = extractFirstDirectory(path)
  // Take corresponding manifest
  const manifest = manifests[dir]
  // Extract query name
  const match = path.match(/\/queries\/(?<name>.+)\.rq/)
  const { name } = match.groups
  // Add SPARQL
  manifest.sparql[name] = reqSPARQL(path).default
})

reqVEGA.keys().forEach(path => {
  // Extract directory name of the experience
  const dir = extractFirstDirectory(path)
  // Take corresponding manifest
  const manifest = manifests[dir]
  // Extract viz name
  const match = path.match(/\/visualizations\/(?<name>.+)\.vega.json/)
  const { name } = match.groups
  // Add Vega
  manifest.vega[name] = reqVEGA(path)
})

Object.entries(manifests).forEach(([key, val]) => {
  val.key = key
})

export default manifests
