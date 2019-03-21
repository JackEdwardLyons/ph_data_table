<template>
  <section>
    <div v-if="loadingPosts" class="loading-wrapper">
      <h3 class="text-center">
        Loading data from {{ numPosts }} posts...
      </h3>

      <h3 v-if="errorMsg" class="text-center red--text" v-text="errorMsg" />
    </div>

    <section v-else row wrap>
      <v-card>
        <v-card-title>
          <h2>PaleoHacks Leadbox Audit</h2>
          <v-spacer />
          <v-text-field
            v-model="search"
            append-icon="search"
            label="Search"
            single-line
            hide-details
          />
        </v-card-title>
        <v-data-table
          :headers="headers"
          :items="posts"
          :search="search"
          :rows-per-page-items="[50, 100, 500, 1000, 2000, 5000]"
        >
          <template v-slot:items="props">
            <td class="min-width-250" v-text="props.item.postTitle" />
            <td class="text-xs-right">
              <a class="dont-break-out" target="_blank" :href="props.item.url" v-text="props.item.url" />
            </td>
            <td class="text-xs-right min-width-250" v-text="props.item.leadboxText" />
            <td class="text-xs-right">
              <a
                class="dont-break-out"
                target="_blank"
                :href="props.item.leadboxUrl"
                v-text="props.item.leadboxUrl"
              />
            </td>
            <td class="text-xs-right  min-width-250" v-text="props.item.leadboxType" />
            <td class="text-xs-right" v-text="props.item.postDate" />
          </template>
          <v-alert
            v-slot:no-results
            :value="true"
            color="error"
            icon="warning"
          >
            Your search for "{{ search }}" found no results.
          </v-alert>
        </v-data-table>
      </v-card>
    </section>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      search: '',
      headers: [
        {
          text: 'Post Title',
          align: 'left',
          value: 'postTitle'
        },
        { text: 'Post URL', value: 'url' },
        { text: 'Leadbox Text', value: 'leadboxText' },
        { text: 'Leadbox URL', value: 'leadboxUrl' },
        { text: 'Leadbox Type', value: 'leadboxType' },
        { text: 'Post Date', value: 'postDate' }
      ]
    }
  },
  computed: {
    ...mapGetters({
      posts: 'posts',
      loadingPosts: 'loadingPosts',
      numPosts: 'numPosts',
      errorMsg: 'errorMsg'
    })
  },
  mounted() {
    this.$store.dispatch('getNumPages').then((numPages) => {
      this.$store.dispatch('fetchPosts', numPages)
    })
  }
}
</script>

<style lang="scss" scoped>
td {
  min-width:  150px;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-center {
  text-align: center;
}

.min-width-250 {
  min-width: 250px;
}

.dont-break-out {
  /* These are technically the same, but use both */
  overflow-wrap: break-word;
  word-wrap: break-word;

  -ms-word-break: break-all;
  /* This is the dangerous one in WebKit, as it breaks things wherever */
  word-break: break-all;
  /* Instead use this non-standard one: */
  word-break: break-word;

  /* Adds a hyphen where the word breaks, if supported (No Blink) */
  -ms-hyphens: auto;
  -moz-hyphens: auto;
  -webkit-hyphens: auto;
  hyphens: auto;
}
</style>
