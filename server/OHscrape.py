from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import pandas as pd
import time

# Set up options for Selenium
options = Options()
options.headless = False  # Set to True after debugging is complete

# Remove ChromeDriver path and initialization
# driver_path = r"D:\projects\chromedriver.exe"  # Replace with the actual path to your chromedriver

print("Initializing WebDriver...")
# Initialize the WebDriver without specifying executable_path
driver = webdriver.Chrome(options=options)

# URL to scrape
url = "https://www.ohiogolf.com/golfcourses/results.cfm"  # Replace with the correct URL
print(f"Navigating to {url}...")
driver.get(url)

print("Waiting for the page to load...")
# Wait for the page to load
time.sleep(5)  # Static wait; replace with explicit waits for better performance

# Initialize an empty list for storing course data
golf_courses = []

print("Finding course elements...")
try:
    # Find elements with explicit wait
    courses = WebDriverWait(driver, 10).until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, "h4 a"))  # Adjust the selector if necessary
    )

    print(f"Found {len(courses)} courses.")
    for course in courses:
        try:
            # Extract course name and URL
            course_name = course.text
            course_url = course.get_attribute("href")
            print(f"Course found: {course_name} - {course_url}")

            # Navigate to course page for address and city details
            driver.get(course_url)
            time.sleep(2)  # Adjust this wait if needed

            # Extract address and city
            try:
                address_element = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, ".address"))  # Adjust selector
                )
                address = address_element.text.split(",")[0].strip()  # Extract street address
            except Exception as e:
                print(f"Address not found for {course_name}: {e}")
                address = "N/A"

            try:
                city_element = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, ".city"))  # Adjust selector
                )
                city = city_element.text.split(",")[0].strip()  # Extract city
            except Exception as e:
                print(f"City not found for {course_name}: {e}")
                city = "N/A"

            # Add details to list
            golf_courses.append({
                "Course Name": course_name,
                "URL": course_url,
                "Address": address,
                "City": city
            })

            # Navigate back to main page
            driver.back()
            time.sleep(2)

        except Exception as e:
            print(f"Error parsing course: {e}")

except Exception as e:
    print(f"Error locating elements: {e}")

finally:
    print("Closing the browser...")
    # Close the browser
    driver.quit()

# Save the data to a CSV file
output_path = r"D:\projects\golf\golf-course-recommendation-engine\ohio_golf_courses.csv"
df = pd.DataFrame(golf_courses)

if not df.empty:
    df.to_csv(output_path, index=False)
    print(f"Data saved to {output_path}")
else:
    print("No data found. File not saved.")
