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
  loadingPosts: false,
  baseUrl: 'https://blog.paleohacks.com/wp-json/wp/v2/posts',
  perPage: '?per_page=10',
  wpFetchHeaders: {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Expose-Headers': 'x-wp-total',
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT"
    }
  }
})

export const getters = {
  loadingPosts: state => state.loadingPosts,
  posts: state => state.posts
}

export const mutations = {
  SET_POSTS(state, posts) {
    state.posts = posts
  },
  SET_LOADING_STATE(state, payload) {
    state.loadingPosts = payload
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

    return headers['x-wp-totalpages']
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

  // if (!postAstHTML.contains(leadboxHTML)) {
  //   leadboxHTML = postAstHTML.querySelector('p[style*="#ffffa0"]')
  //   console.log(leadboxHTML)
  // }

  // if (leadboxHTML === null) {
  //   leadboxHTML = postAstHTML.querySelector('p[style*="#ffffa0"]')
  //   console.log(postAstHTML)
  // }

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
    const data = leadboxScript
    const match = regex.exec(data)[0]
    // Positive lookbehind regex
    // ref: https://stackoverflow.com/questions/3569104/positive-look-behind-in-javascript-regular-expression
    const leadboxGenreRegex = /(?<=eventLabel:).*'/
    leadboxType = leadboxGenreRegex.exec(match)[0]
  }

  return {
    postTitle: post.title.rendered.replace(/&#8217;|&#8216;|&#8220;|&#8221;/g, "'"),
    url: post.link,
    leadboxText: leadboxText,
    leadboxUrl: leadboxUrl,
    leadboxType: leadboxType,
    postDate: getFormattedDate(post.date)
  }
}
