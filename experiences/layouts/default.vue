<template>
  <VApp v-if="$store.state.loaded">
    <TheAppBar />
    <VMain>
      <Nuxt />
      <VSnackbar
        v-model="snackbar"
        content-class="v-snack__content-online-status"
        color="info"
        :timeout="timeout"
      >
        <template v-if="$nuxt.isOffline">
          The app is running in offline mode
        </template>
        <template v-else>
          You are online again!
        </template>
      </VSnackbar>
      <VAlert
        :value="alert"
        border="right"
        colored-border
        color="primary"
        elevation="2"
        close-text="Not now"
        dismissible
        max-width="20%"
        class="fixedAlert"
        transition="slide-x-transition"
        fixed
        bottom
        left
        @input="alertClosed"
      >
        Want to know more about our work ?
        <br>
        <a :href="newsletterURL" target="_blank" rel="noreferrer noopener">
          {{ newsletterMessage }}
        </a>
      </VAlert>
    </VMain>
    <VFooter app absolute color="primary">
      <div class="lighten-2 py-2 ma-auto white--text" align="center">
        &copy; Copyright 2022
        <a
          href="https://hestia.ai"
          target="_blank"
          style="color: white"
        >Hestia.ai</a>
        <br>
        The Digipower.academy has emerged out of projects initiated separately by
        <a
          href="https://www.sitra.fi/en/projects/digipower-investigation"
          target="_blank"
          style="color: white"
        >SITRA</a>, <a
          href="https://www.migros-engagement.ch/en/news-projects/technology-ethics/hestialabs"
          target="_blank"
          style="color: white"
        >Migros Pioneer Fund</a> (via the
        <a
          href="http://www.hestialabs.org"
          target="_blank"
          style="color: white"
        >HestiaLabs </a> project) and
        <a
          href="https://personaldata.io/"
          target="_blank"
          style="color: white"
        >PersonalData.IO </a>
      </div>
    </VFooter>
  </VApp>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  async middleware({
    store,
    params: { bubble },
    route: { path },
    isDev,
    redirect,
    $auth,
    $axios
  }) {
    if (!store.state.loaded) {
      await store.dispatch('loadExperiences', { isDev, $axios })
    }
    if (bubble && $auth.loggedIn && bubble !== $auth.user.username) {
      // auto-logout if user tries to enter another bubble
      await $auth.logout()
      return redirect({
        name: 'login',
        query: { redirect: path }
      })
    }
  },
  data() {
    return {
      // Display offline message if user opens app when offline
      snackbar: this.$nuxt.isOffline,
      timeout: 5000,
      alert: false
    }
  },
  head() {
    if (!this.appName) {
      return
    }
    return {
      meta: [
        {
          hid: 'og:title',
          property: 'og:title',
          content: this.appName
        },
        {
          hid: 'og:url',
          property: 'og:url',
          content: this.$url(this.$route)
        },
        {
          hid: 'twitter:title',
          property: 'twitter:title',
          content: this.appName
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['experience', 'appName']),
    collaborator() {
      const { collaborator = {} } = this.experience(this.$route)
      return collaborator
    },
    newsletterURL() {
      const { url = 'https://hestialabs.org/' } = this.collaborator
      return `${url}#newsletter`
    },
    newsletterMessage() {
      const { title = 'HestiaLabs' } = this.collaborator
      const genitiveCaseEnding = title.endsWith('s') ? '’' : '’s'
      return `Subscribe to ${title}${genitiveCaseEnding} newsletter!`
    }
  },
  watch: {
    '$nuxt.isOffline'(isOffline) {
      this.snackbar = true
      // changing timeout property resets the timeout
      this.timeout = isOffline ? 5001 : 5000
    }
  },
  mounted() {
    if (!window.Worker) {
      this.$nuxt.error({
        statusCode: 500,
        message: 'Web Workers are not supported by this browser'
      })
    }
    // Show the newsletter alert once a day
    /*
    if (
      !this.alert &&
      (!localStorage.alertNewsletterDismissed ||
        new Date().getTime() -
          new Date(localStorage.alertNewsletterDismissed).getTime() >
          1000 * 3600 * 24) // one day in milliseconds
    ) {
      window.setInterval(() => {
        this.alert = true
      }, 3000)
    }
    */
  },
  methods: {
    alertClosed() {
      localStorage.alertNewsletterDismissed = new Date()
    }
  }
}
</script>

<style lang="sass">
@import "./assets/styles"

.v-snack__content.v-snack__content-online-status
  text-align: center
</style>
<style scoped>
.fixedAlert {
  position: fixed;
  bottom: 0px;
  z-index: 2500;
}
</style>
