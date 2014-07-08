require 'sinatra'
require 'json'
require_relative 'crawler'

get '/' do
  haml :index
end

post '/data.json' do
  content_type :json

  crawler = Crawler.new params[:url]
  crawler.crawl
  crawler.pages.to_json
end

