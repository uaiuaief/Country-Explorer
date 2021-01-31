import requests as req
import os
from flask import Flask, request, render_template, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    #return 'hello'
    return render_template('index.html')


@app.route('/api/countries')
def countries_data():
    res = req.get('https://restcountries.eu/rest/v2')
    data = res.json()
    return jsonify(data)


@app.route('/api/images')
def country_images():
    sk = os.environ.get('GOOGLE_API_KEY') 
    cx = os.environ.get('GOOGLE_CX') 

    query = request.args.get('query').replace(' ', '+')
    start = request.args.get('start')
    print(query, start)
    URL = f'https://www.googleapis.com/customsearch/v1?key={sk}&cx={cx}&q={query}&start={start}&searchType=image'
    res = req.get(URL)
    data = res.json()

    return jsonify(data)


@app.after_request
def add_cors_headers(response):
    white = [
            'http://localhost:5500',
            'localhost:5500',
            '127.0.0.1:5500',
            'http://127.0.0.1:5500',
            ]

    if not request.referrer:
        return response

    r = request.referrer[:-1]
    if r in white:
        response.headers.add('Access-Control-Allow-Origin', r)
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Headers', 'Cache-Control')
        response.headers.add('Access-Control-Allow-Headers', 'X-Requested-With')
        response.headers.add('Access-Control-Allow-Headers', 'Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
    return response


if __name__ == '__main__':
    app.run(debug=True)
