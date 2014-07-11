require 'sinatra'
require 'json'
require_relative 'site'

get '/' do
  haml :index
end

post '/data.json' do
  content_type :json

  Site.get(params[:url]).to_json
end

