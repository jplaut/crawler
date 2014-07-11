require 'mongo'
require_relative 'crawler'

include Mongo

class Site
  @db = MongoClient.new.db('grouper').collection('sites')

  def self.get(url)
    site = @db.find(url: url).to_a[0]

    if site
      site["pages"]
    else
      crawler = Crawler.new(url)
      crawler.crawl
      @db.insert(url: url, pages: crawler.pages)

      crawler.pages
    end
  end
end
