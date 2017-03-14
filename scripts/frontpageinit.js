var threadghostsArray = [];
var threadsArray = [];
var iterationTime = 85;
var count = 0;

//##############################################################
// When new comment is submitted and you press ENTER
function topicButton()
{
    // We run 3 "simultaneous calls to increase speed, 4 breaks the API"
    getTopic();
    count++;
    getTopic();        
    count++;
    getTopic();        
    count++;
}

function getTopic()
{
            var txt = threadsArray[count].getElementsByClassName("threadtext")[0].innerHTML;
            txt = txt.replace(/[^a-zA-Z\s]+/g, ''); // Get only letters and spaces

            txt = '{"text":"' + txt + '"}';
            txt = JSON.parse(txt);

            //console.log(txt);

            // When done, do "done"
            $.post("/topic_search", txt).done(function(data)
            {
                // If no errors, do this
                if(data.code != 13)
                {
                    console.log("You reached your daily limit: 1000 API calls");                                    
                }
                else
                {
                    threadsArray[count].getElementsByClassName("threadname")[0].innerHTML = data;   // Change the thread topic to the processed topic
                    count++;    // Iterate how manyth thread we've processed
                    getTopic();    
                }
            });
}
//##############################################################
// Updates thread positions (DON'T USE THIS FUNCTION ANYWHERE ELSE!!!!!!!)

function rearrangeThreads(element, index)
{
    var threadlen = threadsArray.length;
    var itertime = iterationTime;

    if(index == threadlen - 1){itertime = 0;}

    setTimeout(function ()
    {
        // Offset the thread coordinates based on where they are relative to the page
        var offsetcoords = getCoords(threadghostsArray[index]);
        element.style.top = 0;
        
        var elem = element; // Element to animate
        var rect = document.getElementById("threadghost " + index).getBoundingClientRect(); // Current position of said element
        var bodyRect = document.body.getBoundingClientRect();
        var threadfield = document.getElementById("threadfield").getBoundingClientRect();
        var coordx = rect.left - bodyRect.left - threadfield.left;
        var coordy = offsetcoords.top;

        var trans = Morf.transition(elem, {
                // New CSS state
                                            '-webkit-transform': 'translate3d(' + coordx + 'px, ' + coordy + 'px, 0)',
                                        }, {
                                            duration: '500ms',
                                            timingFunction: 'ease',
                                            increment: 0.4,
                                            callback: function (elem) {
                                                // You can optionally add a callback option for when the animation completes.
                                            }
                                        });
    }, itertime * (Math.random() * 3) + 1);

    itertime = iterationTime;
}

function makeNewThread(data)
{
    var text = data.text;
    var title = data.title;
    var imgurl = data.imgurl;
    var permalink = data.permalink;

    var newthread = document.createElement("div");
    var newthreadname = document.createElement("div");
    var newthreadmessage = document.createElement("div");
    var newthreadtext = document.createElement("p");
    var newthreadimage = document.createElement("img");

    var threadfield = document.getElementById("threadfield");

    newthread.className = "thread";
    newthreadname.className = "threadname";
    newthreadmessage.className = "threadmessage";
    newthreadimage.className = "threadthumbnail";
    newthreadtext.className = "threadtext";

    newthread.id = "thread " + threadsArray.length;
    
    newthread.appendChild(newthreadname);
    newthread.appendChild(newthreadmessage);
    newthreadmessage.appendChild(newthreadimage);
    newthreadmessage.appendChild(newthreadtext);
    newthreadname.appendChild(document.createTextNode(title));
    newthreadtext.innerHTML = text;
    newthread.addEventListener("click", function(){location.replace("http://www.reddit.com/" + permalink)});
    newthreadimage.src = imgurl;

    threadsArray.push(newthread);

    threadfield.insertBefore(newthread, threadfield.firstChild);

    // ###################################################################

    var newthreadghost = document.createElement("div");
    var newthreadnameghost = document.createElement("div");
    var newthreadmessageghost = document.createElement("div");
    var newthreadimageghost = document.createElement("img");
    var newthreadtextghost = document.createElement("p");

    newthreadghost.className = "threadghost";
    newthreadnameghost.className = "threadnameghost";
    newthreadmessageghost.className = "threadmessageghost";
    newthreadimageghost.className = "threadthumbnail";
    newthreadtextghost.className = "threadtextghost";

    newthreadghost.id = "threadghost " + threadghostsArray.length;

    newthreadghost.appendChild(newthreadnameghost);
    newthreadghost.appendChild(newthreadmessageghost);
    newthreadmessageghost.appendChild(newthreadimageghost);
    newthreadmessageghost.appendChild(newthreadtextghost);
    newthreadtextghost.innerHTML = text;
    newthreadnameghost.appendChild(document.createTextNode(title));
    newthreadimageghost.src = imgurl;

    threadghostsArray.push(newthreadghost);

    threadfield.insertBefore(newthreadghost, threadfield.firstChild);

    rearrangeThreadsInit();

    $(newthread).fadeIn();
}

