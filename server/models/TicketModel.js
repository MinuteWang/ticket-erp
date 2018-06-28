const request = require('../utils/request')
const cheerio = require('cheerio')
const vm = require('vm')

async function GetCity () {
  const result = await request({
    url: '/qryCitys.htm',
    method: 'post'
  })
  const $ = cheerio.load(result.data)
  const cityDataEleList = $('#all_city_ul li')
  const cityData = []
  cityDataEleList.each(function () {
    const cityDataEle = $(this).find('a')
    const breviary = $(this).find('strong').text()
    cityDataEle.each(function () {
      const cityId = $(this).attr('href').match(/[1-9]\d*/g).join('')
      const cityName = $(this).text()
      cityData.push({
        city_id: Number(cityId),
        city_name: cityName,
        breviary: breviary
      })
    })
  })
  return cityData
}

async function GetHotFilms () {
  const city = await request({
    url: '/xhgCity.htm',
    method: 'post',
    params: { cityid: 310100 }
  })

  const result = await request({
    url: '/',
    method: 'get',
    headers: { cookie: city.headers['set-cookie'].join(';') }
  })
  const $ = cheerio.load(result.data)
  const filmListEle = $('head').find('script')
  const sandbox = {}
  vm.createContext(sandbox)
  vm.runInContext(filmListEle.html(), sandbox)
  return sandbox.hotFilms
}

async function GetCinemaByFilmsId (id) {
  const result = await request({
    url: '/qryCinemssByFilm.htm',
    method: 'post',
    data: { mid: id }
  })
  return result
}

async function GetTheatersByCinemaId (cinemaid, filmsid) {
  const result = await request({
    url: '/qryShows.htm',
    method: 'post',
    data: {
      mid: filmsid,
      cid: cinemaid
    }
  })
  return result
}

async function GetSeats (cinemaid, theatersid) {
  const result = await request({
    url: `/seat/${cinemaid}/${theatersid}`,
    method: 'get'
  })
  const $ = cheerio.load(result.data)
  const seats = $('.ch_seat')
  return seats
}

module.exports = {
  GetCity,
  GetSeats,
  GetHotFilms,
  GetCinemaByFilmsId,
  GetTheatersByCinemaId
}
