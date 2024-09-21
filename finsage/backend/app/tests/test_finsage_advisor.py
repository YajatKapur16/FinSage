import requests
import json

url = "https://3835-136-233-9-98.ngrok-free.app/query"
text = input()
payload = {"text": f"{text}"}
headers = {"Content-Type": "application/json"}

response = requests.post(url, data=json.dumps(payload), headers=headers)

print("Status Code:", response.status_code)
print("Response Content:", response.text)

try:
    print("JSON Response:", response.json())
except json.JSONDecodeError as e:
    print("Failed to decode JSON:", e)