// Get element coordinates in relation to the page
function getCoords(elem) 
{ 
    // crossbrowser version
    var box = elem.getBoundingClientRect();

    var body = document.body;
    var docEl = document.documentElement;

    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    var clientTop = docEl.clientTop || body.clientTop || 0;
    var clientLeft = docEl.clientLeft || body.clientLeft || 0;

    var top  = box.top + scrollTop - clientTop - document.getElementById('userfield').clientHeight;
    var left = box.left + scrollLeft - clientLeft;

    return { top: Math.round(top), left: Math.round(left) };
}

function getUserFrontPage()
{
    var response = $.ajax(
                {
                    type: "GET",
                    dataType: "json",
                    url: "https://oauth.reddit.com/",
                    headers: 
                    {
                        'Authorization': 'bearer ' + getCookie("access_token")                    
                    },
                    success: function(data)
                    {
                        //console.log("Everything went fine and now rendering subscribed threads!");
                        // Get all the threads the user is subcribed to and render them one by one
                        $.each(response.responseJSON.data.children, function(index, value)
                        {
                            var thread = 
                            {
                                title: value.data.subreddit,
                                text: value.data.title,
                                imgurl: value.data.thumbnail,
                                permalink: value.data.permalink
                            }
                            makeNewThread(thread);    
                        })
                    }
                });
    //console.log(response);    
}

function getUserInfo()
{
    var response = $.ajax(
                {
                    type: "GET",
                    dataType: "json",
                    url: "https://oauth.reddit.com/api/v1/me",
                    headers: 
                    {
                        'Authorization': 'bearer ' + getCookie("access_token")                    
                    },
                    success: function(data)
                    {
                        //console.log("Everything went fine and now rendering user info!");
                        // Rendering the user info now
                        document.getElementById("name").innerHTML = response.responseJSON.name;  // Render nickname
                        document.cookie = "Username=" + response.responseJSON.name
                        document.getElementById("linkkarma").innerHTML = "Link karma: " + response.responseJSON.link_karma;  // Render link karmas
                        document.getElementById("commentkarma").innerHTML = "Comment karma: " + response.responseJSON.comment_karma; // Render comment karmas
                    }
                });
    //console.log(response);    
}

// The loopty loop for the thread arranger (USE THIS TO REARRANGE THE THREADS!!!!!!!)
function rearrangeThreadsInit()
{
    // Slightly faster loopty loop than anything else
    var i = 0;
    var e = threadsArray.length;
    while(e--)
    {
        rearrangeThreads(threadsArray[i], i);
        i++;
    }
}

// Start making the page here
function initPage()
{
    getUserInfo();
    getUserFrontPage();
    rearrangeThreadsInit();
    document.getElementById("topicbutton").addEventListener("click", topicButton);
}