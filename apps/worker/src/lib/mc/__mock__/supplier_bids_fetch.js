const fetch = require('node-fetch')
const querystring = require('querystring')

const url = 'https://sample-api.morningconsult.com/v1/supplier/bids'
const query = '?' + querystring.stringify({
  page_size: "20",
  state: "active",
  buyer_account_id: "484463f0-36cd-4990-80f5-31790db7f8b1",
  buyer_id: "302da898-b8a6-4959-92a0-b7ff8daaa106",
  country_id: "au",
  exclusion_group_id: "3c35d8fb-120e-43cb-a888-203fa3a08ba5",
  language_id: "en",
  minimum_cost_per_interview: "100",
  not_exclusion_group_id: "3c35d8fb-120e-43cb-a888-203fa3a08ba5",
  published_after: "2022-01-01T10:00:00Z",
  survey_type: "ad_hoc"
})
const response = await fetch(url + query, {
  method: 'GET',
  headers: {
    Authorization: 'Bearer <api_token>'
  }
})
const data = await response.json()