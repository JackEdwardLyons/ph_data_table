
import {
  getFormattedDate
} from './format-date'

import {
  getNextSibling
} from './dom-queries'

/**
 * @description Strip out the specific data from a blog post
 * @param { Object } post
 * @returns { Object }
 */
export function getLeadboxData(post) {
  const parser = new DOMParser()
  const postAstHTML = parser.parseFromString(post.content.rendered, 'text/html')
  const hardCodedLeadBoxHTML = postAstHTML.querySelector('[style*="background: #ffffa0; border: 1px solid #e5e597;"]')

  let leadboxHTML = postAstHTML.querySelector('.postLeadbox')
  let leadboxType = ''
  let leadboxText = ''
  let leadboxUrl = ''
  let leadboxScript = ''

  if (hardCodedLeadBoxHTML) {
    leadboxText = '[ HARDCODED ] ' + hardCodedLeadBoxHTML.textContent
    leadboxScript = hardCodedLeadBoxHTML.querySelector('script')
    leadboxType = 'Custom'
    leadboxUrl = hardCodedLeadBoxHTML.querySelector('a')
    if (leadboxUrl === null || !leadboxUrl) {
      leadboxUrl = ''
    } else {
      leadboxUrl = leadboxUrl.href
    }
  } else if (leadboxHTML) {
    leadboxText = leadboxHTML.textContent
    leadboxUrl = leadboxHTML.querySelector('a').href
    leadboxScript = getNextSibling(leadboxHTML, 'script').innerText

    const regex = /{(.*?)}/
    const match = regex.exec(leadboxScript)[0]
    // Positive lookbehind regex (Chrome only)
    // ref: https://stackoverflow.com/questions/3569104/positive-look-behind-in-javascript-regular-expression
    const leadboxGenreRegex = /(?<=eventLabel:).*'/
    leadboxType = leadboxGenreRegex.exec(match)[0].replace(/'|"/g, '')
  } else {
    leadboxHTML = ''
    leadboxType = '** No Leadbox type specified **'
    leadboxText = 'No Leadbox specified in post'
    leadboxUrl = ''
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
