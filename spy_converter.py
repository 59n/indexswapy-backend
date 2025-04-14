import requests
import logging
from datetime import datetime
import json
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class SpyConverter:
    def __init__(self):
        self.ratios = {
            'ndx_qqq': 41.10241216829076,
            'nq_qqq': 41.29471200210854,
            'es_spy': 10.072138887159946
        }
        self.last_updated = None
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'Referer': 'http://spyconverter.com/',
            'Origin': 'http://spyconverter.com'
        }
        self.base_url = 'https://utility-trees-399601.wl.r.appspot.com'
        logger.info("SpyConverter initialized with default ratios")

    async def update_ratios(self, max_retries=3):
        endpoints = [
            '/',
            '/api/ratios',
            '/ratios',
            '/data'
        ]
        
        for endpoint in endpoints:
            for attempt in range(max_retries):
                try:
                    url = f"{self.base_url}{endpoint}"
                    logger.info(f"Attempting to update ratios from API: {url} (attempt {attempt + 1}/{max_retries})")
                    
                    response = requests.get(
                        url,
                        headers=self.headers,
                        timeout=10
                    )
                    logger.info(f"API Response status: {response.status_code}")
                    logger.info(f"API Response content: {response.text}")
                    
                    if response.status_code == 503:
                        logger.warning("Service temporarily unavailable, retrying...")
                        time.sleep(2 ** attempt)  # Exponential backoff
                        continue
                    
                    if response.status_code != 200:
                        logger.warning(f"Endpoint {endpoint} returned status {response.status_code}, trying next endpoint...")
                        break
                    
                    data = response.json()
                    logger.info(f"Parsed API data: {json.dumps(data, indent=2)}")
                    
                    self.ratios = {
                        'ndx_qqq': data["NDX/QQQ Ratio"],
                        'nq_qqq': data["NQ/QQQ Ratio"],
                        'es_spy': data["ES/SPY Ratio"]
                    }
                    
                    self.last_updated = datetime.now()
                    logger.info(f"Ratios updated successfully: {self.ratios}")
                    return True
                    
                except requests.exceptions.RequestException as error:
                    logger.error(f"Network error on attempt {attempt + 1}: {str(error)}")
                    if attempt < max_retries - 1:
                        time.sleep(2 ** attempt)  # Exponential backoff
                        continue
                    logger.error("All retry attempts failed for this endpoint")
                    break
                except Exception as error:
                    logger.error(f"Error updating ratios: {str(error)}")
                    break
        
        logger.warning("All endpoints failed, using default ratios")
        return False

    async def convert_qqq_to_ndx(self, qqq_value):
        logger.info(f"Converting QQQ to NDX for value: {qqq_value}")
        try:
            num_value = float(qqq_value)
            if num_value < 0:
                raise ValueError("Value cannot be negative")
            
            if not self.last_updated or (datetime.now() - self.last_updated).total_seconds() > 60:
                await self.update_ratios()
            
            result = round(num_value * self.ratios['ndx_qqq'], 2)
            logger.info(f"Conversion result: {result}")
            return result
        except ValueError as e:
            logger.error(f"Invalid input: {str(e)}")
            raise

    async def convert_qqq_to_nq(self, qqq_value):
        logger.info(f"Converting QQQ to NQ for value: {qqq_value}")
        try:
            num_value = float(qqq_value)
            if num_value < 0:
                raise ValueError("Value cannot be negative")
            
            if not self.last_updated or (datetime.now() - self.last_updated).total_seconds() > 60:
                await self.update_ratios()
            
            result = round(num_value * self.ratios['nq_qqq'], 2)
            logger.info(f"Conversion result: {result}")
            return result
        except ValueError as e:
            logger.error(f"Invalid input: {str(e)}")
            raise

    async def convert_nq_to_qqq(self, nq_value):
        logger.info(f"Converting NQ to QQQ for value: {nq_value}")
        try:
            num_value = float(nq_value)
            if num_value < 0:
                raise ValueError("Value cannot be negative")
            
            if not self.last_updated or (datetime.now() - self.last_updated).total_seconds() > 60:
                await self.update_ratios()
            
            result = round(num_value / self.ratios['nq_qqq'], 2)
            logger.info(f"Conversion result: {result}")
            return result
        except ValueError as e:
            logger.error(f"Invalid input: {str(e)}")
            raise

    async def convert_ndx_to_qqq(self, ndx_value):
        logger.info(f"Converting NDX to QQQ for value: {ndx_value}")
        try:
            num_value = float(ndx_value)
            if num_value < 0:
                raise ValueError("Value cannot be negative")
            
            if not self.last_updated or (datetime.now() - self.last_updated).total_seconds() > 60:
                await self.update_ratios()
            
            result = round(num_value / self.ratios['ndx_qqq'], 2)
            logger.info(f"Conversion result: {result}")
            return result
        except ValueError as e:
            logger.error(f"Invalid input: {str(e)}")
            raise

    async def convert_es_to_spy(self, es_value):
        logger.info(f"Converting ES to SPY for value: {es_value}")
        try:
            num_value = float(es_value)
            if num_value < 0:
                raise ValueError("Value cannot be negative")
            
            if not self.last_updated or (datetime.now() - self.last_updated).total_seconds() > 60:
                await self.update_ratios()
            
            result = round(num_value / self.ratios['es_spy'], 2)
            logger.info(f"Conversion result: {result}")
            return result
        except ValueError as e:
            logger.error(f"Invalid input: {str(e)}")
            raise

    async def convert_spy_to_es(self, spy_value):
        logger.info(f"Converting SPY to ES for value: {spy_value}")
        try:
            num_value = float(spy_value)
            if num_value < 0:
                raise ValueError("Value cannot be negative")
            
            if not self.last_updated or (datetime.now() - self.last_updated).total_seconds() > 60:
                await self.update_ratios()
            
            result = round(num_value * self.ratios['es_spy'], 2)
            logger.info(f"Conversion result: {result}")
            return result
        except ValueError as e:
            logger.error(f"Invalid input: {str(e)}")
            raise

# Example usage
if __name__ == "__main__":
    import asyncio
    
    async def main():
        converter = SpyConverter()
        
        # Example conversions
        try:
            # Convert QQQ to NDX
            result = await converter.convert_qqq_to_ndx(100)
            print(f"100 QQQ = {result} NDX")
            
            # Convert SPY to ES
            result = await converter.convert_spy_to_es(100)
            print(f"100 SPY = {result} ES")
            
        except Exception as e:
            print(f"Error: {str(e)}")
    
    asyncio.run(main()) 