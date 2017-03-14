var threadghostsArray = [];
var threadsArray = [];
var iterationTime = 85;
var threadsMoving = 0;

const socket = io('http://88.112.159.13:3000');
var appid = "696969";

// Updates thread positions
function rearrangeThread(element, index)
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
    /*
    var newthreadghost = document.createElement("div");
    var newthread = document.createElement("div");
    var threadfield = document.getElementById("threadfield");
    var text = threadtext;

    newthread.id = "thread " + threadsArray.length;
    newthreadghost.id = "threadghost " + threadghostsArray.length;

    threadsArray.push(newthread);
    threadghostsArray.push(newthreadghost);

    newthreadghost.appendChild(document.createTextNode(text));
    newthread.appendChild(document.createTextNode(text));

    newthreadghost.className = "threadghost";
    newthread.className = "thread";

    threadfield.insertBefore(newthreadghost, threadfield.firstChild);
    threadfield.insertBefore(newthread, threadfield.firstChild);
    rearrangeThreadsInit();

    $(newthread).fadeIn();
    */
    
    // ###################################################################
    var text = data.text;
    var name = data.name;

    var newthread = document.createElement("div");
    var newthreadname = document.createElement("div");
    var newthreadmessage = document.createElement("div");

    var threadfield = document.getElementById("threadfield");

    newthread.className = "thread";
    newthreadname.className = "threadname";
    newthreadmessage.className = "threadmessage";

    newthread.id = "thread " + threadsArray.length;
    
    newthread.appendChild(newthreadname);
    newthread.appendChild(newthreadmessage);
    newthreadname.appendChild(document.createTextNode(name));
    newthreadmessage.appendChild(document.createTextNode(text));

    threadsArray.push(newthread);

    threadfield.insertBefore(newthread, threadfield.firstChild);
    // ###################################################################

    var newthreadghost = document.createElement("div");
    var newthreadnameghost = document.createElement("div");
    var newthreadmessageghost = document.createElement("div");

    newthreadghost.className = "threadghost";
    newthreadnameghost.className = "threadnameghost";
    newthreadmessageghost.className = "threadmessageghost";

    newthreadghost.id = "threadghost " + threadghostsArray.length;

    newthreadghost.appendChild(newthreadnameghost);
    newthreadghost.appendChild(newthreadmessageghost);
    newthreadmessageghost.appendChild(document.createTextNode(text));
    newthreadnameghost.appendChild(document.createTextNode(name));

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

// The loopty loop for the thread arranger
function rearrangeThreadsInit()
{
    // Slightly faster loopty loop than anything else
    var i = 0;
    var e = threadsArray.length;
    while(e--)
    {
        rearrangeThread(threadsArray[i], i);
        i++;
    }
}

function initSocket()
{
    /*
    socket.on('connect', function() 
    {
        socket.emit('app_id', appid);
    });
    */
    console.log("Joining chat room: " + appid);
    socket.emit('app_id', appid);
    
    socket.on("message", function(data)
    {
        // When someone makes a new thread, do this on your client
        makeNewThread(data);
    })
}

function postMessage()
{
    var msg = {};
    msg.app_id = appid;
    msg.name = getCookie("Username");
    msg.text = $("#joonas").val();
    socket.json.emit("message", msg);   // Send message to all connected clients
    $("#joonas").val("");
    makeNewThread(msg);
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

//  Get cookie parameter and output it
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// Start the page here
function initPage()
{
    //##############################################################
    // When new comment is submitted and you press ENTER
    document.getElementById("postbutton").addEventListener("click", postMessage);
    $("#joonas").keypress(function(event)
    {
        if(event.keyCode == 13)
        {
            event.preventDefault();
            if($("#joonas").val() != "") {postMessage();}
        }
    })
    //##############################################################

    rearrangeThreadsInit();
    getUserInfo();
    initSocket();
}

initPage();
