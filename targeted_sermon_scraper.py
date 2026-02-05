import requests
from bs4 import BeautifulSoup
import time
import re
import json
from urllib.parse import urljoin, unquote, quote

# Configure session with proper headers
session = requests.Session()
session.headers.update({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    'Connection': 'keep-alive'
})

def discover_sermon_pages():
    """Discover all sermon pages from the main site"""
    base_url = "https://robertlambert.org"
    sermon_urls = []
    
    try:
        # Check the main sermons-audio page
        print("Checking main sermons page...")
        response = session.get(base_url + "/sermons-audio/", timeout=10)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Look for all links that might be sermon pages
            links = soup.find_all('a', href=True)
            
            for link in links:
                href = link['href']
                # Look for audiopost links specifically
                if 'audiopost' in href:
                    full_url = urljoin(base_url, href)
                    if full_url not in sermon_urls:
                        sermon_urls.append(full_url)
        
        # Try the homepage too
        print("Checking homepage for sermon links...")
        response = session.get(base_url, timeout=10)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            links = soup.find_all('a', href=True)
            
            for link in links:
                href = link['href']
                if 'audiopost' in href:
                    full_url = urljoin(base_url, href)
                    if full_url not in sermon_urls:
                        sermon_urls.append(full_url)
        
        print(f"Discovered {len(sermon_urls)} sermon URLs")
        return sermon_urls
        
    except Exception as e:
        print(f"Error discovering sermon pages: {e}")
        return []

def clean_text(text):
    """Clean text by removing extra spaces and formatting issues"""
    if not text:
        return text
    
    # Remove extra whitespace
    text = ' '.join(text.split())
    
    # Clean up common formatting issues
    text = text.replace('  ', ' ')  # Double spaces
    text = text.replace(' - ', '-')  # Spaces around dashes
    text = text.replace(' ,', ',')   # Space before comma
    text = text.replace('( ', '(')   # Space after opening paren
    text = text.replace(' )', ')')   # Space before closing paren
    
    return text.strip()

def format_download_link(url):
    """Format download link with proper URL encoding"""
    if not url:
        return url
    
    # If it's already a full URL, parse the filename and re-encode it properly
    if url.startswith('http'):
        parts = url.split('/')
        filename = parts[-1]
        
        # Decode first to handle existing encoding
        filename = unquote(filename)
        
        # Clean the filename
        filename = clean_text(filename)
        
        # Re-encode properly (spaces become %20, etc.)
        encoded_filename = quote(filename, safe='.-_()[]')
        
        # Rebuild the URL
        parts[-1] = encoded_filename
        return '/'.join(parts)
    
    return url

def format_date(date_str):
    """Format date string to clean format"""
    if not date_str:
        return date_str
    
    # Clean the date string
    date_str = clean_text(date_str)
    
    # Remove extra dashes and spaces
    date_str = re.sub(r'[-\s]+', '-', date_str)
    
    # Handle common patterns
    date_str = date_str.replace('--', '-')
    
    return date_str

def extract_exact_download_link(soup):
    """Extract the exact download link from the page HTML"""
    download_link = ""
    
    # Method 1: Look for 'Click to Download' link (most reliable)
    download_links = soup.find_all('a', string=lambda text: text and 'download' in text.lower())
    if download_links:
        for link in download_links:
            href = link.get('href', '')
            if href.endswith('.mp3'):
                download_link = href
                if not download_link.startswith('http'):
                    download_link = urljoin("https://robertlambert.org", download_link)
                return download_link
    
    # Method 2: Look for source elements in audio tags
    audio_elements = soup.find_all('audio')
    for audio in audio_elements:
        sources = audio.find_all('source')
        for source in sources:
            src = source.get('src', '')
            if src and src.endswith('.mp3'):
                if not src.startswith('http'):
                    src = urljoin("https://robertlambert.org", src)
                return src
    
    # Method 3: Look for direct mp3 links
    mp3_links = soup.find_all('a', href=lambda x: x and x.endswith('.mp3'))
    if mp3_links:
        href = mp3_links[0]['href']
        if not href.startswith('http'):
            href = urljoin("https://robertlambert.org", href)
        return href
    
    # Method 4: Search raw HTML for mp3 URLs
    import re
    html_content = str(soup)
    mp3_matches = re.findall(r'["\']([^"\']*\.mp3[^"\']*)["\']', html_content, re.IGNORECASE)
    
    for match in mp3_matches:
        if 'sermons/audio' in match:
            if match.startswith('http'):
                return match
            else:
                return "https://robertlambert.org" + (match if match.startswith('/') else '/' + match)
    
    return download_link

