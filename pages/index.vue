<template>
  <v-layout
    column
    justify-center
    align-center
  >
    <v-flex
      xs12
      sm8
      md6
    >
      <v-card>
        <v-card-title class="headline">
          Welcome to the PH Audit page
        </v-card-title>
        <v-card-text>
          <p>
            go to the /admin url to see the audit table.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            flat
            nuxt
            to="/admin"
          >
            Take me there
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters({
      posts: 'posts',
      loadingPosts: 'loadingPosts'
    })
  },
  mounted() {
    this.$store.dispatch('getNumPages').then((numPages) => {
      this.$store.dispatch('fetchPosts', numPages)
    })
  }
}
</script>
