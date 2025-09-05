let usernameField = document.getElementById('username')
let passwordField = document.getElementById('password')
let loginHeaderNav = document.getElementById('loginOrAccountNav')
let errorLoginText = document.getElementById('errorLoginText')
let rememberMe = document.getElementById('rememberMe')
let data = localStorage.getItem("diagonal_dinosaur_user")
let tryLogin = false;
let username = null;
let refreshToken = null;
let token = null;
let authenticatedUser = false;
if (data != null) {
    try {
        let dataObject = JSON.parse(data);
        if (dataObject.username != undefined && dataObject.token != undefined) {
            username = dataObject.username;
            token = dataObject.token;
            tryLogin = true;
            if (dataObject.refreshToken != undefined) {
                refreshToken = dataObject.refreshToken;
            }
        }

    } catch (e) {

    }
}
if (tryLogin) {
    fetch('/api/login/validateToken', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username, sessionToken: token })
    }).then(async function (res) {
        const content = await res.json();
        writeLog(res, "/validateToken");
        writeLog(content, "/validateToken");
        if (res.status == 200 && res.ok == true) {
            authenticatedUser = true;
            setHeaderText();
        } else {
            if (refreshToken != null) {
                fetch('/api/login/refreshToken', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username: username, refreshToken: refreshToken })
                }).then(async function (res) {
                    writeLog(res, "/refreshToken");
                    const content2 = await res.json();
                    writeLog(content2, "/refreshToken");
                    if (res.status == 200 && res.ok == true && content2.sessionToken != undefined && content2.refreshToken != undefined) {
                        data = {
                            username: username,
                            token: content2.sessionToken,
                            refreshToken: content2.refreshToken
                        };
                        localStorage.setItem("diagonal_dinosaur_user", JSON.stringify(data));
                        authenticatedUser = true;
                        setHeaderText();
                    } else {
                        localStorage.removeItem("diagonal_dinosaur_user");
                    }
                });
            } else {
                localStorage.removeItem("diagonal_dinosaur_user");
            }
        }
    });
}

function setHeaderText() {
    // set the header button
    loginHeaderNav.children[0].innerHTML = "Dashboard"
    loginHeaderNav.children[0].href = "/dashboard"
    if (loginHeaderNav.children[0].classList.contains("active")) {
        location.href = "/dashboard";
    }
}