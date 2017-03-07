//
// Extended Showdown Extension
// @author Naveenkumar Ganesan
//

(function () {
    'use strict';

    // Enable support to add Tables
    showdown.setOption('tables', true);
    showdown.setOption('strikethrough', true);

    function getNumberFromString(val) {
        if(isNaN(val)) {
            return 0;
        } else {
            return parseInt(val);
        }
    }

    var extended = function () {
        var imageCount = 0;
        return [
            // To open all link in new tab
            {
                type:   'output',
                regex: '<a(.*?)>',
                replace: function (match, content) {
                   return content.indexOf('mailto:') !== -1 ? '<a' + content + '>' : '<a target="_blank"' + content + '>';
                }
            },
            // Subscripts
            {
                type: 'lang',
                regex: /\^\^(.+?)\^\^/g,
                replace: function (match, value) {
                    return '<sub>' + value + '</sub>';
                }
            },
            // Superscripts
            {
                type: 'lang',
                regex: /\^(.+?)\^/g,
                replace: function (match, value) {
                    return '<sup>' + value + '</sup>';
                }
            },
            // Line Break
            {
                type: 'lang',
                regex: /;;br/g,
                replace: function (match) {
                    return '<br>';
                }
            },
            // Horzontal Line
            {
                type: 'lang',
                regex: /;;hr/g,
                replace: function (match) {
                    return '<hr>';
                }
            },
            // For text and text area
            {
                type: 'lang',
                filter: function (text, converter, options) {
                    return text.replace(/([\\?]) ?\[([0-9a-z_].*?)\] ?\[?(.*?)\]? ?([=]) ?([_]+)( ?{.*})?/g,
                        function(match, questionMark, questionId, question, equalSign, textInd, answer){
                            // To convert the inline styles to html
                            question = converter.makeHtml(question);

                            if(textInd) {
                                textInd = textInd.trim();
                            } else {
                                return match;
                            }

                            var questionObj = {
                                type: textInd === '_'? 'text': 'textarea',
                                question: question,
                                questionId: questionId,
                                answer: removeCurlyBraces(answer)
                            };

                            var domElement = getQuestionHeader(question, questionId);

                            textInd = textInd.trim();

                            if (textInd === '_') {
                                domElement += '<input required style="margin: 5px 0;" type="text" ' +
                                'ng-model="answers[\'' + questionId + '\'].userAnswer" ' +
                                'name="' + questionId + '" id="' + questionId + '" />';
                            }
                            else if (textInd.length > 1) {
                                domElement += '<textarea required style="margin: 5px 0;" rows="' + (textInd.length * 2 + 1) + '" ' +
                                'ng-model="answers[\'' + questionId + '\'].userAnswer" ' +
                                'name="' + questionId + '" id="' + questionId + '"></textarea>';
                            }

                            // Broadcast to controller
                            broadCastQA(questionObj);

                            domElement += getQuestionFooter(questionId);

                            return domElement;
                    });
                }
            },
            // For checkbox and radio button
            {
                type: 'lang',
                filter: function (text, converter, options) {
                    return text.replace(/([\\?]) ?\[([0-9a-z_].*?)\] ?\[?(.*?)\]? ?([=]) ?(\[\]|\(\))( ?{[0-9,]+})?([^]*?)(\n\n|^\n)/g,
                        function(match, questionMark, questionId, question, equalSign, inputIndicator, answers ,optionsItems, end){
                            // To convert the inline styles to html
                            question = converter.makeHtml(question);

                            var questionObj = {
                                type: inputIndicator === '[]'? 'checkbox': 'radio',
                                question: question,
                                questionId: questionId,
                                options: [],
                                answer: removeCurlyBraces(answers)
                            };

                            var domElement = getQuestionHeader(question, questionId);

                            var optionRegEx = (inputIndicator === '[]') ? /^ {0,2}(\[\*?\])[ \t](.*)/gm : /^ {0,2}(\(\*?\))[ \t](.*)/gm;

                            var listCounter = 0;
                            var optionsDom = "";
                            optionsDom += optionsItems.replace(optionRegEx, function (match, type, text) {
                                var input = '<li><label><input type="' + (inputIndicator === '[]'? 'checkbox': 'radio') + '"';
                                // TODO: Adding default checked option
                                /* if(type.indexOf('*') != -1 ) {
                                input += ' checked="checked"';
                            } */

                            if(inputIndicator === '[]') {
                                // Adding ng-required for the first item
                                if(listCounter++ === 0) {
                                    input += ' ng-required="!answers[\'' + questionId + '\'].userAnswer.length"';
                                }
                                input += ' checklist-model="answers[\'' + questionId + '\'].userAnswer"';
                                input += ' checklist-value="\'' + listCounter + '\'"';
                            } else {
                                // Adding ng-required for the first item
                                if(listCounter++ === 0) {
                                    input += ' ng-required="!answers[\'' + questionId + '\'].userAnswer"';
                                }
                                input += ' ng-model="answers[\'' + questionId + '\'].userAnswer"';
                                input += ' value="' + listCounter + '"';
                                input += ' name="' + questionId + '"';
                            }

                            questionObj.options.push(text);

                            input += ' /> <span>&nbsp;' + converter.makeHtml(text).replace('<p>', '').replace('</p>', '') + '</span></label></li>';
                            return input;
                        });

                        if(optionsDom) {
                            optionsDom = '<ul class="question-options">' + optionsDom + '</ul>';
                            domElement += '<div class="options-wrapper" ' +
                            'ng-class="{true:\'invalid\',false:\'\'}[!answers[\'' + questionId + '\'].userAnswer && isFormSubmitted]">' +
                            optionsDom +
                            '</div>';
                        }

                        /*if(questionObj.type === "checkbox" && questionObj.actualAnswerIndex) {
                            questionObj.actualAnswer = [];
                            var answerIndex = questionObj.actualAnswerIndex.split(',');
                            for(var index=0; index < answerIndex.length; index++) {
                                var actualIndex = parseInt(answerIndex[index]);
                                if(actualIndex > 0) {
                                    questionObj.actualAnswer.push(questionObj.answerOptions[actualIndex-1]);
                                    }
                                }
                        } else if(questionObj.type === "radio" && questionObj.actualAnswerIndex) {
                            var actualIndex = parseInt(questionObj.actualAnswerIndex);
                            if(actualIndex > 0) {
                                questionObj.actualAnswer = questionObj.answerOptions[actualIndex-1];
                            }
                        }*/

                        // Broadcast to controller
                        broadCastQA(questionObj);

                        domElement += getQuestionFooter(questionId);

                        return domElement;
                    });
                }
            },
            // For Youtube and Vimeo video
            {
                type: 'lang',
                regex: /(!!)\[(.*?)\]\[(.*?)\]\((.*?)\)/g,
                replace: function (match, exclamationMark, videoProvider, size, videoId) {
                    videoProvider = videoProvider.toLowerCase();
                    var videoSize = size.toLowerCase().split('x'),
                        width = videoSize[0],
                        height = videoSize[1],
                        startTime = 0,
                        endTime = 0,
                        videoURL = "";

                    if(videoId.indexOf(":") > 1) {
                        startTime = videoId.substring(videoId.indexOf(":")+1);
                        // Check for end time
                        if(startTime.indexOf("-") > 1) {
                            endTime = startTime.substring(startTime.indexOf("-") + 1);
                            // Remove end time and assign start time
                            startTime = startTime.substring(0, startTime.indexOf("-"));
                        }

                        // Remove timer from videoId
                        videoId = videoId.substring(0, videoId.indexOf(":"));
                    }

                    // Fix numbers
                    width = getNumberFromString(width) || 560;
                    height = getNumberFromString(height) || 315;
                    startTime = getNumberFromString(startTime);
                    endTime = getNumberFromString(endTime);

                    if(videoProvider === "youtube") {
                        videoURL = 'https://www.youtube.com/embed/' + videoId + '?rel=0' + (startTime? '&start=' + startTime: '') + (endTime? '&end=' + endTime: '');

                        return '<iframe width="' + width + '" height="' + height + '" src="' + videoURL + '" frameborder="0" allowfullscreen></iframe>';
                    } else if(videoProvider === "vimeo") {
                        // Vimeo support only start time
                        videoURL = 'https://player.vimeo.com/video/' + videoId + (startTime? '#t=' + startTime: '') + '?color=ffffff&title=0&byline=0&portrait=0';

                        return '<iframe width="' + width + '" height="' + height + '" src="' + videoURL + '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
                    } else {
                        return match;
                    }
                }
            },
            // For full screen image view
            {
                type: 'lang',
                regex: /(!)\[(.*?)\]\[(.*?)\]\((.*?)\)/g,
                replace: function (match, exclamationMark, altText, _size, imageUrl) {
                    var size;
                    var align = "";
                    if(_size.indexOf(':') > 1) {
                        size = _size.substring(0, _size.indexOf(':'));
                        align = _size.substring(_size.indexOf(':')+1);
                        switch(align) {
                            case 'l':
                                align = "left";
                                break;
                            case 'r':
                                align = "right";
                                break;
                            default:
                                align = "";
                                break;
                        }
                    } else {
                        size = _size;
                    }
                    size = size.toLowerCase().split('x');

                    var width = size[0] || 0,
                    height = size[1] || 0,
                    title = "";

                    imageCount++;

                    // Fix numbers
                    width = getNumberFromString(width);
                    height = getNumberFromString(height);

                    if(imageUrl.indexOf('"') > 0) {
                        title = imageUrl.substring(imageUrl.indexOf('"') + 1, imageUrl.length-1);
                        imageUrl = imageUrl.substring(0, imageUrl.indexOf('"'));
                    }

                    // Set caption when the title is set
                    var caption = "";
                    if(title) {
                        caption += '<figcaption style="text-align:left;background-color:#494949;padding:5px 10px;color:#fff;margin-bottom:10px;">' + title + '</figcaption>';
                    }

                    var html = '<a style="cursor:-webkit-zoom-in;cursor:-moz-zoom-in;cursor:-ms-zoom-in;" href="javascript:showImageModal(\'' + imageUrl  + '\', \'' + altText  + '\', \'' + title  + '\')">';
                    html += '<img style="max-width: 100%;" src="' + imageUrl + '" alt="' + altText + '"';

                    if(width > 0 || height > 0) {
                        html += 'style="';
                        html += ((width > 0) ? 'width:' + width  + 'px;' : "");
                        html += ((height > 0) ? 'height:' + height  + 'px;' : "");
                        // Set display block when the caption is available
                        if(caption) {
                            html += 'display:block;';
                        }
                        html += '"';
                    }

                    html += '/></a>' + caption;

                    // Set syules for <figure>
                    var figStyle = "text-align:center;";
                    if(align) {
                        figStyle += "float:" + align + ";margin-" + align + ":0;margin-" + (align==='left'?"right":"left") + ":5%;width:45%;overflow:hidden;";
                    } else {
                        if(width > 0) {
                            figStyle += "width:" + width + 'px;';
                        }
                        figStyle += "margin:auto;";
                    }
                    html = '<figure style="' + figStyle + '">' + html + '</figure>';
                    return html;
                }
            },
            // For enhanced quote or Answer Tag
            {
                type: 'lang',
                filter: function (text, converter, options) {
                    return text.replace(/(!-{3})([^]*?)(-{3}!)( ?{.*})?/g, function (match, startMatch, content, endMatch, styles) {
                        styles = styles || "";
                        // Remove the curly braces
                        if(styles) {
                            styles = styles.replace(/{/g,'').replace(/}/g,'');
                        }

                        // 1) Add green border and white background when the styles are not given in the markdown tag
                        // 2) If styles are given in the markdown tag and it has styles for border-color then override the default green border with the border-color given in the markdown tag and append additional given styles
                        // 3) If there is no border-color in the markdown tag styles then skip the border and background properties and set the styles was given in the markdown tag as it is. (In this case the following if condition will fail)
                        if(!styles || styles.indexOf('border-color') >= 0) {
                            styles = 'background-color:#fff;padding: 10px;border: 1px solid green;border-radius: 5px;margin: 10px 0 30px;' + styles;
                        }

                        return '<div' + (styles?' style="' + styles + '"':'') +'>' + converter.makeHtml(content) + '</div>';
                    });
                }
            }
        ];
    };

    // Client-side export
    showdown.extension('extended', extended);

    function getQuestionHeader(question, questionId) {
        var domElement = '<div class="question-wrapper" ' +
        'ng-class="{\'green\':answers[\'' + questionId + '\'].isCorrect, \'red\':!answers[\'' + questionId + '\'].isCorrect, \'lesson-review\': isReviewing() && !!answers[\'' + questionId + '\'].answer}">' +
        '<div class="question">' +
        '<div class="question-label"><i class="result-indicator glyphicon" ' +
        'ng-class="{true:\'glyphicon-ok\', false: \'glyphicon-remove\'}[!!answers[\'' + questionId + '\'].isCorrect]">&nbsp;</i>';
        if(question) {
            domElement += '<span>' + question.replace('<p>', '').replace('</p>', '') + '</span>';
        }
        domElement += '</div>';

        return domElement;
    }

    function getQuestionFooter(questionId) {
        var domElement = '</div>' +
        '<div ng-if="isReviewing() && !!answers[\'' + questionId + '\'].answer && !answers[\'' + questionId + '\'].isCorrect">' +
        '<b>Correct Answer:</b> '+
        '<span class="answer" ng-bind-html="getActualAnswer(answers[\'' + questionId + '\'])"></span>' +
        '</div>' +
        '</div>';

        return domElement;
    }

    function broadCastQA(question) {
        if(question) {
            if(question.answer) {
                if(question.type === "checkbox") {
                    question.answer = question.answer.split(",");
                }
            } else {
                delete question.answer;
            }

            var appElement = document.querySelector('[ng-app]'); //="com.tuvalabs.courses"
            if(appElement) {
                var appScope = angular.element(appElement).scope();
                appScope.$broadcast("QA", question);
            }
        }
    }

    function removeCurlyBraces(text) {
        if(text) {
            text = text.trim();
            return text.substring(1, text.length-1);
        } else {
            return "";
        }
    }

}());