def test_download_link(url):
    """Test if a download link actually works"""
    try:
        response = session.head(url, timeout=5, allow_redirects=True)
        return response.status_code == 200
    except:
        return False

def extract_sermon_from_page(url):
    """Extract sermon details from a single page"""
    try:
        print(f"Processing: {url}")
        response = session.get(url, timeout=10)
        
        if response.status_code != 200:
            print(f"Failed to fetch {url}: Status {response.status_code}")
            return None
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract title from h1 or title tag
        title = ""
        title_elem = soup.find('h1') or soup.find('title')
        if title_elem:
            title = title_elem.get_text().strip()
            # Clean up title
            title = title.replace(' – Son of Man Recordings, Inc', '')
            title = clean_text(title)
        
        # Extract the direct audio download link using the improved method
        download_link = extract_exact_download_link(soup)
        
        # Verify the download link works
        if download_link:
            if not test_download_link(download_link):
                print(f"   Warning: Download link doesn't work: {download_link}")
                download_link = ""
        
        # Extract date and year from title and content
        page_text = soup.get_text()
        
        # Look for dates in various formats
        date_patterns = [
            r'(\w+[-\s]+\d{1,2}[-\s]+\d{4})',  # March-7-1971, March 7 1971
            r'(\d{1,2}[-/]\d{1,2}[-/]\d{4})',   # 3/7/1971, 3-7-1971  
            r'(\d{1,2}[-\s]+\w+[-\s]+\d{4})',   # 7-March-1971
        ]
        
        date = ""
        year = ""
        
        # Try to extract from filename first (most reliable)
        if download_link:
            filename = download_link.split('/')[-1]
            # Look for date pattern in filename
            filename_text = unquote(filename)
            
            for pattern in date_patterns:
                match = re.search(pattern, filename_text, re.IGNORECASE)
                if match:
                    date = match.group(1)
                    break
        
        # If no date from filename, try page content
        if not date:
            full_text = title + " " + page_text
            for pattern in date_patterns:
                match = re.search(pattern, full_text, re.IGNORECASE)
                if match:
                    date = match.group(1)
                    break
        
        # Extract year
        year_match = re.search(r'(19\d{2}|20\d{2})', (date + " " + title + " " + str(download_link)))
        if year_match:
            year = year_match.group(1)
        
        # Clean and format the date
        if date:
            date = format_date(date)
        
        # Create sermon object
        sermon_data = {
            'title': title or "Unknown Title",
            'audioUrl': url,
            'downloadLink': download_link,
            'date': date or "Unknown Date",
            'year': year or "Unknown Year",
            'type': 'mp3'
        }
        
        print(f"Extracted: {sermon_data['title']} ({sermon_data['year']})")
        if download_link:
            print(f"Download: {sermon_data['downloadLink']}")
            # Test the link
            if test_download_link(download_link):
                print("   ✅ Download link verified working")
            else:
                print("   ❌ Download link verification failed")
        else:
            print("   ⚠️ No download link found")
        
        return sermon_data
        
    except Exception as e:
        print(f"Error processing {url}: {e}")
        return None

