import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { Config } from '../../config';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/share';


@Injectable()
export class HttpService {
    private progress: number = 0;

	constructor (private http: Http) {
		let headers = new Headers({ 'Content-Type': 'application/json'});
		let options = new RequestOptions({ headers: headers });

		headers.append('X-Security-Token', this.token);
		
        this.options = options;
	};

	private baseUrl = Config.baseUrl;

	private options: RequestOptions;

	set token(token:string) {
		localStorage.setItem('securityToken', token);

		let headers = new Headers({ 'Content-Type': 'application/json'});
		let options = new RequestOptions({ headers: headers });

		headers.append('X-Security-Token', this.token);
			
		this.options = options;
	};

	get token():string {
		return localStorage.getItem('securityToken');
	};

	get (url:string, options?: RequestOptionsArgs) {
		return this.http.get(this.baseUrl + url, this.options);
	};

	post (url: string, body: string, options?: RequestOptionsArgs) {
		return this.http.post(this.baseUrl + url, body, this.options);
	};

	put (url: string, body: string, options?: RequestOptionsArgs) {
		return this.http.put(this.baseUrl + url, body, this.options);
	};

	delete(url: string, body: string, options ? : RequestOptionsArgs) {
        if (body) {
            let requestOptions = new RequestOptions(this.options);
            requestOptions.body = body
            return this.http.delete(this.baseUrl + url, requestOptions);
        }
        return this.http.delete(this.baseUrl + url, this.options);
    };

    public testGet (url:string) {
        return this.http.get(url);
    };

    public fileUpload(url: string, file: File): Promise<any> {

        url = this.baseUrl + url;

        return new Promise((resolve, reject) => {
            let formData: FormData = new FormData(),
                xhr: XMLHttpRequest = new XMLHttpRequest();
            formData.append('uploadFile', file, file.name);

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        //resolve('Upload succeeded. ' + xhr.response);
                        resolve( xhr.response);
                    } else {
                        reject(xhr.response);
                    }
                }
            };

            HttpService.setUploadUpdateInterval(500);

            xhr.upload.onprogress = (event) => {
                this.progress = Math.round(event.loaded / event.total * 100);
            };

            xhr.open('POST', url, true);
            xhr.send(formData);
        });
    }
    private static setUploadUpdateInterval(interval: number): void {
        setInterval(() => { }, interval);
    }
}
