require 'json'
require 'nokogiri'
require 'open-uri'
require 'open_uri_redirections'

class Crawler
  attr_reader :pages

  def initialize(url)
    analyze_url(url)
    @visited_links = []
    @pages = []
  end

  def crawl(path = "/")
    return if (path.empty? || @visited_links.include?(path) || @pages.length > 30)

    url = "#{@base_url}#{path}"
    puts "SCRAPER: #{url}"
    begin
      @visited_links << URI.parse(url).path
      page = open("#{@base_url}#{path}")

      if !page.base_uri.host.to_s.match(Regexp.quote(@base_host))
        @pages << {
          path: path,
          redirect: page.base_uri.host.to_s
        }

        return
      end

      page = Nokogiri::HTML(page)
    rescue
      return unless path == "/"

      @visited_links.pop
      parsed = URI.parse(url)
      parsed.scheme = parsed.scheme == 'http' ? 'https' : 'http'
      analyze_url(parsed.to_s)
      crawl(path) rescue puts "can't scrape #{url}"

      return
    end

    scripts = page.css('script[src]').map { |node| node['src'] }
    styles = page.css('link[rel=stylesheet]').map { |node| node['href'] }
    images = page.css('img').map { |node| node['src'] }

    links = extract_links(page)

    @pages << {
      path: path,
      scripts: scripts,
      styles: styles,
      images: images,
      links: links
    }

    if links.length
      links.each { |l| crawl(l) }
    end

    self
  end

  def analyze_url(url)
    parsed_url = URI.parse(url)

    if parsed_url.scheme.nil?
      parsed_url = URI.parse("http://#{url}")
    end

    @base_url = "#{parsed_url.scheme}://#{parsed_url.host}"
    @base_host = parsed_url.host
  end

  def extract_links(page)
    links = page.css('a').map { |node| node['href'] }
    valid_links = []


    links.each do |a|
      begin
        parsed = URI.parse(a)
        unless parsed.is_a?(URI::MailTo) ||
           (parsed.host && !parsed.host.match(Regexp.quote(@base_host))) ||
           parsed.path == ""

          valid_links << parsed.path
        end
      rescue
        next
      end
    end

    valid_links.uniq
  end
end

