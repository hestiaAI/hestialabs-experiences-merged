<template>
  <VContainer v-if="values.length > 0">
    <VRow>
      <VCol cols="12">
        <p class="text-h6">
          Number of location records in your files
        </p>
        <p v-if="total === 0" class="text-subtitle-2">
          No location were found in your file(s).
        </p>
        <p v-else class="text-subtitle-2">
          We found <strong>{{ total }}</strong> locations in your file(s).
        </p>
      </VCol>
    </VRow>
    <template v-if="total > 0">
      <VRow>
        <VCol cols="12">
          <UnitIframe src="/kepler" :args="keplerArgs" />
        </VCol>
      </VRow>
      <VRow>
        <VCol cols="12">
          <UnitFilterableTable
            v-bind="{ headers: header, items: values }"
            @current-items="onTableFilter"
          />
        </VCol>
      </VRow>
    </template>
  </VContainer>
</template>
<script>
import mixin from './mixin'
import keplerConfig from './kepler-config'

export default {
  mixins: [mixin],
  data() {
    return {
      filteredRows: this.values,
      header: [
        { text: 'File', value: 'filename' },
        { text: 'Path', value: 'path' },
        { text: 'Latitude', value: 'latitude' },
        { text: 'Longitude', value: 'longitude' },
        { text: 'Description', value: 'description' }
      ]
    }
  },
  computed: {
    total() {
      return this.values.length
    },
    filtered() {
      return this.filteredRows.length
    },
    keplerData() {
      return {
        fields: this.header.map((h) => {
          return {
            name: h.value
          }
        }),
        rows: this.filteredRows.map(r => this.header.map(h => r[h.value]))
      }
    },
    keplerArgs() {
      return {
        keplerData: this.keplerData,
        config: keplerConfig
      }
    }
  },
  methods: {
    drawViz() {},
    onTableFilter(newItems) {
      this.filteredRows = newItems
    }
  }
}
</script>
