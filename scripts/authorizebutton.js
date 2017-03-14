var authorizebutton = document.getElementById("authorizebutton");
authorizebutton.addEventListener("click", onButtonClick);

var authorizationcode; // The auth code

function onButtonClick()
{
    deleteAllCookies();
    var scopes = "identity edit flair history modconfig modflair modlog modposts modwiki mysubreddits privatemessages read report save submit subscribe vote wikiedit wikiread";
    window.open("https://www.reddit.com/api/v1/authorize?client_id=oz4I-8h8nyfXcg&response_type=code&state=tissit&redirect_uri=http://88.112.159.13:999/authorize_callback&duration=permanent&scope=" + scopes);
}

function deleteAllCookies() {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}