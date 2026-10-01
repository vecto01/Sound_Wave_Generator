from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.edge.options import Options as EdgeOptions
import time

def run_test(browser_name, options):
    driver = None
    try:
        if browser_name == "chrome":
            driver = webdriver.Chrome(options=options)
        elif browser_name == "firefox":
            driver = webdriver.Firefox(options=options)
        elif browser_name == "edge":
            driver = webdriver.Edge(options=options)
        
        driver.get("file:///D:/Vecto/projects/Sound_Wave_Generator/index.html")
        time.sleep(5)  # Ожидание загрузки страницы
        
        # Получение ошибок консоли
        errors = driver.get_log("browser")
        print(f"Browser: {browser_name}")
        for error in errors:
            print(f"Error: {error}")
    
    except Exception as e:
        print(f"Error in {browser_name}: {e}")
    finally:
        if driver:
            driver.quit()

def main():
    # Настройка Chrome
    chrome_options = ChromeOptions()
    chrome_options.add_argument("--headless")
    run_test("chrome", chrome_options)
    
    # Настройка Firefox
    firefox_options = FirefoxOptions()
    firefox_options.add_argument("--headless")
    run_test("firefox", firefox_options)
    
    # Настройка Edge
    edge_options = EdgeOptions()
    edge_options.add_argument("--headless")
    run_test("edge", edge_options)

if __name__ == "__main__":
    main()