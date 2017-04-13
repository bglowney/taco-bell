"use strict";
class RemoteStream {
    constructor() {
        this.subscribers = [];
    }
    get(queryParams) {
        let queryStr = queryParams == null ? "" : "?";
        for (let key in queryParams) {
            queryStr += "&";
            queryStr += key;
            queryStr += "=";
            queryStr += queryParams[key].toString();
        }
        this.send("GET", this.baseURL + queryStr);
    }
    post(data) {
        this.send("POST", this.baseURL, data);
    }
    send(method, url, data) {
    }
}
exports.RemoteStream = RemoteStream;
