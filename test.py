import requests

response = requests.get('https://restcountries.eu/rest/v2')


print(response.json())
