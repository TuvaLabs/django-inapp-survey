(function($) {
    'use strict';

    // Don't do anything if jQuery is not defined
    if(!$) {
        return;
    }

    // For makrdown conversion
    var _markdownConverter = new showdown.Converter({extensions: ['inapp-survey-extended']});
    function convertMarkdownToHtml(markdownText) {
        return _markdownConverter.makeHtml(markdownText);
    }

    // Service for localStorage
    function LocalStorageService() {
        this.storageKey = "surveyIds";
        this.timeoutMSKey = "surveyTimeoutMS";
        this.getSurveyIds = function() {
            try {
                var surveyIds = localStorage.getItem(this.storageKey);
                return surveyIds? surveyIds.split(','): [];
            } catch(e) {
                // Mute the exception when there are no localStorage feature available
                return [];
            }
        };
        this.addSurveyId = function(surveyId) {
            try {
                var surveyIds = this.getSurveyIds();
                surveyIds.push(surveyId);
                localStorage.setItem(this.storageKey, surveyIds.join(','));
            } catch(e) {
                // Mute the exception when there are no localStorage feature available
            }
        };
        this.getSurveyTimeoutMS = function() {
            try {
                var timeoutTime = localStorage.getItem(this.timeoutMSKey);
                if(timeoutTime === null) {
                    return 0;
                } else {
                    return parseInt(localStorage.getItem(this.timeoutMSKey));
                }
            } catch(e) {
                // Mute the exception when there are no localStorage feature available
                return 0;
            }
        }
        this.setSurveyTimeoutMS = function(ms) {
            try {
                localStorage.setItem(this.timeoutMSKey, ms);
            } catch(e) {
                // Mute the exception when there are no localStorage feature available
            }
        }
        this.isAvailable = function() {
            try {
                localStorage.setItem("test", "test");
                localStorage.removeItem("test");
                return true;
            } catch(e) {
                return false;
            }
        }
    }

    // Initliaze localstorage object
    var localStorageService = new LocalStorageService();

    // HTTP service for survey listing and posting
    function InAppSurveyService() {
        this.getCookie = function(name) {
            var cookieValue = null;
            if (document.cookie && document.cookie !== '') {
                var cookies = document.cookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = jQuery.trim(cookies[i]);
                    // Does this cookie string begin with the name we want?
                    if (cookie.substring(0, name.length + 1) === (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        };
        this.getSurvey = function(customParams, callback) {
            // Get new announcement/campaign
            // TODO:
            // 1) Can we not use "inapp_survey" as hard coded value here, and make it dynamic
            // 2) Handle request failure or exceptions
            jQuery.ajax({
                url: "/inapp_survey/api/campaigns/",
                type: 'POST',
                headers: { "X-CSRFToken": this.getCookie("csrftoken") },
                data: JSON.stringify({"custom_params": customParams, "completed_campaigns":localStorageService.getSurveyIds()}),
                contentType: "application/json",
                success: function(result){
                    callback(result);
                }
            });
        };
        this.submitSurvey = function(data, callback) {
            jQuery.ajax({
                url: '/inapp_survey/api/response/',
                type: 'POST',
                headers: { "X-CSRFToken": this.getCookie("csrftoken") },
                data: JSON.stringify(data),
                contentType: "application/json",
                success: function(result){
                    callback(result);
                }
            });
        };
    }

    // Overlay element
    function InAppOverlay () {
        var _overlayElement = $($('#django-inapp-survey-overlay-template').html());
        this.show = function() {
            $('body').append(_overlayElement);
            // For animation
            _overlayElement.hide();
            _overlayElement.fadeIn();
        };
        this.remove = function() {
            // Animate and remove
            _overlayElement.fadeOut('normal', function(){
                _overlayElement.remove();
            });
        };
    }

    // Announcement element
    function InAppAnnouncement () {
        var _announcementElement = $($('#django-inapp-survey-announcement-template').html()),
        _announcementTextHolder = _announcementElement.find('.django-inapp-survey-announcement'),
        _onClickCallBack,
        _onCloseCallBack,
        _self = this;

        function _setupevents() {
            // To set close button click listener
            _announcementElement.find('.django-inapp-survey-close').click(function(e){
                e.stopPropagation();
                // Call the closeCallback
                if(_onCloseCallBack) {
                    _onCloseCallBack();
                }
            });

            // Onclick callback
            _announcementElement.click(function(){
                if(_onClickCallBack) {
                    _onClickCallBack();
                }
            });
        }

        this.show = function(announcement) {
            _announcementTextHolder.html(convertMarkdownToHtml(announcement));
            $('body').append(_announcementElement);
            _announcementElement.hide();
            _announcementElement.slideDown();
            _setupevents();
        };
        this.remove = function() {
            _announcementElement.slideUp('normal', function(){
                _announcementElement.remove();
            });
        };

        this.onClose = function(callback) {
            _onCloseCallBack = callback;
        };

        this.onClick = function(callback) {
            _onClickCallBack = callback;
            _announcementElement.addClass('campaign');
        };
    }

    // Campaign element
    function InAppCampaign (surveyObj) {
        var _campaignElement = $($('#django-inapp-survey-campaign-template').html()),
        _surveyForm = _campaignElement.find('form'),
        _currentStepDisplay = _campaignElement.find('.current-step'),
        _previousButton = _campaignElement.find('.previous-button'),
        _nextButton = _campaignElement.find('.next-button'),
        _submitButton = _campaignElement.find('.submit-button'),
        _surveyObj = surveyObj,
        _stepNo = 1,
        _totalSteps = _surveyObj.steps.length,
        _onCloseCallBack,
        _self = this,
        _activeQuestionObject,
        _announcementEle = new InAppAnnouncement(),
        _inAppOverlayEle = new InAppOverlay();

        // Listen for markdown conversion event
        document.addEventListener('django-inapp-survey-markdown-conversion', function(e) {
            _activeQuestionObject = e.detail;
        });

        //
        _campaignElement.find('.total-step').html(_totalSteps);
        if(_totalSteps <= 1) {
            _campaignElement.find('.step-progress').hide();
        }

        // When the announcement section is closed
        _announcementEle.onClose(function(){
            if(_onCloseCallBack) {
                _onCloseCallBack([], false);
            }
            _announcementEle.remove();
        });

        _announcementEle.onClick(function(){
            // Expand the survey
            _hideAnnouncement();
            _showCampaign();
        });

        function _showCampaign() {
            // To show overlay
            _inAppOverlayEle.show();

            $('body').append(_campaignElement);
            // For Animation
            _campaignElement.hide();
            _campaignElement.fadeIn();

            // To set close button click listener
            _campaignElement.find('.django-inapp-survey-close').click(function(){
                _self.remove();
                _showAnnouncement();
            });

            _previousButton.click(function(){
                _onPreviousClick();
            });

            _nextButton.click(function(){
                _surveyForm.submit();
            });

            _submitButton.click(function(){
                _surveyForm.submit();
            });

            _surveyForm.submit(function(event) {
                var dataArray = $(this).serializeArray();
                if(!this.checkValidity())
                {
                    if(!(_activeQuestionObject.type === 'checkbox' && dataArray.length && dataArray[0].value)) {
                        // Diallow unanswered questions
                        event.preventDefault();
                        return;
                    }
                }

                var userAnswer = [];
                for (var i=0; i<dataArray.length; i++) {
                    if(dataArray[i].name === _activeQuestionObject.questionId) {
                        userAnswer.push(dataArray[i].value);
                    }
                }
                _activeQuestionObject.userAnswer = _activeQuestionObject.type === 'checkbox'? userAnswer: userAnswer[0];
                _surveyObj.steps[_stepNo-1].response = _activeQuestionObject;
                if(_stepNo === _totalSteps) { // last step
                    var answers = [];
                    for(var i=0; i < _surveyObj.steps.length; i++) {
                        var step = _surveyObj.steps[i];
                        answers[i] = {
                            "question": step.id,
                            "response": step.response.userAnswer.constructor === Array? step.response.userAnswer.join(','): step.response.userAnswer //JSON.stringify(step.response)
                        };
                    }
                    _onCloseCallBack(answers, true);
                } else {
                    _activeQuestionObject = undefined;
                    _onNextClick();
                }
                return false;
            });

            // Setup step 1
            _stepNo = 1;
            _goToStep(1);
        }

        function _goToStep(stepNo) {
            _currentStepDisplay.html(stepNo);
            _surveyForm.html(
                convertMarkdownToHtml(_surveyObj.steps[stepNo-1].question)
            );

            // Setup buttons based on current step number
            if(stepNo === 1) {
                _previousButton.hide();
            } else {
                _previousButton.show();
            }
            if(stepNo === _totalSteps) {
                _submitButton.show();
                _nextButton.hide();
            } else {
                _nextButton.show();
                _submitButton.hide();
            }

            // Fill the value
            var oldAns = _surveyObj.steps[_stepNo-1].response;
            if(oldAns && oldAns.userAnswer) {
                var ans = oldAns.userAnswer;
                if(oldAns.type === 'radio') {
                    ans = [ans];
                }
                _surveyForm.find("[name='" + oldAns.questionId + "']").val(ans);
            }
        }

        function _onPreviousClick() {
            _stepNo--;
            _goToStep(_stepNo);
        }

        function _onNextClick() {
            _stepNo++;
            _goToStep(_stepNo);
        }

        function _showAnnouncement() {
            _announcementEle.show(_surveyObj.description);
        }
        function _hideAnnouncement() {
            _announcementEle.remove();
        }

        this.onClose = function(callback) {
            _onCloseCallBack = callback;
        };

        this.show = function() {
            _showAnnouncement();
        };

        this.remove = function() {
            _campaignElement.slideUp('fast', function(){
                _campaignElement.remove();
            });
            // To remove overlay
            _inAppOverlayEle.remove();
        };
    }

    // Success element
    function InAppSuccess () {
        var _successElement = $($('#django-inapp-survey-success-template').html()),
        _self = this,
        _inAppOverlayEle = new InAppOverlay();

        // $.parseHTML('<div class="django-inapp-survey-overlay"></div>');
        this.show = function() {
            _inAppOverlayEle.show();
            $('body').append(_successElement);
            // For Animation
            _successElement.hide();
            _successElement.slideDown();

            setTimeout(function () {
                _self.remove();
            }, 1200);
        };
        this.remove = function() {
            _successElement.slideUp('normal', function(){
                _successElement.remove();
            });
            _inAppOverlayEle.remove();
        };
    }

    function initiateSurvey() {
        var inAppSurveyService = new InAppSurveyService(),
        customParams = inappSurveyParams.customParams,
        userId = inappSurveyParams.userId,
        isAuthenticated = inappSurveyParams.isAuthenticated,
        surveyObj;
        inAppSurveyService.getSurvey(customParams, function(result){
            if(result) {
                surveyObj = result;
                if(surveyObj.campaign_type === "announcement") {
                    var announcement = new InAppAnnouncement();
                    announcement.show(surveyObj.description);
                    announcement.onClose(function(){
                        if(!isAuthenticated) {
                            var localStorageService = new LocalStorageService()
                            localStorageService.addSurveyId(surveyObj.id);
                            announcement.remove();
                            return;
                        }
                        var data = {
                            "user": userId,
                            "campaign": surveyObj.id,
                            "is_completed": true,
                            "is_canceled": false,
                            "answers": []
                        }
                        inAppSurveyService.submitSurvey(data, function(result){
                            // TODO: Exception handeling
                            // announcement.remove();
                        });
                        // Remove announcement as soon as the API request is submitted
                        announcement.remove();
                        // Initiate the next campaign timer
                        resetTimer();
                    });
                } else if(surveyObj.campaign_type === "survey" && isAuthenticated) {
                    var campaign = new InAppCampaign(surveyObj);
                    campaign.show();
                    campaign.onClose(function(answer, isCompleted){
                        var data = {
                            "user": userId,
                            "campaign": surveyObj.id,
                            "is_completed": true,
                            "is_canceled": !isCompleted,
                            "answers": answer
                        }
                        inAppSurveyService.submitSurvey(data, function(result){
                            // TODO: Exception handeling
                            // campaign.remove();
                            // if(isCompleted) {
                            //     var inappSuccessEle = new InAppSuccess();
                            //     inappSuccessEle.show();
                            // }
                        });
                        // Remove campaign as soon as the API request is submitted
                        campaign.remove();
                        if(isCompleted) {
                            var inappSuccessEle = new InAppSuccess();
                            inappSuccessEle.show();
                        }
                        // Initiate the next campaign timer
                        resetTimer();
                    });
                }
            }
        });
    }

    // Timer to handle the survey showup based on timeout
    var TIME_TO_SHOW_CAMPAIGN = 300 * 1000; // 5 min;
    var timerIntervel = 2000;
    var isLocalStorageAvailable = localStorageService.isAvailable();
    function intializeTimer() {
        if(isLocalStorageAvailable) {
            if(localStorageService.getSurveyTimeoutMS() === 0) {
                localStorageService.setSurveyTimeoutMS(TIME_TO_SHOW_CAMPAIGN);
            }
            var timer = setInterval(function() {
                var timeoutSec = localStorageService.getSurveyTimeoutMS();
                timeoutSec -= timerIntervel;
                if(timeoutSec <= 0) {
                    // Clear the interval when there are no campaign
                    clearInterval(timer);
                    // Initialize the survey
                    initiateSurvey();
                    // Reset the time
                    timeoutSec = -9999;
                }
                localStorageService.setSurveyTimeoutMS(timeoutSec);
            }, timerIntervel);
        } else {
            initiateSurvey();
        }
    }

    function resetTimer() {
        // Initiate the next campaign timer
        localStorageService.setSurveyTimeoutMS(TIME_TO_SHOW_CAMPAIGN);
        intializeTimer();
    }
    // Intialize the timer after a sec
    setTimeout(intializeTimer, 800);

})(jQuery);
