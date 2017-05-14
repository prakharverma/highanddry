require "net/http"
require "uri"
require "json"
include Math

class WelcomeController < ApplicationController


  def index

  end

  def getBars
    lat = params['getBarForm']['lat']
    lng = params['getBarForm']['long']

    poi_json = get_poi_response_main(lat,lng,5000)
    poi_json = removeUnecessaryData(poi_json)

    @open_poi_list = IndiaHighway.open_poi(poi_json,500)

    respond_to do |format|
      format.js { render :js => "parseJson( " + @open_poi_list +");" }
    end


  end
  # Google API hit to get POI list

  private
  def get_poi_response(lat,lng,radius,next_page_token = "")

    if next_page_token == ""
      if Rails.env.development?
        uri = URI.parse('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + lat.to_s + ',' + lng.to_s + '&radius=' + radius.to_s + '&types=bar|night_club|liquor_store&key=' + Rails.application.secrets.googleAPIKey)
      else
        uri = URI.parse('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + lat.to_s + ',' + lng.to_s + '&radius=' + radius.to_s + '&types=bar|night_club|liquor_store&key=' + ENV['GoogleMap_API']) #Rails.application.secrets.googleAPIKey)
      end


    else
      sleep(2)
      if Rails.env.development?
        uri = URI.parse('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + lat.to_s + ',' + lng.to_s + '&radius=' + radius.to_s + '&types=bar|night_club|liquor_store&key=' + Rails.application.secrets.googleAPIKey + '&pagetoken=' + next_page_token)
      else
        uri = URI.parse('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + lat.to_s + ',' + lng.to_s + '&radius=' + radius.to_s + '&types=bar|night_club|liquor_store&key=' + ENV['GoogleMap_API'] + '&pagetoken=' + next_page_token)
      end
    end

    response = Net::HTTP.get_response(uri)
    data = JSON.parse(response.body)

    return data
  end

  def get_poi_response_main(lat,lng,radius)
      poi_json_response = []
      response = get_poi_response(lat,lng,radius)
      next_page_token = true

      poi_json_response.push(response['results'])

    while next_page_token do
      next_page_token = false

      if response.key?("next_page_token")
        next_page_token = true
      end

      if next_page_token == true
        response = get_poi_response(lat, lng, radius,response['next_page_token'])
        poi_json_response.push(response['results'])
      else
        next_page_token = false
      end

    end

    return poi_json_response
  end

  def removeUnecessaryData(poi_json)
    poiList = []

    poi_json.each do |item|
      item.each do |i|
        poi={}
        poi['lat'] = i['geometry']['location']['lat']
        poi['lng'] =  i['geometry']['location']['lng']
        poi['name'] = i['name'].to_s
        poi['vicinity'] =  i['vicinity'].to_s

        poi['name'].gsub!("'",',')
        poi['vicinity'].gsub!("'",',')

        poiList.push(poi)
      end
    end
      return poiList
  end

end