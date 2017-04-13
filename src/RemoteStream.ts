import {AbstractElement} from "./AbstractElement";
import {Primitive} from "./Shared";

type Method = "GET" | "POST" | "PUT";

export class RemoteStream {

    protected subscribers: Array<AbstractElement<any>> = [];
    protected baseURL: string;

    get(queryParams?: {[param: string]: Primitive}): void {
        let queryStr = queryParams == null ? "" : "?";

        for (let key in queryParams) {
            queryStr += "&";
            queryStr += key;
            queryStr += "=";
            queryStr += queryParams[key].toString();
        }

        this.send("GET", this.baseURL + queryStr);
    }

    post(data: any): void {
        this.send("POST", this.baseURL, data);
    }

    protected send(method: Method, url: string, data?: any): void {
        // const request = new XMLHttpRequest();
        // let self = this;
        // request.onload = function (this: XMLHttpRequest, ev: Event): void {
        //     const parsed = JSON.parse(this.responseText);
        //     console.log(parsed);
        //     for (let subscriber of self.subscribers)
        //         subscriber.
        // };
        //
        // request.open(method, url, true);
        // if (method === "POST" || method === "PUT")
        //     request.setRequestHeader("Content-Type", "application/json");
        // request.send(JSON.stringify(data));
    }

}