import axios from 'axios'
import {
  getLeadboxData
} from '../utils/fetch-posts'

export const state = () => ({
  posts: [],
  numPages: 0,
  numPosts: 2960,
  loadingPosts: false,
  errorMsg: null,
  baseUrl: '/api',
  perPage: '?per_page=10',
  wpFetchHeaders: {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Expose-Headers': 'x-wp-total'
    }
  }
})

export const getters = {
  loadingPosts: state => state.loadingPosts,
  posts: state => state.posts,
  numPosts: state => state.numPosts,
  errorMsg: state => state.errorMsg
}

export const mutations = {
  SET_POSTS(state, posts) {
    state.posts = posts
  },
  SET_LOADING_STATE(state, payload) {
    state.loadingPosts = payload
  },
  SET_NUM_POSTS(state, payload) {
    state.numPosts = payload
  },
  SET_ERROR(state, payload) {
    state.errorMsg = payload
  }
}

export const actions = {
  async getNumPages({
    commit,
    state
  }) {
    commit('SET_LOADING_STATE', true)
    const wpFetchHeaders = state.wpFetchHeaders
    const baseUrl = state.baseUrl
    const { headers } = await this.$axios.get(`${baseUrl}${state.perPage}&page=1`, wpFetchHeaders)
    const numPages = headers['x-wp-totalpages']
    commit('SET_NUM_POSTS', numPages * 10)
    return numPages
  },

  async fetchPosts({
    commit,
    state
  },
  numPages) {
    const wpFetchHeaders = state.wpFetchHeaders
    const baseUrl = state.baseUrl
    const posts = []

    for (let page = 1; page <= numPages; page += 1) {
      const post = axios.get(`${baseUrl}${state.perPage}&page=${page}`, wpFetchHeaders)
      posts.push(post)
    }

    await axios.all(posts)
      .then((response) => {
        const postData = response.map(res => res.data).flat()
        return postData.map(getLeadboxData)
      })
      .then((data) => {
        commit('SET_POSTS', data)
        commit('SET_LOADING_STATE', false)
        return true
      })
      .catch(e => commit('SET_ERROR', e))

    return false
  }
}