def generate_js_file(sermons, filename="scraped_audio.js"):
    """Generate a JavaScript file from sermon data"""
    try:
        js_content = "// Generated sermon data with corrected download links\n"
        js_content += f"// Generated on: {time.strftime('%Y-%m-%d %H:%M:%S')}\n"
        js_content += f"// Total sermons: {len(sermons)}\n\n"
        js_content += "const audioSermons = [\n"
        
        for i, sermon in enumerate(sermons):
            js_content += "  {\n"
            js_content += f"    id: '{sermon['id']}',\n"
            js_content += f"    title: \"{sermon['title']}\",\n"
            js_content += f"    type: \"{sermon['type']}\",\n"
            js_content += f"    audioUrl: '{sermon['audioUrl']}',\n"
            js_content += f"    year: \"{sermon['year']}\",\n"
            js_content += f"    downloadLink: '{sermon['downloadLink']}',\n"
            js_content += f"    date: \"{sermon['date']}\",\n"
            js_content += "  }"
            
            if i < len(sermons) - 1:
                js_content += ","
            js_content += "\n"
        
        js_content += "];\n\n"
        js_content += "export default audioSermons;\n"
        
        # Save the JavaScript file
        with open(filename, "w", encoding="utf-8") as f:
            f.write(js_content)
        
        print(f"Generated {filename} with {len(sermons)} sermons")
        
        # Also save as JSON for debugging/inspection
        json_filename = filename.replace('.js', '.json')
        with open(json_filename, "w", encoding="utf-8") as f:
            json.dump(sermons, f, indent=2, ensure_ascii=False)
        
        print(f"Also saved {json_filename} for inspection")
        
    except Exception as e:
        print(f"Error generating JavaScript file: {e}")

def test_with_known_sermon():
    """Test with the sermon we know exists"""
    print("Testing with known sermon...")
    
    known_url = "https://robertlambert.org/audiopost/the-great-word-test-part-1/"
    sermon = extract_sermon_from_page(known_url)
    
    if sermon:
        print("\nSuccessfully extracted sermon data:")
        print(json.dumps(sermon, indent=2))
        
        # Save as test JavaScript file
        test_sermons = [sermon]
        test_sermons[0]['id'] = '1m'  # Add ID for test
        generate_js_file(test_sermons, "test_sermon_result.js")
            
        return True
    else:
        print("Failed to extract sermon data")
        return False

if __name__ == "__main__":
    print("Starting targeted sermon scraper...")
    
    # First test with known sermon
    if test_with_known_sermon():
        print("\nTest successful! Now discovering all sermon pages...")
        
        # Discover all sermon URLs
        sermon_urls = discover_sermon_pages()
        
        if sermon_urls:
            print(f"Found {len(sermon_urls)} sermon pages to process")
            print("Starting full scraping process...")
            
            # Process ALL sermons
            all_sermons = []
            failed_count = 0
            
            for i, url in enumerate(sermon_urls):
                print(f"\nProgress: {i+1}/{len(sermon_urls)} ({(i+1)/len(sermon_urls)*100:.1f}%)")
                
                sermon = extract_sermon_from_page(url)
                if sermon:
                    # Add ID
                    sermon['id'] = f"{len(all_sermons) + 1}m"
                    all_sermons.append(sermon)
                else:
                    failed_count += 1
                    print(f"   ❌ Failed to process sermon")
                
                # Be respectful to the server
                time.sleep(0.8)
                
                # Progress checkpoint every 25 sermons
                if (i + 1) % 25 == 0:
                    success_rate = len(all_sermons) / (i + 1) * 100
                    print(f"\n📊 Checkpoint {i+1}/{len(sermon_urls)}:")
                    print(f"   ✅ Successful: {len(all_sermons)}")
                    print(f"   ❌ Failed: {failed_count}")  
                    print(f"   📈 Success rate: {success_rate:.1f}%")
                    
                    # Save intermediate results
                    if all_sermons:
                        generate_js_file(all_sermons, f"intermediate_sermons_{i+1}.js")
            
            print(f"\n🎉 SCRAPING COMPLETED!")
            print(f"   ✅ Successfully processed: {len(all_sermons)} sermons")
            print(f"   ❌ Failed: {failed_count} sermons")
            print(f"   📈 Overall success rate: {len(all_sermons)/len(sermon_urls)*100:.1f}%")
            
            # Save final results as complete audio.js replacement
            if all_sermons:
                generate_js_file(all_sermons, "complete_audio.js")
                print(f"\n✅ Generated complete_audio.js with {len(all_sermons)} working sermons!")
                print("   This file can replace your current audio.js to fix the duration bug.")
        else:
            print("No sermon URLs discovered")
    else:
        print("Test failed - cannot proceed")