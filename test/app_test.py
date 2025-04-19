import unittest
from unittest.mock import patch
from ..app import display_data
import io

class TestAppDisplayData(unittest.TestCase):

    @patch("app.render_template")
    @patch("builtins.open")
    def test_display_data_sorts_by_confidence(self, mock_open, mock_render_template):

        mock_open.return_value = io.StringIO(
            "id,airline_sentiment,airline_sentiment_confidence,negative_reason,airline,name,text,tweet_created,tweet_location\n"
            "1,positive,0.90,,,Delta,Alice,Great flight,2021-01-01,NY\n"
            "2,negative,0.60,,,United,Bob,Bad service,2021-01-02,CA\n"
            "3,neutral,0.75,,,American,Charlie,Okay flight,2021-01-03,TX\n"
        )


        display_data()


        args, kwargs = mock_render_template.call_args
        tweet_data = kwargs['tweetData']

        confidences = [float(tweet['airline_sentiment_confidence']) for tweet in tweet_data]
        self.assertEqual(confidences, sorted(confidences))

    @patch("app.render_template")
    @patch("builtins.open")
    def test_display_data_returns_40_or_fewer_rows(self, mock_open, mock_render_template):

        csv_content = "id,airline_sentiment,airline_sentiment_confidence,negative_reason,airline,name,text,tweet_created,tweet_location\n"
        for i in range(50):
            csv_content += f"{i},positive,0.{i % 10},,,Airline,Name,Text,{i},Loc\n"

        mock_open.return_value = io.StringIO(csv_content)

        display_data()

        args, kwargs = mock_render_template.call_args
        tweet_data = kwargs['tweetData']

        self.assertLessEqual(len(tweet_data), 40)

if __name__ == '__main__':
    unittest.main(verbosity=2)
