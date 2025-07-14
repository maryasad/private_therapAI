from flask import Flask, request, jsonify, make_response
from textblob import TextBlob
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "Welcome to the Sentiment Analysis API. Use POST /sentiment to analyze text."

@app.route('/sentiment', methods=['POST', 'GET'])
def sentiment():
    if request.method == 'GET':
        return make_response(
            jsonify({"error": "Please use POST method with a JSON body containing 'text' field"}), 
            405
        )
    
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return make_response(
                jsonify({"error": "Please provide a 'text' field in the JSON body"}), 
                400
            )
            
        text = data['text']
        blob = TextBlob(text)
        return jsonify({
            'text': text,
            'polarity': blob.sentiment.polarity,
            'subjectivity': blob.sentiment.subjectivity
        })
        
    except Exception as e:
        return make_response(
            jsonify({"error": str(e)}), 
            500
        )

if __name__ == '__main__':
    print("Starting server on http://127.0.0.1:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)
