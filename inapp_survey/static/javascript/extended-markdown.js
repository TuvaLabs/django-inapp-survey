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
                        function(match, questionMark, questionId, rawQuestion, equalSign, textInd, answer){
                            // To convert the inline styles to html
                            var question = converter.makeHtml(rawQuestion);

                            if(textInd) {
                                textInd = textInd.trim();
                            } else {
                                return match;
                            }

                            var domElement = question;
                            if (textInd === '_') {
                                domElement += '<input required type="text" ' +
                                'name="' + questionId + '" />';
                            } else if (textInd.length > 1) {
                                domElement += '<textarea required rows="' + (textInd.length * 2 + 1) + '" ' +
                                'name="' + questionId + '" ></textarea>';
                            }

                            // Raise event
                            var _inputType = (textInd === '_'? 'text': 'textarea');
                            console.log("_inputType", _inputType);
                            triggerEvent({
                              "question": rawQuestion,
                              "type": _inputType,
                              "questionId": questionId,
                            });

                            return domElement;
                    });
                }
            },
            // For checkbox and radio button
            {
                type: 'lang',
                filter: function (text, converter, options) {
                    return text.replace(/([\\?]) ?\[([0-9a-z_].*?)\] ?\[?(.*?)\]? ?([=]) ?(\[\]|\(\))( ?{[0-9,]+})?([^]*?)(\n\n|^\n)/g,
                        function(match, questionMark, questionId, rawQuestion, equalSign, inputIndicator, answers ,optionsItems, end){
                            // To convert the inline styles to html
                            var question = converter.makeHtml(rawQuestion);

                            var domElement = question;

                            var _inputType = inputIndicator === '[]'? 'checkbox': 'radio';
                            var _optionValues = [];
                            var optionRegEx = (inputIndicator === '[]') ? /^ {0,2}(\[\*?\])[ \t](.*)/gm : /^ {0,2}(\(\*?\))[ \t](.*)/gm;
                            var optionsDom = "";
                            optionsDom += optionsItems.replace(optionRegEx, function (match, type, text) {
                                _optionValues.push(text);
                                var input = '<li><label><input required name="' + questionId + '" type="' + _inputType + '"';
                                input += ' value="' + text + '"/> <span>&nbsp;' + text + '</span></label></li>';
                                return input;
                            });

                            if(optionsDom) {
                                optionsDom = '<ul class="question-options">' + optionsDom + '</ul>';
                            }

                            // Raise event
                            triggerEvent({
                              "question": rawQuestion,
                              "options": _optionValues,
                              "type": _inputType,
                              "questionId": questionId,
                            });

                            return domElement + optionsDom;
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

                    var html = '<img src="' + imageUrl + '" alt="' + altText + '"';

                    html += ' style="max-width: 100%;';
                    if(width > 0 || height > 0) {
                        html += ((width > 0) ? 'width:' + width  + 'px;' : "");
                        html += ((height > 0) ? 'height:' + height  + 'px;' : "");
                        // Set display block when the caption is available
                        if(caption) {
                            html += 'display:block;';
                        }
                    }

                    html += '"/>' + caption;

                    // Set syules for <figure>
                    var figStyle = "text-align:center;";
                    if(align) {
                        figStyle += "float:" + align + ";margin-" + align + ":0;margin-" + (align==='left'?"right":"left") + ":3em;overflow:hidden;";
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

    function triggerEvent(data) {
      var event = new CustomEvent("django-inapp-survey-markdown-conversion",{'detail': data});
      document.dispatchEvent(event);
    }

    // Client-side export
    showdown.extension('inapp-survey-extended', extended);

    function removeCurlyBraces(text) {
        if(text) {
            text = text.trim();
            return text.substring(1, text.length-1);
        } else {
            return "";
        }
    }

}());
