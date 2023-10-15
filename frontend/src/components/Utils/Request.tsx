
function get (path) {
    return MakeRequest('GET', path)
}

function post (path, data?, multipart = false) {
    return MakeRequest('POST', path, data, multipart)
}

function MakeRequest(method, path, data?, multipart = false) {
    const headers = {
        "content-type": "application/json", // a changer selon si POST multipart
        "authorization" : `Bearer ${localStorage.getItem('token')}`
    }
    if (multipart) {
        delete headers['content-type'];
    }
    if (!multipart && data)
        data = JSON.stringify(data);
    return fetch(
        `http://${process.env.REACT_APP_WEB_HOST}:${process.env.REACT_APP_API_PORT}/${path}`,
        {
            method,
            headers,
            body: data
        }
    ).then(response => {
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
            throw new Error();
        }
        if (response.headers.get('content-type').includes('application/json')) {
            return response.json();
        }
        else {
            return response.text()
        }
    }
    ).catch(error => {
    });
}

export {get, post};