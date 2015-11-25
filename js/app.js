/**
 * Created by yangxingyue on 11/23/15.
 */
Parse.initialize("EVLf84mCrJpRVZ3Rua1HsfoisG6FfcwlPTTtgPwj", "j54SE2OSInw0Ak5NniCSGLqren2ZHlrqNZ3XsOVu");
$(function() {
    'use strict';

    var numReviews = 0.0;
    var totalScores = 0.0;
    var starsRate = $('#rating');
    var Review = new Parse.Object.extend('Review');
    var reviewsQuery = new Parse.Query(Review);
    reviewsQuery.ascending('createdAt');
    var rateLevel = [0, 0, 0, 0, 0];


    /* Make reference of error message and original track list */
    var reviewsList = $('#reviews-list');
    var errorMessage = $('#error-message');

    /*Create a new reference that stores the music reviews that users input */
    var reviews = [];


    /* Display of Error Message */
    function displayError(err) {
        errorMessage.text(err.message);
        errorMessage.fadeIn();
    }

    function clearError() {
        errorMessage.hide();
    }


    /* Display of Spinner */
    function showSpinner() {
        $('.fa-spin').show();
    }

    function hideSpinner() {
        $('.fa-spin').hide();
    }


    /* Get data from Parse and then Manage data*/
    function fetchReviews() {
        showSpinner();
        reviewsQuery.find()
            .then(onData, displayError)
            .always(hideSpinner());
    }

    function onData(result) {
        reviews = result;
        renderReviews();
    }

    function renderReviews() {
        reviewsList.empty();
        reviews.forEach(function(review) {
            /* Create an individual review box each time when a music review is added in
             It includes: title, numeric ratings and comments. */
            var box = $(document.createElement('li'))
                .addClass("review-box")
                .appendTo(reviewsList);


            // 1. Add star ratings and numeric rating
            numReviews++;
            var currentRate = review.get('rating');
            totalScores += currentRate;
            var rat = $(document.createElement('p'))
                .addClass("individual-rating")
                .raty({
                    readOnly: true,
                    score: (review.get('rating') || 0),
                    hints: ['worst', 'bad','ok','good','awesome']
                })
                .appendTo(box);
                if(currentRate === 1) {
                    rateLevel[4]++
                } else if (currentRate === 2) {
                    rateLevel[3]++;
                } else if (currentRate === 3) {
                    rateLevel[2]++;
                } else if (currentRate === 4) {
                    rateLevel[1]++;
                } else if(currentRate === 5){
                    rateLevel[0]++;
                }






            // 2. Delete the existing review
            var clear = $(document.createElement('span'))
                .addClass('fa fa-trash-o')
                .appendTo(box)
                .click(function() {
                    review.destroy({
                        success: function(review) {
                            fetchReviews();
                        },
                        error: function(review, error) {
                            displayError("Can't Delete this Review");
                        }
                    });
                    if(currentRate === 1) {
                        rateLevel[4]--;
                    } else if (currentRate === 2) {
                        rateLevel[3]--;
                    } else if (currentRate === 3) {
                        rateLevel[2]--;
                    } else if (currentRate === 4) {
                        rateLevel[1]--;
                    } else if(currentRate === 5){
                        rateLevel[0]--;
                    }
                });


            // 3. Add the helpful / unhelpful votes
            var thumbsUp = $(document.createElement('span'))
                .addClass('fa fa-thumbs-o-up')
                .appendTo(box)
                .click(function() {
                    review.increment('thumbsUp');
                    review.save().then(renderReviews, displayError)
                });

            var thumbsDown = $(document.createElement('span'))
                .addClass('fa fa-thumbs-o-down')
                .appendTo(box)
                .click(function() {
                    review.increment('thumbsDown');
                    review.save().then(renderReviews, displayError)
                });

            // 4. Add review title
            var title = $(document.createElement('span'))
                .addClass('individual-review')
                .text(review.get('title'))
                .appendTo(box);

            var totalHelps = review.get('thumbsUp') + review.get('thumbsDown');
            var helpfulness = $(document.createElement('p'))
                .addClass("helpfulness")
                .text(review.get('thumbsUp') + " out of " + totalHelps + " views people found are useful")
                .appendTo(box);

        });

        // 5. Show average rating of all the reviews
        var aveRate = Math.round(totalScores / numReviews);
        $('#average-rating')
            .addClass('average')
            .raty({
                readOnly: true,
                score:aveRate
            });

        // 6. Get the 2d context of the canvas element and create dynamic data reflections
        var canvas = document.getElementById('myChart');
        var ctx = canvas.getContext('2d');
        var data = {
            labels: ["Awesome", "Good", "Ok", "Bad", "Worse"],
            datasets: [
                {
                    label: "My First dataset",
                    fillColor: "rgba(220,220,220,0.5)",
                    strokeColor: "rgba(220,220,220,0.8)",
                    highlightFill: "rgba(220,220,220,0.75)",
                    highlightStroke: "rgba(220,220,220,1)",
                    data: [rateLevel[0], rateLevel[1], rateLevel[2], rateLevel[3], rateLevel[4]]
                }
            ]
        };
        var myBarChart = new Chart(ctx).Bar(data);

    }



    $('#new-music-review').submit(function(evt) {
        evt.preventDefault();

        var titleInput = $(this).find('[name="title"]');
        var bodyInput = $(this).find('[name = "body"]');
        var title = titleInput.val();
        var body = bodyInput.val();

        var review = new Review();
        review.set('title', title);
        review.set('body', body);
        review.set('rating', starsRate.raty('score') || 0);
        review.set('thumbsUp', 0);
        review.set('thumbsDown', 0);

        review.save()
            .then(fetchReviews, displayError)
            .then(function() {
                titleInput.val('');
                bodyInput.val('');
                starsRate.raty('set', {});
            });
        return false;
    });

    fetchReviews();
    starsRate.raty();

});

