// api/proxy.js
export default async function handler(req, res) {
    const { searchTerm, startIndex, endIndex } = req.query;
    const API_KEY = process.env.VITE_FRESHFOOD_API_KEY;
    
    try {
      let url = `http://openapi.seoul.go.kr:8088/${API_KEY}/json/foodAuctionItemPrice/${startIndex}/${endIndex}`;
      
      if (searchTerm) {
        url += `/${searchTerm}`;
      }
      
      console.log("Proxy requesting URL:", url.replace(API_KEY, "API_KEY_HIDDEN"));
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Proxy error:', error);
      res.status(500).json({ error: error.message });
    }
  }