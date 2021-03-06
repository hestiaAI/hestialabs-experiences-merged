<template>
  <div>
    <VRow v-if="samples.length" justify="center" dense>
      <VCol align="center">
        <LazyUnitFilesSampleSelector
          :value.sync="selectedSamples"
          :items="samples"
          class="mb-4"
        />
      </VCol>
    </VRow>
    <VRow v-if="samples.length">
      <VCol align="center" class="font-weight-bold">
        OR
      </VCol>
    </VRow>
    <VRow>
      <VCol align="center">
        <div ref="dashboard" />
      </VCol>
    </VRow>
    <VRow>
      <VCol align="center">
        <BaseDialogButton
          dialog-title="Decrypt Files"
          tooltip-position="left"
          tooltip-label="Decrypt Files"
          icon="mdiLockOpenVariant"
        >
          <VTextField
            v-model="privateKey"
            label="Enter your secret key"
            clearable
          />
          <VTextField
            v-model="publicKey"
            label="Enter your public key (optional)"
            clearable
          />
        </BaseDialogButton>
        <BaseButton
          v-bind="{ disabled, progress, status, error }"
          text="Explore your data"
          icon="mdiStepForward"
          class="my-sm-2 mr-sm-4"
          @click="returnFiles"
        />
        <UnitFilesDialog :file-globs="Object.values(files)" main />
      </VCol>
    </VRow>
    <VRow>
      <VCol>
        <template v-if="progress">
          <BaseProgressCircular class="mr-2" />
          <span>Processing files...</span>
        </template>
        <template v-else-if="error || success">
          <BaseAlert
            :type="error ? 'error' : 'success'"
            border="left"
            dense
            text
          >
            {{ message }}
          </BaseAlert>
        </template>
      </VCol>
    </VRow>
  </div>
</template>

<script>
import { promisify } from 'util'
import { mapState } from 'vuex'
import Uppy from '@uppy/core'
import Dashboard from '@uppy/dashboard'
import DropTarget from '@uppy/drop-target'
import { decryptBlob } from '~/utils/encryption'

import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'
import '@uppy/drop-target/dist/style.css'

async function fetchSampleFile({ path, filename }) {
  const response = await window.fetch(path)
  const blob = await response.blob()
  return new File([blob], filename)
}

export default {
  name: 'UnitFiles',
  props: {
    progress: {
      type: Boolean,
      default: false
    },
    success: {
      type: Boolean,
      default: false
    },
    error: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: ''
    }
  },
  data() {
    const config = {
      debug: false,
      allowMultipleUploads: true,
      locale: { strings: { cancel: 'Clear all' } }
    }
    const { files, dataSamples } = this.$store.getters.experience(this.$route)
    return {
      uppy: new Uppy(config),
      samples: [],
      selectedSamples: [],
      filesEmpty: true,
      status: false,
      files,
      dataSamples,
      dialog: false,
      privateKey: null,
      publicKey: null
    }
  },
  computed: {
    ...mapState(['fileManager']),
    disabled() {
      return this.filesEmpty
    }
  },
  watch: {
    // Watch filemanager to detect a reset of the store, if it is null
    // we also delete files in the Uppy dashboard
    fileManager() {
      if (this.fileManager === null && this.uppy) {
        this.uppy.reset()
      }
    },
    // Watch files, if user empty all files we reset the store and delete all files
    filesEmpty() {
      if (this.filesEmpty && this.fileManager) {
        this.$store.commit('clearStore')
      }
    },
    async selectedSamples(newSamples, oldSamples) {
      if (newSamples.length > oldSamples.length) {
        // some sample was added
        const addedSamples = newSamples.filter(
          ns => !oldSamples.find(os => os.filename === ns.filename)
        )
        const files = await Promise.all(addedSamples.map(fetchSampleFile))
        files.forEach((file) => {
          try {
            this.uppy.addFile({
              name: file.name,
              type: file.type,
              data: file
            })
          } catch (error) {
            // addFile gives an error if the file cannot be added
            // -> most likely restrictions checks failed
            this.selectedSamples = oldSamples
            this.uppy.info(error.message)
          }
        })
      } else {
        // some sample was removed
        const removedSamples = oldSamples.filter(
          os => !newSamples.find(ns => ns.filename === os.filename)
        )
        removedSamples.forEach((sample) => {
          const file = this.uppy
            .getFiles()
            .find(f => f.name === sample.filename)
          if (file) {
            this.uppy.removeFile(file.id)
          }
        })
      }
    }
  },
  async created() {
    // files in assets/data/ are loaded with file-loader
    this.samples = []
    for (const filename of this.dataSamples) {
      this.samples.push({
        filename,
        path: (await import(`@/assets/data/${filename}`)).default
      })
    }
  },
  mounted() {
    this.uppy
      .use(Dashboard, {
        target: this.$refs.dashboard,
        inline: true,
        // we're currently not uploading to a server
        hideUploadButton: true,
        proudlyDisplayPoweredByUppy: false,
        theme: 'light',
        height: 300
      })
      // allow dropping files anywhere on the page
      .use(DropTarget, { target: document.body })
      .on('files-added', () => {
        this.filesEmpty = false
      })
      .on('cancel-all', () => {
        this.filesEmpty = true
        this.selectedSamples = []
      })
      .on('file-removed', (file, reason) => {
        if (reason === 'removed-by-user') {
          // ensure selectedSamples is updated if sample file is removed using the Uppy dashboard
          this.selectedSamples = this.selectedSamples.filter(
            s => s.filename !== file.name
          )
        }

        if (reason !== 'cancel-all' && !this.uppy.getFiles().length) {
          this.filesEmpty = true
        }
      })
  },
  beforeDestroy() {
    this.uppy.close()
  },
  methods: {
    returnFiles() {
      const decryptBlobPromise = promisify(decryptBlob)
      const publicKey =
        this.publicKey || this.$store.getters.routeConfig(this.$route).publicKey
      Promise.all(
        this.uppy.getFiles().map((f) => {
          return this.privateKey
            ? decryptBlobPromise(f.data, this.privateKey, publicKey).then(
              blob => new File([blob], f.name)
            )
            : f.data
        })
      )
        .then((decryptedFiles) => {
          this.status = true
          this.$emit('update', { uppyFiles: decryptedFiles })
        })
        .catch((error) => {
          console.error(error)
        })
    }
  }
}
</script>

<style scoped>
::v-deep .uppy-Dashboard-AddFiles-title {
  font-size: 1rem;
}
::v-deep .uppy-Dashboard-inner {
  margin: auto;
}
</style>
