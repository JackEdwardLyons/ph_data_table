import axios from 'axios'

import {
  getFormattedDate
} from '../utils/format-date'

import {
  getNextSibling
} from '../utils/dom-queries'

export const state = () => ({
  posts: [],
  numPages: 0,
  numPosts: 2960,
  loadingPosts: false,
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
  numPosts: state => state.numPosts
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
  }
}

export const actions = {
  async getNumPages({
    commit,
    state
  }) {
    // X-WP-TotalPages
    // numPosts = request.getResponseHeader('x-wp-total');
    commit('SET_LOADING_STATE', true)
    const URL = state.baseUrl
    const config = state.wpFetchHeaders

    const {
      headers
    } = await this.$axios.get(`${URL}${state.perPage}&page=1`, config)

    const numPages = headers['x-wp-totalpages']
    commit('SET_NUM_POSTS', numPages * 10)

    return numPages
  },

  async fetchPosts({
    commit,
    state
  },
  numPages) {
    const URL = state.baseUrl
    const posts = []
    const config = state.wpFetchHeaders

    for (let page = 1; page <= numPages; page += 1) {
      const post = axios.get(`${URL}${state.perPage}&page=${page}`, config)
      posts.push(post)
    }

    await axios.all(posts)
      .then((response) => {
        const postData = response.map(res => res.data)
        return postData.flat().map(getSpecificPostData)
      })
      .then((data) => {
        commit('SET_POSTS', data)
        commit('SET_LOADING_STATE', false)
      })

    return true
  }
}

function getSpecificPostData(post) {
  const parser = new DOMParser()
  const postAstHTML = parser.parseFromString(post.content.rendered, 'text/html')
  let leadboxHTML = postAstHTML.querySelector('.postLeadbox')
  let leadboxType = ''
  let leadboxText = ''
  let leadboxUrl = ''

  if (leadboxHTML === null) {
    leadboxHTML = ''
    leadboxType = 'No leadbox type'
    leadboxText = 'No Leadbox specified in post'
    leadboxUrl = ''
  } else {
    leadboxText = leadboxHTML.textContent
    leadboxUrl = leadboxHTML.querySelector('a').href

    const leadboxScript = getNextSibling(leadboxHTML, 'script').innerText
    const regex = /{(.*?)}/
    const match = regex.exec(leadboxScript)[0]
    // Positive lookbehind regex (Chrome only)
    // ref: https://stackoverflow.com/questions/3569104/positive-look-behind-in-javascript-regular-expression
    const leadboxGenreRegex = /(?<=eventLabel:).*'/
    leadboxType = leadboxGenreRegex.exec(match)[0]
  }

  return {
    postTitle: post.title.rendered.replace(/&#[0-9]{4};/g, "'").replace(/&#[0-9]{3};/g, '&'),
    url: post.link,
    leadboxText: leadboxText,
    leadboxUrl: leadboxUrl,
    leadboxType: leadboxType,
    postDate: getFormattedDate(post.date)
  }
}
