import pytest
from nlp import analyze_sentiment

def test_positive_sentiment():
    assert analyze_sentiment("I am so happy today!") > 0.5

def test_negative_sentiment():
    assert analyze_sentiment("I am so sad today.") < 0

def test_neutral_sentiment():
    score = analyze_sentiment("This is a test.")
    assert -0.5 < score < 0.5
