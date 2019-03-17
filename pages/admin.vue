<template>
  <section>
    <div v-if="loadingPosts" class="loading-wrapper">
      <h3 class="text-center">
        Loading...
      </h3>
    </div>

    <section v-else row wrap>
      <v-card>
        <v-card-title>
          PaleoHacks Leadbox Audit
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
          :rows-per-page-items="[100, 200, 500, 1000, 2000, 5000]"
        >
          <template v-slot:items="props">
            <td>{{ props.item.postTitle }}</td>
            <td class="text-xs-right">
              <a target="_blank" :href="props.item.url">
                {{
                  props.item.url
                }}
              </a>
            </td>
            <td class="text-xs-right">
              {{ props.item.leadboxText }}
            </td>
            <td class="text-xs-right">
              <a target="_blank" :href="props.item.leadboxUrl">{{ props.item.leadboxUrl }}</a>
            </td>
            <td class="text-xs-right">
              {{ props.item.leadboxType }}
            </td>
            <td class="text-xs-right">
              {{ props.item.postDate }}
            </td>
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

<style lang="scss">
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-center {
  text-align: center;
}
</style>
