
function get (path) {
    return MakeRequest('GET', path)
}

function post (path, data, multipart = false) {
    return MakeRequest('POST', path, data, multipart)
}

function MakeRequest(method, path, data = null, multipart = false) {
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
        console.log(error);
    });
}

export {get, post};

/*
*
* get (path) {
*   return makeRequest('GET', path)
* }
*
* post (path, data) {
*   return makeRequest('POST', path, data)
* }
*
* put (path, data) {
*   return makeRequest('PUT', path, data)
* }
*
* ...
*
* makeRequest (method, path, data = null) {
*   const headers = {
*      "content-type": "application/json", // a changer selon si POST multipart
*      "authorization" : `Bearer ${localstore.get('token')}`
* }
*   const response = await fetch(
*   `http://${process.env.host}:${process.env.port}/${path}`,
*   {
*       method,
*       headers,
*       body: null // logique a gerer en fonction du type de post (multiform/part ou json etc)
*   });
*
*   if (!response.ok) {
*          throw new Error();
*   }
*
*   if (response.headers.get('content-type').includes('application/json')) {
*       return response.json();
*   } else {
*       return response.text()
*   }
*   return null;
* }
* */